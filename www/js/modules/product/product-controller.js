angular.module('dorrbell').controller("ProductSearch", function($scope, $timeout, $state, SearchFactory, DeliveryFactory, $cordovaGeolocation, $ionicScrollDelegate, $ionicHistory, $ionicLoading, $ionicActionSheet, $cordovaBarcodeScanner, $ionicPopup, Log){
	$scope.deliveryId = $state.params.deliveryId;
	$scope.store;
	$scope.limit = 10;
	$scope.offset = 0;




	$scope.disableSearch = function(){
		return ($scope.deliveryId && !$scope.delivery) || !$scope.coords;
	}


	$scope.searchChange = function(text){
		$ionicLoading.show({
      		template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
    	});
		$ionicScrollDelegate.scrollTo(0, 0, true);
		$scope.searchText = text;

		$scope.hasMore = true;
		$scope.search(text);

	}

	$scope.search = function(text){
		SearchFactory.searchItems(text, $scope.store, $scope.limit, $scope.coords, function(data){
			$scope.results = data;
			$ionicLoading.hide();
		}, function(){
			$ionicLoading.hide();
		});
	}

	$scope.loadMore = function(){
		$scope.offset += $scope.limit;
		SearchFactory.searchItems($scope.searchText, $scope.store, $scope.limit, $scope.coords, function(data){
			if(!data.records || data.totalSize == 0)
				$scope.hasMore = false;

			$scope.results = $scope.results.concat(data);
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	}
	$scope.goToProductDetails = function(productId){
		if($scope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact')
			$state.go("app.productdetails", {"productId" : productId, "deliveryId" : $scope.deliveryId})
		else
			$state.go("ret.productdetails", {"productId" : productId, "deliveryId" : $scope.deliveryId})
	}

	$scope.openSubmenu = function($event){
		var sheet = $ionicActionSheet.show({
			buttons : [
				{
					text : '<i class="icon ion-qr-scanner"></i> Scan Barcode'
				},
				{
					text : '<i class="icon ion-edit"></i>Enter Barcode'
				}
			],
			buttonClicked : function(index){

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

				sheet();
				if(index == 0){
					$cordovaBarcodeScanner.scan()
		      .then(function(barcodeData) {
						if(!barcodeData.cancelled){
							goToProduct(barcodeData.text);
						}
		      }, function(error) {
		        Log.message("Oops...something went wrong", true, "Error");
		      });
				}else{
					$scope.barcode = {data : ""};
					var confirmPopup = $ionicPopup.confirm({
						title: 'Enter Barcode',
						template: '<label class="item-input-wrapper"><input type="text" ng-model="barcode.data" autofocus/></label>',
						scope : $scope
					});
					confirmPopup.then(function(res){
							if(res && $scope.barcode.data){
								goToProduct($scope.barcode.data.toUpperCase());
							}

					});
				}

			},
			cssClass : "dorrbell_menu"
		})
	}

	if(!$scope.deliveryId)
		$ionicHistory.clearHistory();


	if($scope.deliveryId){
		$scope.$watch(DeliveryFactory.getDeliveryById($scope.deliveryId), function(delivery){
			if(delivery){
				$scope.delivery = delivery[0];
				$scope.store = delivery[0].Store__c;
				$scope.coords = true;
				$scope.search();
			}
		});
	}else if($scope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact'){
		$cordovaGeolocation.getCurrentPosition({
			enableHighAccuracy : false,
			timeout : 10000
		}).then(function(position){
			$scope.coords = position.coords;
			$scope.search();
		})
	}else{
		$scope.coords = true;
		$scope.store = $scope.currentUser.Store__c;
		$scope.search();
	}
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

_app.controller("ProductDetail", function($scope, $state, ProductFactory, DeliveryFactory, $ionicHistory, $cordovaGeolocation, Log, $ionicPopup, $ionicLoading, $ionicActionSheet, $cordovaBarcodeScanner){
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

})
