angular.module('dorrbell').service("GoogleService", function(Log, $cordovaGeolocation, $q){
	this.toAddress = function(street, city, state, zip){
		return street + ' ' + city + ', ' + state + ' ' + zip;
	}

	this.geocodeAddress = function(street, city, state, zip){
		var that = this;
		return $q(function(resolve, reject){
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({'address' : that.toAddress(street, city, state, zip)}, function(results, status){
				if(status == google.maps.GeocoderStatus.OK){
					resolve(results);
				}else{
					reject(status);
				}
			});
		});
	}

	this.getCoordinates = function(){
		return $q(function(resolve, reject){
			$cordovaGeolocation.getCurrentPosition({
				timeout: 10000,
				enableHighAccuracy : true
			}).then(function(position){
				resolve(position.coords);
			}, function(err){
				reject(err);
			});
		});
	}

	this.watchPosition = function(){
		var watchOptions = {
			timeout : 3000,
			enableHighAccuracy: false // may cause errors if true
		};
		return $cordovaGeolocation.watchPosition(watchOptions);
	}

	this.getCurrentLocation = function(callback, error){
		$cordovaGeolocation.getCurrentPosition({
			timeout: 10000,
			enableHighAccuracy : true
		}).then(function(position){
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({
				"location" : new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
			}, function(results, status){
				if (status == google.maps.GeocoderStatus.OK)
					callback(results[0].formatted_address);
				else
					error(status);
			});
		}, function(err){
			console.log(err);
		});
	}
});

angular.module('dorrbell').service("JSUtils", function($filter){
	this.getDescendantProp = function(obj, desc, currency){
		var arr = desc.split(".");
	    while(arr.length && (obj = obj[arr.shift()]));
	    if(currency)
	    	return $filter('currency')(obj);
	    else
	    	return obj;
	},
	this.hasId = function(obj, recId){
		var prop = "Id";
		for (var p in obj) {
	        if (obj.hasOwnProperty(p)) {
	            if (typeof obj[p] == "string" && obj[p].length > 14 && (obj[p] == recId || obj[p].substring(0, 15) == recId.substring(0,15))) {
	                return true;
	            } else if (obj[p] instanceof Object && this.hasId(obj[p], recId)) {
	                return true;
	            }
	        }
	    }
	    return false;
	},
	this.getIds = function(obj, idList){
		if(!idList)
			idList = "";

		for (var p in obj) {
	        if (obj.hasOwnProperty(p)) {
	            if (p === "Id") {
	                idList += (obj[p]) + " ";
	            } else if (obj[p] instanceof Object) {
	                this.getIds(obj[p], idList);
	            }
	        }
	    }
	    return idList;
	}
});

angular.module('dorrbell').service("Log", function($ionicPopup){
	this.message = function(obj, alert, title){
		if(alert){
			$ionicPopup.alert({
				title : (title) ? title : 'Message',
				template : obj
			});
		}
	}
});

