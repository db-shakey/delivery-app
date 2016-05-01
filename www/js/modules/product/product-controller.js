angular.module('dorrbell').controller("ProductSearch", function($scope, $timeout, $state, $rootScope, SearchFactory, DeliveryFactory, $cordovaGeolocation, $ionicScrollDelegate, $ionicFilterBar, $ionicHistory, $ionicLoading, $ionicActionSheet, $cordovaBarcodeScanner, $ionicPopup, Log){
	$scope.deliveryId = $state.params.deliveryId;
	$scope.store;

	$scope.showFilterBar = function () {
    filterBarInstance = $ionicFilterBar.show({
      items: $scope.storeList,
      update: function (filteredItems, filterText) {
				if(filterText && $scope.canLoad){
					$ionicLoading.show({
              template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
          });
          $scope.search(filterText, 20);
				}
      },
			cancel : function(){
				if($scope.canLoad)
					$scope.search('');
			}
    });
  };

	$scope.search = function(text, limit){
		$scope.limit = limit;
		$scope.searchText = text;
		SearchFactory.searchItems(text, $scope.store, $scope.limit, function(data){
			$scope.productList = data.records;
			$scope.hasMore = data.hasMore;
			$ionicLoading.hide();
			$scope.$broadcast('scroll.infiniteScrollComplete');
			$timeout(function(){
				$rootScope.$emit('lazyImg:refresh');
			}, 100);
		}, function(){
			$ionicLoading.hide();
		});
	}

	$scope.goToProductDetails = function(productId){
		if($scope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact')
			$state.go("app.productdetails", {"productId" : productId, "deliveryId" : $scope.deliveryId})
		else
			$state.go("ret.productdetails", {"productId" : productId, "deliveryId" : $scope.deliveryId})
	}

	$scope.scanBarcode = function(){
		var goToProduct = function(barcode){
			$ionicLoading.show({
					template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
			});
			SearchFactory.searchByBarcode(barcode, $scope.store, function(data){
				$ionicLoading.hide();
				if(data && data.records && data.records.length > 0)
					$scope.goToProductDetails(data.records[0].Parent_Product__c);
				else
					Log.message("No results found for barcode " + barcode, true, "Unrecognized Barcode");
			})
		}

		$cordovaBarcodeScanner.scan()
		.then(function(barcodeData) {
			if(!barcodeData.cancelled){
				goToProduct(barcodeData.text);
			}
		}, function(error) {
			Log.message("Oops...something went wrong", true, "Error");
		});
	}


	$scope.$on('$ionicView.beforeEnter', function(){
    $scope.canLoad = true;

		if(!$scope.deliveryId)
			$ionicHistory.clearHistory();


		if($scope.deliveryId){
			$scope.$watch(DeliveryFactory.getDeliveryById($scope.deliveryId), function(delivery){
				if(delivery){
					$scope.delivery = delivery[0];
					$scope.store = delivery[0].Store__c;
					$scope.search(' ', 20);
				}
			});
		}else if($scope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact'){
			$scope.search(' ', 20);
		}else{
			$scope.store = $scope.currentUser.Store__c;
			$scope.search(' ', 20);
		}
  });

});

angular.module('dorrbell').controller("OrderProductDetail", function($scope, $state, $ionicPopup, ProductFactory){
	$scope.getOrder = function(noCache) {
			$scope.$watch(ProductFactory.getProductsByOrderId($state.params.orderId, noCache), function(newValue, oldValue) {
				if (newValue){
					$scope.order = newValue[0];
				}
				$scope.$broadcast('scroll.refreshComplete');
			});
	}
	$scope.showImageModal = function(item){
    $scope.item = item;
    $ionicPopup.show({
      template : '<img fallback-src="{{item.PricebookEntry.Product2.Parent_Product__r.Image__r.Image_Source__c}}" ng-src="{{item.PricebookEntry.Product2.Image__r.Image_Source__c}}" style="width:100%"/>',
      title : item.PricebookEntry.Product2.Root_Product_Name__c,
      scope : $scope,
      buttons : [
        {text : 'Close'}
      ]
    })
  }
	$scope.getOrder(false);
});

angular.module('dorrbell').controller("ProductDetail", function($scope, $state, ProductFactory, DeliveryFactory, $ionicHistory, $cordovaGeolocation, Log, $ionicPopup, $ionicLoading, $ionicActionSheet, $cordovaBarcodeScanner){
	var productId = $state.params.productId;
	if($scope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact'){
		$cordovaGeolocation.getCurrentPosition({
			enableHighAccuracy : false,
			timeout : 10000
		}).then(function(position){
			$scope.coords = position.coords;
		}, function(err){
			Log.message(err, false);
		});
	}

	if($state.params.deliveryId){
		$scope.$watch(DeliveryFactory.getDeliveryById($state.params.deliveryId), function(delivery){
			if(delivery){
				$scope.delivery = delivery[0];
			}
		});
	}
	$scope.getProduct = function(noCache){
		$scope.$watch(ProductFactory.getProductById(productId, noCache), function(newValue, oldValue){
			if(newValue){
				$scope.product = newValue[0];
				$scope.variants = newValue;
			}

			$scope.$broadcast('scroll.refreshComplete');
		})
	}
	$scope.addToOrder = function(){
		var variant = $scope.variants[$scope.slider.activeIndex];


		var c = $ionicPopup.confirm({
			title : "Add To Order",
			template : "Are you sure you want to add " + variant.Product2.SKU__c + " to order " + $scope.delivery.Order__r.Name + "?"
		});
		c.then(function(res){
			if(res){
				$ionicLoading.show({
						template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
				});
				DeliveryFactory.createOrderItem(variant, $scope.delivery.Order__r.Shopify_Id__c, $scope.delivery.Order__c, function(){
					$ionicLoading.hide();
					$ionicHistory.goBack(-2);
				}, function(){
					$ionicLoading.hide();
					Log.message("Oops...something went wrong", true, "Error");
				})
			}
		});
	}


	$scope.openSubmenu = function($event){
		var sheet = $ionicActionSheet.show({
			buttons : [
				{
					text : '<i class="icon ion-qr-scanner"></i> Set Barcode'
				}
			],
			buttonClicked : function(index){
				sheet();
				$cordovaBarcodeScanner.scan()
	      .then(function(barcodeData) {
					if(!barcodeData.cancelled){
						$ionicLoading.show({
								template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
						});
						ProductFactory.setBarcode($scope.product.Product2.Id, barcodeData, function(){
							$ionicLoading.hide();
						})
					}
	      }, function(error) {
	        Log.message("Oops...something went wrong", true, "Error");
	      });
			},
			cssClass : "dorrbell_menu"
		})
	}
	$scope.options = {
	  loop: false
	}
	$scope.data = {};
	$scope.$watch('data.slider', function(nv, ov) {
	  $scope.slider = $scope.data.slider;
	});

	$scope.getProduct();

});

angular.module('dorrbell').controller("ProductList", function($scope, $state, $ionicFilterBar, $ionicLoading, $cordovaBarcodeScanner, SearchFactory){
	$scope.storeId = $state.params.storeId;

	$scope.searchProducts = function(searchText, limit){
		$scope.limit = limit;
		$scope.searchString = searchText;
		SearchFactory.searchItems(searchText, $state.params.storeId, limit, function(result){
			$scope.productList = result.records;
			$scope.hasMore = result.hasMore;
			$ionicLoading.hide();
		});

	}


	$scope.scanBarcode = function(){
		var goToProduct = function(barcode){
			$ionicLoading.show({
					template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
			});
			SearchFactory.searchByBarcode(barcode, $scope.store, function(data){
				$ionicLoading.hide();
				if(data && data.records && data.records.length > 0){
					$scope.canLoad = false;
					$state.go('db.productDetail', {productId : data.records[0].Parent_Product__c});
				}
				else
					Log.message("No results found for barcode " + barcode, true, "Unrecognized Barcode");
			})
		}

		$cordovaBarcodeScanner.scan()
		.then(function(barcodeData) {
			if(!barcodeData.cancelled){
				goToProduct(barcodeData.text);
			}
		}, function(error) {
			Log.message("Oops...something went wrong", true, "Error");
		});
	}

	$scope.showFilterBar = function () {
    filterBarInstance = $ionicFilterBar.show({
      items: $scope.storeList,
      update: function (filteredItems, filterText) {
				if(filterText && $scope.canLoad){
					$ionicLoading.show({
              template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
          });
          $scope.searchProducts(filterText);
				}
      },
			cancel : function(){
				if($scope.canLoad)
					$scope.searchProducts('', 10);
			}
    });
  };

	$scope.goToProduct = function(product){
		$scope.canLoad = false;
		$state.go('db.productDetail', {productId : product.Id});
	}

	$scope.$on('$ionicView.beforeEnter', function(){
      $scope.productList = [];
			$scope.canLoad = true;
      $scope.searchProducts('', 10);

  });
});

angular.module('dorrbell').controller('NewProductController', function($scope, $state, $ionicLoading, $filter, $ionicHistory, $localCache, $interval, $q, StoreFactory, ProductFactory, Log){

	$scope.getStore = function(noCache){
		$scope.$watch(StoreFactory.getStoreById($state.params.storeId, noCache), function(newValue, oldValue){
			if(newValue){
				$scope.store = newValue[0];
			}

			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	$scope.getProductTypes = function(query){
		return $q(function(resolve, reject){
			ProductFactory.getProductTypes().then(function(res){
				var values = new Array();
				var customValue = true;
				for(var i in res){
					if(res[i].indexOf(query) != -1)
						values.push(res[i]);
					if(res[i] == query)
						customValue = false;
				}
				if(customValue && query && query.trim().length > 0)
					values.push(query);
				resolve(values);
		 	}, reject)
		});

	}

	$scope.saveProduct = function(goToVariant){
		$scope.menu = "closed";
		$ionicLoading.show({
    	template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
  	});
		$scope.product.metafields = new Array();
		$scope.product.tags = $scope.tag.gender + ', ' + $scope.tag.category + ', New';
		$scope.product.published = "false";
		$scope.product.published_scope = "web";
		$scope.product.body_html = '<span style="font-weight:700;">Description:</span> <br/>\
												<span style="font-weight:700;">Fit:</span> <br/>\
												<span style="font-weight:700;">Materials:</span> <br/>\
												<span style="font-weight:700;">Condition:</span> <br/> Like New Very Good Good<br/>\
												<span style="font-weight:700;">Notes:</span> <br/>\
												<span style="font-weight:700;">Care:</span>';
		$scope.product.vendor = $scope.store.External_Id__c;
		$scope.product.options = [
			{
				name : "Size"
			},
			{
				name : "Color"
			}
		];
		$scope.product.variants = [
			{
				"option1" : "Small",
				"option2" : "Blue",
				"inventory_management" : "shopify",
				"inventory_policy" : "deny",
				"sku" : $scope.product.sku
			}
		];
		$scope.product.metafields.push({
			"key" : "brand",
			"value" : $scope.meta.brand,
			"value_type" : "string",
			"namespace" : "product"
		});
		$scope.product.metafields.push({
			"key" : "cluster",
			"value" : $scope.meta.district,
			"value_type" : "string",
			"namespace" : "product"
		});
		ProductFactory.createProduct($scope.product, $scope.store.Id, function(res){
			var tries = 0;
			var checkProduct = $interval(function(){
				ProductFactory.getProductByExternalId(res.product.id).then(function(results){
					if(results && results.length > 0){
						$ionicLoading.hide();
						$interval.cancel(checkProduct);
						$ionicHistory.currentView($ionicHistory.backView());
						$state.go("db.productDetail", {productId : results[0].Id});
					}else if(tries >= 6){
						$ionicLoading.hide();
						$interval.cancel(checkProduct);
						$ionicHistory.goBack();
					}
					tries++;
				});
			}, 1000);

		}, function(err){
			$ionicLoading.hide();
			Log.message(JSON.stringify(err.data), true, "Error");
		})
	}

	$scope.$on('$ionicView.beforeEnter', function(){
    if(!$scope.store){
      $scope.getStore(false);
    }
		$scope.tag = {};
		$scope.meta = {district : "Pearl District"};
		$scope.product = {};
  });

})

angular.module('dorrbell').controller('DbProductDetailController', function($scope, $ionicActionSheet, $ionicLoading, $state, ProductFactory){
	$scope.getProduct = function(noCache){
		$scope.$watch(ProductFactory.getProductDetailsById($state.params.productId, noCache), function(newValue, oldValue){
			if(newValue){
				$scope.product = newValue[0];
				$scope.shProduct.id = $scope.product.Shopify_Id__c;
				$scope.shProduct.published = $scope.product.Published_At__c != null;
			}

			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	$scope.openSubmenu = function($event){
		var sheet = $ionicActionSheet.show({
			buttons : [
				{
					text : '<i class="icon ion-plus-round"></i> Add Variant'
				}
			],
			buttonClicked : function(index){
				sheet();
				if(index == 0){
					$state.go('db.variantNew', {productId : $scope.product.Id});
				}
			},
			cssClass : "dorrbell_menu"
		})
	}
	$scope.togglePublish = function(){
		ProductFactory.updateProduct($scope.shProduct, $scope.product.Store__c, function(){
			$scope.getProduct(true);
		});
	}
	$scope.delete = function(item){
		$ionicLoading.show({
			template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
		});
		ProductFactory.deleteVariant($scope.product.Shopify_Id__c, item.Shopify_Id__c, function(){
			$ionicLoading.hide();
			$scope.getProduct(true);
		})
	}

	$scope.$on('$ionicView.beforeEnter', function(){
    $scope.getProduct(true);
		$scope.shProduct = {};
  });
})

angular.module('dorrbell').controller('VariantNewController', function($scope, $state, $ionicLoading, $ionicHistory, $cordovaBarcodeScanner, ProductFactory, MetadataFactory, Log){
	$scope.getProduct = function(noCache){
		$scope.$watch(ProductFactory.getVariantById($state.params.productId, noCache), function(newValue, oldValue){
			if(newValue){
				$scope.parentProduct = newValue[0];
				if(newValue != oldValue)
					$scope.variant.sku = $scope.parentProduct.SKU__c;
			}

			$scope.$broadcast('scroll.refreshComplete');
		})
	}

	$scope.saveVariant = function(goToNew){
		$scope.variant.metafields = new Array();
		$scope.menu = "closed";
		$ionicLoading.show({
    	template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
  	});
		$scope.variant.metafields.push({
			"key" : "metaprice",
			"value" : $scope.metaprice.price * 100,
			"value_type" : "integer",
			"namespace" : "price"
		});
		$scope.variant.metafields.push({
			"key" : "metalistprice",
			"value" : $scope.metaprice.price * 100,
			"value_type" : "integer",
			"namespace" : "price"
		});
		$scope.variant.metafields.push({
			"key" : "metalistpricecurrent",
			"value" : $scope.metaprice.price * 100,
			"value_type" : "integer",
			"namespace" : "price"
		});
		$scope.variant.inventory_policy = "deny";
		$scope.variant.inventory_management = "shopify";
		ProductFactory.createVariant($scope.parentProduct.Shopify_Id__c, $scope.variant, function(res){
			$ionicLoading.hide();

			if(goToNew){
				$scope.variant = {};
				$scope.metaprice = {};
			}else{
				$ionicHistory.goBack();
			}
		}, function(err){
			$ionicLoading.hide();
			if(err.data.base)
				Log.message(err.data.base[0], true, "Error");
			else
				Log.message("Oops...something went wrong", true, "Error");
		});
	}

	$scope.scanBarcode = function(){
		$cordovaBarcodeScanner.scan()
		.then(function(barcodeData) {
			if(!barcodeData.cancelled){
				$scope.variant.barcode = barcodeData.text;
			}
		}, function(error) {
			Log.message("Oops...something went wrong", true, "Error");
		});
	}

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.variant = {};
		$scope.metaprice = {};
    $scope.getProduct(false);
  });

})

angular.module('dorrbell').controller('VariantEditController', function($scope, $ionicLoading, $state, $timeout, $ionicHistory, $cordovaBarcodeScanner, ProductFactory, Log){
	$scope.getProduct = function(noCache){
		$scope.$watch(ProductFactory.getVariantById($state.params.productId, noCache), function(newValue, oldValue){
			if(newValue){
				$scope.product = newValue[0];
			}

			$scope.$broadcast('scroll.refreshComplete');
		})
	}

	$scope.findOption = function(optionRecords, optionName){
		var optionInstance;
		angular.forEach(optionRecords, function(obj, index){
			if(obj.Option__r.Name == optionName)
				optionInstance = obj;
		});
		if(optionInstance)
			return optionInstance;
		else{
			var newOption = {
				Option__r : {
					Name : optionName
				}
			};
			if($scope.product && $scope.product.Product_Options__r)
				$scope.product.Product_Options__r.records.push(newOption);

			return newOption;
		}
	}

	$scope.scanBarcode = function(){
		$cordovaBarcodeScanner.scan()
		.then(function(barcodeData) {
			if(!barcodeData.cancelled){
				$scope.product.Barcode__c = barcodeData.text;
			}
		}, function(error) {
			Log.message("Oops...something went wrong", true, "Error");
		});
	}

	$scope.saveVariant = function(goToNew){
		$scope.menu = "closed";
		$ionicLoading.show({
    	template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
  	});
		ProductFactory.updateVariant($scope.product, function(res){
			$ionicLoading.hide();
			if(goToNew){
				$ionicHistory.currentView($ionicHistory.backView());
				$state.go("db.variantNew", {productId : $scope.product.Parent_Product__c}, {location : 'replace'});
			}else{
				Log.message("", true, "Variant Saved");
			}

		});
	}

	$scope.$on('$ionicView.beforeEnter', function(){
    if(!$scope.product){
      $scope.getProduct(false);
    }
  });
})
