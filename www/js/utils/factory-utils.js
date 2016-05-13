angular.module('dorrbell').factory("$localCache", function($rootScope, JSUtils, HerokuService){
	var cache = {};
	var socket;

	return {
		init : function(callback){
			var that = this;
			if(!socket){
				socket = io(HerokuService.getEndpoints().ws, {
					path : '/socket.io-client',
					transports : ['websocket']
				});

				socket.on("update", function(data){
					for(var x in cache){
						if(JSUtils.hasId(cache[x], data.id)){
							that.updateCache(x, true);
						}
					}
				});
				socket.on("connect", callback);
			}else{
				callback();
			}
		},
		triggerUpdate : function(objectType, Id){
			var that = this;
			this.init(function(){
				socket.emit("update", {
					"objectType" : objectType,
					"id" : Id
				});
				for(var x in cache){
					if(x.indexOf(Id) != -1)
						that.updateCache(x, true);
					else if(JSUtils.hasId(cache[x], Id))
						that.updateCache(x, true);
				}
			});
		},
		getRecords : function(query, noCache){
			var that = this;
			this.init(function(){
				if(!cache[query] || noCache){
					that.updateCache(query, false);
				}
			});

		},
		watchRecords : function(query, noCache){
			this.getRecords(query, noCache);
			var that = this;
			return function(){
				return that.fromCache(query);
			}
		},
		updateCache : function(query, silent){
			HerokuService.post("/api/query", {"query" : query, "socketId" : socket.id}, function(response){
				cache[query] = response;
			}, null, silent);
		},
		setRecord : function(query, data){
			cache[query] = data;
		},
		fromCache : function(query){
			return cache[query];
		},
		clearCache : function(){
			delete cache;
		}
	}
})

angular.module('dorrbell').factory("$localStorage", function($window, $q){
	var ss;
	var useLocal = true;
	if(window.cordova){
		ss = new cordova.plugins.SecureStorage(
			function () {useLocal = false},
			function (error){useLocal = true},
		'dorrbell');
	}

	return {
	    set: function(key, value) {
				return $q(function(resolve, reject){
					if(useLocal)
						resolve($window.localStorage[key] = value);
					else{
						ss.set(
							resolve,
							reject,
							key,
							value
						);
					}
				});
	    },
	    get: function(key, defaultValue) {
				return $q(function(resolve, reject){
					if(useLocal)
						resolve($window.localStorage[key] || defaultValue);
					else
						ss.get(resolve, function(){resolve(defaultValue);}, key);
				});
	    },
	    setObject: function(key, value) {
				return $q(function(resolve, reject){
					if(useLocal)
						resolve($window.localStorage[key] = JSON.stringify(value));
					else{
						ss.set(
							resolve,
							reject,
							key,
							JSON.stringify(value)
						);
					}
				});
	    },
	    getObject: function(key) {
				return $q(function(resolve, reject){
					if(useLocal)
						resolve(JSON.parse($window.localStorage[key] || '{}'));
					else
						ss.get(function(v){
							resolve(JSON.parse(v || '{}'));
						}, reject, key);
				});
	    },
	    deleteObject : function(key){
				return $q(function(resolve, reject){
					if(useLocal)
						resolve($window.localStorage.removeItem(key));
					else{
						ss.remove(
							resolve,
							reject,
							key);
					}
				});
	    }
	  }
});

angular.module('dorrbell').factory("MetadataFactory", function(force){
	var metadata;
	var globalData;

	return {
		describe : function(objectName, callback){
			if(typeof callback == "undefined")
				callback = function(){};

			if( typeof metadata == "undefined")
				metadata = {};

			if(metadata.hasOwnProperty(objectName))
				callback(metadata[objectName]);
			else{
				var that = this;
				force.describe(objectName, function(data){
					metadata[objectName] = data;
					callback(data);
				}, force.onError);
			}
		}
	}
});