angular.module('dorrbell').service("ItemValidator", function($rootScope){
	/*

	this.canConfirmPrice = function(item, delivery){
		return item.Status__c == 'Requested' && delivery.Status__c == 'Preparing Delivery';
	}


	this.canRemove = function(item, delivery){
		return (item.Status__c == 'Ready For Check Out' || item.Status__c == 'Requested') && delivery.Status__c == 'Preparing Delivery';
	}
	this.showSubmenu = function(item, delivery){
		return (this.canRemove(item, delivery) || this.canCheckout(item, delivery) || this.canUpdatePrice(item, delivery) || this.canCheckIn(item));
	}
	*/
	this.canUpdatePrice = function(item, delivery){
		return ((item.Status__c == 'Ready For Check Out'
					|| item.Status__c == 'Requested')
				&& delivery.Status__c == 'Preparing Delivery'
				&& $rootScope.currentUser.RecordType.DeveloperName == 'Retailer_Contact')
	}
	this.canCheckout = function(item, delivery){
		return (item.Status__c == 'Ready For Check Out'
				&& (delivery.Status__c == 'Preparing Delivery')
				&& (delivery.Order__r.Status__c == 'Pick Up In Progress')
				&& $rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact');
	}
	this.canConfirm = function(item, delivery){
		return (item.Status__c == 'Requested' && delivery.Status__c == 'Preparing Delivery');
	}
	this.canCheckIn = function(item){
		return (item.Status__c == 'Returning' && $rootScope.currentUser.RecordType.DeveloperName == 'Retailer_Contact');
	}
	this.canRemove = function(item, delivery){
		return item.Status__c == 'Requested' && delivery.Status__c == 'Preparing Delivery';
	}
	this.saHasOptions = function(item, delivery){
		return this.canCheckout(item, delivery);
	}
	this.retailerHasOptions = function(item, delivery){
		return this.canRemove(item, delivery) || this.canUpdatePrice(item, delivery);
	}
	this.canAddItem = function(delivery){
		return (delivery && delivery.Status__c == 'Preparing Delivery') && $rootScope.currentUser.RecordType.DeveloperName == 'Retailer_Contact';
	}
});

angular.module('dorrbell').service("DeliveryValidator", function($rootScope, DeliveryFactory, Log, $ionicPopup, $state, $ionicHistory){
	this.buttons = [
		{
			condition : function(delivery){
				return ((delivery.Status__c == 'Accepted By Retailer') || (delivery.Status__c == 'New')) && $rootScope.currentUser.RecordType.DeveloperName == 'Retailer_Contact';
			},
			action : function(delivery){
				var confirmPopup = $ionicPopup.confirm({
			      title: 'Prepare Pickup',
			      template: 'Do you want to start preparing this delivery?'
			    });
			    confirmPopup.then(function(res) {
			      if(res) {
			       	DeliveryFactory.setStatus(delivery.Id, 'Preparing Delivery');
			      }
			    });
			},
			label : 'Start Preparation',
			icon : "ion-briefcase"
		},
		{
			condition : function(delivery){
				return (delivery.Status__c == 'Preparing Delivery' && delivery.Checkout_Ready__c == true && $rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact');
			},
			action : function(delivery){
				var confirmPopup = $ionicPopup.confirm({
			      title: 'Delivery Checkout',
			      template: 'Are you finished with this delivery and ready to check out?'
			  });
			  confirmPopup.then(function(res) {
			    if(res) {
			      DeliveryFactory.setStatus(delivery.Id, 'Checked Out', function(){
							$ionicHistory.goBack();
						});
			    }
			  });
			},
			label : 'Checkout Delivery',
			icon : "ion-checkmark"
		}
	];


	this.hasAction = function(delivery){
		var hasAction = false;
		angular.forEach(this.buttons, function(obj, index){
			if(obj.condition(delivery))
				hasAction = true;
		});
		return hasAction;
	}
})

angular.module('dorrbell').service("OrderValidator", function($rootScope, OrderFactory, $ionicPopup, $ionicHistory, $state, $ionicLoading, $cordovaDatePicker, Log){
	var that = this;
	this.buttons = [
		{
			label : 'Accept Delivery',
			condition : function(order){
				return (order.Status__c == 'Assigned' && $rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact');
			},
			action : function(order){
				$ionicLoading.show({
			        template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
			    });
				OrderFactory.acceptOrder(order.Id, function(){
					$ionicLoading.hide();
					Log.message("", true, "Delivery Accepted");
				});
			},
			icon : 'ion-checkmark'
		},
		{
			label : 'Start Pick Ups',
			condition : function(order){
				var start = moment(order.In_Home_Try_On_Start__c)
				var today = moment().diff(start, 'days') == 0;
				return (today && order.Status__c == 'Accepted' && $rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact' && order.Delivery_Shopping_Assistant__c == $rootScope.currentUser.Id);
			},
			action : function(order){
				var confirmPopup = $ionicPopup.confirm({
					title : "Start Pick Up",
					template : "Please confirm you are ready to begin picking up items from the stores. This will send a notification to the customer.",
					okText: 'Confirm'
				});
				confirmPopup.then(function(res){
					if(res){
						OrderFactory.startPickup(order.Id, function(){
							//Log.message('The delivery has started and the customer has been notified.', true, "Delivery Started");
						});
					}
				});
			},
			icon : 'ion-android-car'
		},
		{
			label : 'Start Drop Off',
			condition : function(order){
				var start = moment(order.In_Home_Try_On_Start__c);
				var inAnHour = moment().diff(start, 'hours') >= 0;
				return ((that.orderReady(order) && $rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact') && (order.Delivery_Shopping_Assistant__c == $rootScope.currentUser.Id))
			},
			action : function(order){
				var confirmPopup = $ionicPopup.confirm({
					title : "Start Drop Off",
					template : "Have you finished collecting the order items and en route to the customer drop off?"
				});
				confirmPopup.then(function(res){
					if(res){
						OrderFactory.startDelivery(order.Id, function(){
							Log.message('The order is en route to the customer and they have been notified it will be arriving within 15 minutes.', true, "Order En Route");
						});
					}
				});
			},
			icon : 'ion-android-car'
		},
		{
			label : 'Start Returns',
			condition : function(order){
				return (order.Status__c == 'Delivered To Customer' && $rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact' && (order.Return_Shopping_Assistant__c == $rootScope.currentUser.Id))
			},
			action : function(order){
				OrderFactory.startCollectingReturns(order.Id, function(){
					Log.message('The customer has been notified you\'re en route to collect the returns', true, "En Route");
				});
			},
			icon : 'ion-android-car'
		},
		{
			label : 'Complete',
			condition : function(order){
				return (order.Status__c == 'En Route to Customer' && !order.Marked_Delivered__c &&  $rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact' && (order.Delivery_Shopping_Assistant__c == $rootScope.currentUser.Id))
			},
			action : function(order){
				var options = {
				    date: new Date(new Date().getTime() + 3600000),
				    mode: 'time', // or 'time'
				    minDate: new Date(),
						maxDate : new Date(new Date().getTime() + 7200000),
				    allowOldDates: false,
				    allowFutureDates: true,
				    doneButtonLabel: 'RETURN TIME',
				    doneButtonColor: '#1ec4e8',
				    cancelButtonLabel: 'CANCEL',
				    cancelButtonColor: '#d4271a'
				};
				if($cordovaDatePicker && (typeof $cordovaDatePicker != "undefined") && $cordovaDatePicker.show){
					$cordovaDatePicker.show(options).then(function(date){
						if(date){
							order.Return_Collection_Time__c = date;
							OrderFactory.completeDelivery(order.Id, date, function(){
								Log.message('', true, "Delivery Complete");
							});
						}

				  });
				}else{
					OrderFactory.completeDelivery(order.Id, new Date(new Date().getTime() + 3600000), function(){
						Log.message('', true, "Delivery Complete");
					});
				}

			},
			icon : 'ion-checkmark'
		},
		{
			label : 'Returns',
			condition : function(order){
				return (order.Status__c == 'En Route to Customer' && order.Marked_Delivered__c && $rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact' && (order.Return_Shopping_Assistant__c == $rootScope.currentUser.Id))
			},
			action : function(order){
				$state.go("app.returns", {orderId : order.Id});
			},
			icon : 'ion-ios-undo'
		},
		{
			label : 'Complete Order',
			condition : function(order){
				return that.returnsComplete(order) && (order.Status__c == 'Retrieved From Customer' || order.Status__c == 'All Items Returned to All Retailers')  && (order.Return_Shopping_Assistant__c == $rootScope.currentUser.Id);
			},
			action : function(order){
				var confirmPopup = $ionicPopup.confirm({
					title : "Complete Order",
					template : "Are you sure you want to mark this order completed?"
				});
				confirmPopup.then(function(res){
					if(res){
						OrderFactory.completeOrder(order, function(){
							Log.message("Order " + order.Name + " has been completed", true, "Order Complete");
							$ionicHistory.goBack();
						});
					}
				})
			},
			icon : 'ion-ios-flag'
		}
	];

	this.orderReady = function(order){
		var isReady = function(order){
			var ready = true;
			angular.forEach(order.Order_Stores__r.records, function(obj, key){
				if(obj.Status__c != 'Checked Out')
					ready = false;
			});
			return ready;
		}
		return (order.Status__c == 'Pick Up In Progress' && isReady(order));
	}

	this.returnsComplete = function(order){
		var isReady = function(order){
			var ready = true;
			if(order.Order_Stores__r){
				angular.forEach(order.Order_Stores__r.records, function(obj, key){
					if(obj.Status__c != 'With Customer' && obj.Status__c != 'Checked In' && obj.Status__c != 'Complete')
						ready = false;
				});
			}
			return ready;
		}
		return isReady(order);
	}

	this.customerView = function(order){
		return (this.orderReady(order) || order.Status__c == 'En Route to Customer' || order.Status__c == 'Delivered To Customer');
	}
	this.pickupView = function(order){
		return (!this.orderReady(order) && (order.Status__c == 'Accepted' || order.Status__c == 'Pick Up In Progress' || order.Status__c == 'New' || order.Status__c == 'Assigned'));
	}
	this.returnView = function(order){
		return (order.Status__c == 'Retrieved From Customer' || order.Status__c == 'All Items Returned to All Retailers' || order.Status__c == 'Completed' || order.Status__c == 'Escalated');
	}
})


angular.module('dorrbell').service("RegistrationValidator", function(Log){
	this.validateContact = function(contactForm){
		if(contactForm.$error.required){
	      Log.message('All fields are required', true, 'Required Fields');
	      return false;
		}
	    else if(contactForm.$error.email){
	      Log.message('You have entered an invalid email address.', true, 'Invalid Email');
	      return false;
	    }
	    else if(contactForm.$error.pattern){
	      Log.message("Your password must contain at least 1 number and 1 letter.", true, "Invalid Password");
	      return false;
	    }
	    else if(contactForm.$error.minlength){
	      var name = contactForm.$error.minlength[0].$name;
	      Log.message(name + " must be at least " + $("[name='" + name + "']").attr("ng-minlength") + " characters", true, "Invalid Field");
	      return false;
	    }else if(contactForm.$error.maxlength){
	      var name = contactForm.$error.maxlength[0].$name;
	      Log.message(name + " must be at least " + $("[name='" + name + "']").attr("ng-maxlength") + " characters", true, "Invalid Field");
	      return false;
	    }else if(contactForm.$invalid){
	    	Log.message("An error occurred", true, "Form Error");
	    	return false;
	    }else{
	    	return true;
	    }
	}
})

angular.module('dorrbell').service("HerokuService", function($ionicPopup, $http, $localStorage, Log, $state, $rootScope, $q, $ionicLoading){
	var endpoint = 'https://shrouded-hollows-1707.herokuapp.com';
	var wsEndpoint = "ws://shrouded-hollows-1707.herokuapp.com";
	//var endpoint = "http://localhost:5000";
	//var wsEndpoint = "ws://localhost:5000";

	var storage_id = "doorbell_auth";
	var storage_user = "dorrbell_user";

	this.onDbError = function(callback, error){
		//unauthorized

		if(error && error.status == 200 && error.success == false){
			this.refreshToken(callback, function(){
				$state.go("login");
			})
		}else{
			Log.message("Uh Oh...Something went wrong", true, "Error");
			$ionicLoading.hide();
		}
	}

	this.login = function(data, callback, error){
		var that = this;
		this.post('/api/authenticate', data, function(res){
			console.log('setting storage user');
			$localStorage.setObject(storage_user, data);
	      	$localStorage.setObject(storage_id, res.token);
	      	that.setSessionUser(callback);
	    }, error)
	}

	this.refreshToken = function(callback, error){
		var that = this;
		this.get('/api/ping',
			function(res){
				if(res == 'valid_token')
					that.setSessionUser(callback);
				else{
					that.trySavedCreds(callback, error);
				}
			}, function(err){
				Log.message(err);
				that.trySavedCreds(callback, error);
			}
		);
	}

	this.setSessionUser = function(callback){
		this.get('/api/me', function(response){
			$rootScope.currentUser = response;
			callback();
		});
	}

	this.trySavedCreds = function(callback, error){
		if($localStorage.getObject(storage_user)){
			this.login($localStorage.getObject(storage_user), callback, error);
		}else{
			error();
		}
	}

	this.revoke = function(){
		$localStorage.deleteObject(storage_user);
		$localStorage.deleteObject(storage_id);
	}

	this.get = function(what, callback, errorCallback){
		var that = this;
		var token = this.getToken();
		$http({
			method : 'GET',
			url : endpoint + what,
			headers : {
				'x-access-token' : this.getToken(),
				'Authorization' : 'Basic Z14vbjcyayxOdUpnM0pfXw=='
			}
		}).then(function(response){
			if(response.data)
				callback(response.data);
			else
				callback(response);
		}, function(err){
			if(errorCallback)
				errorCallback(err);
			else
				that.onDbError(function(){
					that.get(what, callback, errorCallback);
				}, err);
		});
	}

	this.post = function(what, data, callback, errorCallback, silent){
		var that = this;
		$http({
			method : 'POST',
			url : endpoint + what,
			data : data,
			headers : {
				'Content-Type' : 'application/json',
				'x-access-token' : this.getToken(),
				'Authorization' : 'Basic Z14vbjcyayxOdUpnM0pfXw=='
			}
		}).then(function(response){
			if(response.data)
				callback(response.data);
			else
				callback(response);
		}, function(err){
			if(errorCallback)
				errorCallback(err);
			else
				that.onDbError(err);
		});
	}

	this.getToken = function(){
		return $localStorage.getObject(storage_id);
	}

	this.getEndpoints = function(){
		return {
			"ws" : wsEndpoint,
			"http" : endpoint
		};
	}
});

angular.module('dorrbell').service("ImageService", function(){
	this.convertUrlToBase64 = function(url, callback, outputFormat){
		var img = new Image();
	    img.crossOrigin = 'Anonymous';
	    img.onload = function(){
	        var canvas = document.createElement('CANVAS'),
	        ctx = canvas.getContext('2d'), dataURL;
	        canvas.height = this.height;
	        canvas.width = this.width;
	        ctx.drawImage(this, 0, 0);
	        dataURL = canvas.toDataURL(outputFormat);
	        callback(dataURL);
	        canvas = null;
	    };
	    img.src = url;
	}
})