angular.module('dorrbell').factory("RecordTypeFactory", function(force){

	var recordTypeMap;

	return {
		getRecordTypesForObject : function(sObjectType, callback){
			if(!recordTypeMap)
				recordTypeMap = {};

			if(recordTypeMap[sObjectType])
				callback(recordTypeMap[sObjectType]);
			else{
				force.query("SELECT Id, \
									DeveloperName, \
									Name \
								FROM RecordType \
								WHERE sObjectType = '" + sObjectType + "' \
								ORDER BY CreatedDate ASC", function(records){
					recordTypeMap[sObjectType] = records;
					callback(records);
				});
			}
		}
	}
});

angular.module('dorrbell').factory("force", function(Log, HerokuService, $rootScope, $localCache){

	return{
		query : function(query, callback, error){
			HerokuService.post("/api/query", {"query" : query}, callback, error);
		},
		describe : function(objectName, callback){
			HerokuService.get("/api/describe/" + objectName, callback, this.onError);
		},
		update : function(object, data, callback){
			this.post("/api/update/" + object, data, object, data.Id, callback, this.onError);
		},
		post : function(what, data, objectUpdate, updateId, callback, error){
			var errorHandler = (error) ? error : this.onError;
			HerokuService.post(what, data, function(res){
				if(objectUpdate && updateId)
					$localCache.triggerUpdate(objectUpdate, updateId);

				if(callback)
					callback(res);
			}, errorHandler);
		},
		get : function(endpoint, success, error){
			HerokuService.get(endpoint, success, error);
		},
		onError : function(err){
			HerokuService.onDbError(null, err);
		}
	}
});

angular.module('dorrbell').factory("MapFactory", function(GoogleService, Log, $timeout, $q, $cordovaGeolocation, $cordovaLaunchNavigator){
	var map;
	var markers;
	var info;
	var renderer;
	var watch;
	var currentPosition;
	var currentPositionMarker;

	return {
		initMap : function(elementId, disableUI, draggable){
			map = new google.maps.Map(document.querySelector(elementId), {mapTypeId: google.maps.MapTypeId.ROADMAP, zoom: 16, disableDefaultUI: disableUI, draggable:draggable});
			markers = new Array();
		},
		getCurrentPosition : function(){
			return $q(function(resolve, reject){
				if(!watch)
					watch = $cordovaGeolocation.watchPosition({timeout: 20000, enableHighAccuracy: true});

				watch.then(null,function(err){
					console.log(err);
				},function(position){
					currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

						if(currentPositionMarker)
							currentPositionMarker.setPosition(currentPosition);
						else{
							var pinIcon = new google.maps.MarkerImage(
							    "img/marker.png",
							    null, /* size is determined at runtime */
							    null, /* origin is 0,0 */
							    null, /* anchor is bottom center of the scaled image */
							    new google.maps.Size(15, 15)
							);
							currentPositionMarker = new google.maps.Marker({
									position: currentPosition,
									icon : pinIcon
							});
						}


					resolve(currentPosition);
				});

			})
		},
		launchNavigator : function(address){
			//Check availability
			var onDefault = function(){
				launchnavigator.navigate(
					address,
					{
						startName : 'My Location'
					}
				);
			}

			var onGoogle = function(){
				launchnavigator.navigate(
					address,
					{
						startName : 'My Location',
						app : launchnavigator.APP.GOOGLE_MAPS
					}
				);
			}


			launchnavigator.availableApps(function(apps){
				var found = false;
				for(var i in apps){
					if(i == "google_maps" && apps[i] == true){
						found = true;
						onGoogle();
					}
				}
				if(!found) onDefault();
			}, onDefault);



		},
		zoomToCurrentLocation : function(){
			this.showCurrentPosition(true);
			if(currentPositionMarker){
				map.setCenter(new google.maps.LatLng(currentPositionMarker.position.lat() - .006, currentPositionMarker.position.lng()));
			}
		},
		pan : function(left, up){
			var listener = google.maps.event.addListener(map, "idle", function() {
				map.panBy(left, up);
				google.maps.event.removeListener(listener);
			});
		},
		goToMarker : function(index){
			map.setCenter(new google.maps.LatLng(markers[index].position.lat(), markers[index].position.lng()));
			google.maps.event.trigger(markers[index], 'click');
		},
		showCurrentPosition : function(shouldShow){
			if(shouldShow && currentPositionMarker)
				currentPositionMarker.setMap(map);
			else if(!shouldShow && currentPositionMarker)
				currentPositionMarker.setMap(null);
		},
		calculateAndDisplayRoute : function(to){
			this.clearMarkers();
			var directionsService = new google.maps.DirectionsService;
			var directionsDisplay = new google.maps.DirectionsRenderer;

			this.getCurrentPosition().then(function(coords){
				var directionsRequest = {
					origin : currentPosition,
					destination : to,
					travelMode : google.maps.DirectionsTravelMode.DRIVING,
					unitSystem : google.maps.UnitSystem.METRIC
				};
				directionsService.route(
					directionsRequest,
					function(response, status){
						if(status == google.maps.DirectionsStatus.OK){
							renderer = new google.maps.DirectionsRenderer({
								map: map,
								directions: response
							});
							$timeout(function(){
								map.setZoom(14);
							}, 500);
						}else
							Log.message("Could not identify route to destination", true, "Error");
					}
				);
			});
		},
		showMarker : function(delivery, callback){
			var ga = GoogleService.geocodeAddress(delivery.Store__r.Store_Street_Address__c, delivery.Store__r.Store_City__c, delivery.Store__r.State_Province__c, delivery.Store__r.Postal_Zip_Code__c);
			ga.then(function(result){
				//Create the marker
				var marker = new google.maps.Marker({
						map: map,
						position: result[0].geometry.location,
						title: delivery.Store__r.Name
				});
				var that = this;
				google.maps.event.addListener(marker, "click", function(){
					if (info)
							info.close();

					info = new google.maps.InfoWindow({
							content: "<address>\
							<strong>" + delivery.Store__r.Name + "</strong><br>" +
							delivery.Store__r.Store_Street_Address__c + "<br>" +
							delivery.Store__r.Store_City__c + "," + delivery.Store__r.State_Province__c + " " + delivery.Store__r.Postal_Zip_Code__c + "<br>" +
							"</address>" +
							'<div class="button-bar">' +
							'<a class="button button-calm icon ion-navigate button-small" onclick=\'$("ion-view[nav-view=active]").scope().launchNavigator("' +
									delivery.Store__r.Store_Street_Address__c + '", "' + delivery.Store__r.Store_City__c + '", "' + delivery.Store__r.State_Province__c + '", "' + delivery.Store__r.Postal_Zip_Code__c + '")\'></a>' +
							'<a class="button icon ion-ios-telephone button-small" href="tel:+1-' + delivery.Store__r.Phone__c + '"></a>' +
							'</div>'
					});

					info.open(map, marker);
				});


				//push it to array and fit the map to the markers
				markers.push(marker);
				map.fitBounds(markers.reduce(function(bounds, marker) {
						return bounds.extend(marker.getPosition());
				}, new google.maps.LatLngBounds()));
				var listener = google.maps.event.addListener(map, "idle", function() {
					if (map.getZoom() > 14) map.setZoom(14);
						google.maps.event.removeListener(listener);
				});
			})
		},

		showLocation : function(street, city, state, zip, title){
			this.clearMarkers();
			var ga = 	GoogleService.geocodeAddress(street, city, state, zip);
			ga.then(function(result){
				//Create the marker
				var marker = new google.maps.Marker({
						map: map,
						position: result[0].geometry.location,
						title: title
				});
				markers.push(marker);
				map.setCenter(result[0].geometry.location);
				map.panBy(0, 100);
			});
		},
		clearMarkers : function(){
			if(markers){
				for (var i = 0; i < markers.length; i++) {
    			markers[i].setMap(null);
  			}
			}
			if(renderer)
				renderer.setMap(null);
		}
	}
})
