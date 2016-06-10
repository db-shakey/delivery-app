angular.module('dorrbell').controller("ProductSearch", function($scope, $timeout, $state, $rootScope, SearchFactory, DeliveryFactory, $cordovaGeolocation, $ionicScrollDelegate, $ionicFilterBar, $ionicHistory, $ionicLoading, $ionicActionSheet, $cordovaBarcodeScanner, $ionicPopup, Log){
	$scope.deliveryId = $state.params.deliveryId;
	$scope.store;

	$scope.showFilterBar = function () {
    filterBarInstance = $ionicFilterBar.show({
      items: $scope.storeList,
      update: function (filteredItems, filterText) {
				if($scope.canLoad){
					$ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
          $scope.search(filterText, 20);
				}
      },
			cancel : function(){
				if($scope.canLoad)
					$scope.search('');
			},
			initialFilterText : $scope.searchText
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
		if($scope.searchString)
      $scope.showFilterBar();

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
		$scope.limit = (limit) ? limit : 10;
		$scope.searchString = (searchText) ? searchText : '';
		SearchFactory.searchItems(searchText, $state.params.storeId, limit, function(result){
			$scope.productList = result.records;
			$scope.hasMore = result.hasMore;
			$ionicLoading.hide();
			$scope.$broadcast('scroll.refreshComplete');
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
				if($scope.canLoad){
					$ionicLoading.show({
              template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
          });
          $scope.searchProducts(filterText);
				}
      },
			scan : $scope.scanBarcode,
			favoritesEnabled : true,
			initialFilterText : $scope.searchString
    });
  };

	$scope.goToProduct = function(product){
		$scope.canLoad = false;
		$state.go('db.productDetail', {productId : product.Id});
	}

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.canLoad = true;
		if($scope.searchString){
			$scope.showFilterBar();
		}
		$scope.searchProducts($scope.searchString, $scope.limit);
  });
});

angular.module('dorrbell').controller('NewProductController', function($scope, $state, $ionicLoading, $filter, $ionicHistory, $interval, $q, StoreFactory, $timeout, $ionicModal, ProductFactory, ProductValidator, ProductService, Log, JSUtils){

	$scope.getStore = function(noCache){
		$scope.$watch(StoreFactory.getStoreById($state.params.storeId, noCache), function(newValue, oldValue){
			if(newValue){
				$scope.store = newValue[0];
			}

			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	$scope.getProduct = function(noCache){
		$scope.$watch(ProductFactory.getProductDetailsById($state.params.productId, noCache), function(newValue, oldValue){
			if(newValue){
				$scope.editProduct = newValue[0];
				$scope.product = ProductService.getShopifyProduct(newValue[0]);
				$scope.meta = {
					brand : newValue[0].Brand__c
				};
				$scope.tag = {
					externalModel : $scope.product.tags
				}
				for(var i = 0; i<$scope.product.tags.length; i++){
					if($scope.categories.indexOf($scope.product.tags[i].trim()) != -1)
						$scope.tag.category = $scope.product.tags[i].trim();
					else if($scope.genders.indexOf($scope.product.tags[i].trim()) != -1)
						$scope.tag.gender = $scope.product.tags[i].trim();
				}
				$scope.info = ProductService.descriptionParser($scope.editProduct.Body_Html__c);
			}
		})
	}

	$scope.getProductTypes = function(query){
		return $q(function(resolve, reject){
			ProductFactory.getProductTypes().then(function(res){
				resolve($filter("listSorter")(res, query));
		 	}, reject)
		});

	}

	$scope.getProductTags = function(query, isInitializing){
		return $q(function(resolve, reject){
			ProductFactory.getProductTags().then(function(res){
				resolve($filter("listSorter")(res, query, $scope.product.tags));
			})
		});
	}
	$scope.modelToItemMethod = function (modelValue) {
		return modelValue;
	}
	$scope.updateCategory = function(oldValue){
		if(oldValue && $scope.tag.externalModel.indexOf(oldValue) != -1)
			$scope.tag.externalModel.splice($scope.tag.externalModel.indexOf(oldValue))

		$scope.tag.externalModel.push($scope.tag.category);
		$scope.ready = $scope.tag.category && $scope.tag.gender
	}
	$scope.updateGender = function(oldValue){
		if(oldValue && $scope.tag.externalModel.indexOf(oldValue) != -1)
			$scope.tag.externalModel.splice($scope.tag.externalModel.indexOf(oldValue))

		$scope.tag.externalModel.push($scope.tag.gender);
		$scope.ready = $scope.tag.category && $scope.tag.gender
	}
	$scope.updatePrice = function(){
		var tags = ['Under 50', 'Under 75', 'Under 100', 'Under 25'];
		for(var i = 0; i<tags.length; i++){
			if($scope.tag.externalModel.indexOf(tags[i]) != -1)
				$scope.tag.externalModel.splice($scope.tag.externalModel.indexOf(tags[i]));
		}

		if($scope.meta.price < 25)
			Array.prototype.push.apply($scope.tag.externalModel, ['Under 25', 'Under 50', 'Under 75', 'Under 100']);
		else if($scope.meta.price < 50)
			Array.prototype.push.apply($scope.tag.externalModel, ['Under 50', 'Under 75', 'Under 100']);
		else if($scope.meta.price < 75)
			Array.prototype.push.apply($scope.tag.externalModel, ['Under 75', 'Under 100']);
		else if($scope.meta.price < 100)
			Array.prototype.push.apply($scope.tag.externalModel, ['Under 100']);
	}

	$scope.saveProduct = function(){
		$ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
		$scope.product.body_html = ProductService.descriptionToHtml($scope.info);
		if(!$scope.product.tags)
			$scope.product.tags = $scope.tag.externalModel.join(", ");
		if($scope.editProduct){
			ProductFactory.updateProduct($scope.product, $scope.store.Id, function(){
				$timeout(function(){
					$ionicLoading.hide();
					$ionicHistory.currentView($ionicHistory.backView());
					$state.go("db.productDetail", {productId : $scope.editProduct.Id});
				}, 2000);
			}, function(err){
				$ionicLoading.hide();
				Log.message(JSON.stringify(err.data), true, "Error");
			})
		}else{
			$scope.product = JSUtils.mergeOptions($scope.product, {
				published : false,
				published_scope : "web",
				vendor : $scope.store.External_Id__c,
				options : [
					{name : 'Size'},
					{name : 'Color'}
				],
				variants : [
					{
						"option1" : "Small",
						"option2" : "Blue",
						"inventory_management" : "shopify",
						"inventory_policy" : "deny",
						"sku" : $scope.product.sku,
						metafields : [
							{
								"key" : "metaprice",
								"value" : ($scope.meta.price) ? $scope.meta.price * 100 : 0,
								"value_type" : "integer",
								"namespace" : "price"
							},
							{
								"key" : "metalistprice",
								"value" : ($scope.meta.price) ? $scope.meta.price * 100 : 0,
								"value_type" : "integer",
								"namespace" : "price"
							},
							{
								"key" : "metalistpricecurrent",
								"value" : ($scope.meta.price) ? $scope.meta.price * 100 : 0,
								"value_type" : "integer",
								"namespace" : "price"
							}
						]
					}
				],
				metafields : [
					{
						"key" : "brand",
						"value" : ($scope.meta.brand) ? $scope.meta.brand : 'N/A',
						"value_type" : "string",
						"namespace" : "product"
					},
					{
						"key" : "cluster",
						"value" : ($scope.store.Shopping_District__c) ? $scope.store.Shopping_District__c : 'N/A',
						"value_type" : "string",
						"namespace" : "product"
					}
				]
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
						}else if(tries >= 30){
							$ionicLoading.hide();
							$interval.cancel(checkProduct);
							Log.message("The product is taking longer than expected to create. It will be available in the product list when it is finished.", true, "Warning");
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
	}

	$scope.editTags = function(){
		var ionAutocompleteElement = document.getElementsByClassName("tags");
    angular.element(ionAutocompleteElement).controller('ionAutocomplete').fetchSearchQuery("", true);
    angular.element(ionAutocompleteElement).controller('ionAutocomplete').showModal();
	}
	$scope.closeModal = function(){
		$scope.modal.remove();
	}
	$scope.saveEdit = function(){
		if($scope.editImage.new)
			$scope.product.images[0].attachment = $scope.editImage.new.substring($scope.editImage.new.indexOf('base64,') + 7);
		delete $scope.product.images[0].src;
		$scope.modal.remove();
	}

	$scope.$on('$ionicView.beforeEnter', function(){
    if(!$scope.store){
      $scope.getStore(false);
    }
		if($state.params.productId){
			$scope.getProduct(false);
		}else{
			$scope.product = {
				images : []
			};
			$scope.tag = {externalModel : ['New']};
			$scope.meta = {district : "Pearl District"};
			$scope.info = {};
		}
		$scope.categories = ['Clothing', 'Shoes', 'Handbags', 'Accessories'];
		$scope.genders = ['Men', 'Women'];
		$scope.validator = ProductValidator;
  });
})

angular.module('dorrbell').controller('DbProductDetailController', function($scope, $ionicActionSheet, $ionicPopup, $ionicLoading, $ionicHistory, $state, Log, ProductFactory){
	$scope.getProduct = function(noCache){
		return ProductFactory.getProductDetailsById($state.params.productId, noCache);
	}


	$scope.openSubmenu = function($event){
		var sheet = $ionicActionSheet.show({
			buttons : [
				{
					text : '<i class="icon ion-plus-round"></i> Add Variant'
				},
				{
					text : '<i class="icon ion-edit"></i> Edit Product'
				}
			],
			destructiveText : '<i class="icon ion-trash-a"></i> Delete Product',
			buttonClicked : function(index){
				sheet();
				if(index == 0){
					$state.go('db.variantNew', {productId : $scope.product.Id});
				}else{
					$state.go('db.newProduct', {storeId : $scope.product.Store__c, productId : $scope.product.Id})
				}
			},
			destructiveButtonClicked : function(){
				sheet();
				$ionicPopup.show({
					title :  'Delete ' + $scope.product.Name,
					subTitle : "Are you sure you want to delete this product? This action cannot be undone.",
					scope : $scope,
					buttons : [
						{ text: 'Cancel' },
						{
							text : '<b>Confirm</b>',
							onTap : function(e){
								$ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
								ProductFactory.deleteProduct($scope.product.Shopify_Id__c, $scope.product.Store__c).then(function(){
									$ionicLoading.hide();
									$ionicHistory.goBack();
								}, function(err){
									$ionicLoading.hide();
									Log.message(err, true, "Error");
								})
							},
							type: 'button-assertive',
						}
					]
				});
			},
			cssClass : "dorrbell_menu"
		})
	}
	$scope.togglePublish = function(){
		ProductFactory.updateProduct($scope.shProduct, $scope.product.Store__c, function(){});
	}
	$scope.toggleReorder = function(){
		$scope.showReorder = !$scope.showReorder;
		if(!$scope.showReorder){
			var pArray = new Array();
			for(var i = 0; i < $scope.product.Variants__r.records.length; i++){
				pArray.push({
					"id" : $scope.product.Variants__r.records[i].Shopify_Id__c,
					"position" : i + 1
				});
			}
			ProductFactory.updateVariantBatch(pArray, $scope.product.Shopify_Id__c, $scope.product.Id);
		}
	}

	$scope.reorderItem = function(variant, fromIndex, toIndex){
		$scope.product.Variants__r.records.splice(fromIndex, 1);
    $scope.product.Variants__r.records.splice(toIndex, 0, variant);
	}

	$scope.delete = function(item){
		$ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
		ProductFactory.deleteVariant($scope.product.Shopify_Id__c, item.Shopify_Id__c, function(){
			$ionicLoading.hide();
			$scope.getProduct(true);
			$scope.showReorder = false;
		})
	}

	$scope.openImageModal = function(){
		$state.go('db.productGallery', {productId : $scope.product.Id});
	}

	$scope.$on('$ionicView.beforeEnter', function(){
    $scope.$watchCollection($scope.getProduct(true), function(newValue, oldValue){
			if(newValue){
				$scope.product = newValue[0];
				$scope.shProduct.id = $scope.product.Shopify_Id__c;
				$scope.shProduct.published = $scope.product.Published_At__c != null;
			}
			$scope.$broadcast('scroll.refreshComplete');
		});
		$scope.shProduct = {};
		$scope.menu = {state : 'closed'};
  });
});

angular.module('dorrbell').controller('GalleryController', function($scope, $rootScope, $state, $cordovaCamera, $cordovaImagePicker, $timeout, $ionicActionSheet, $ionicPopup, $ionicLoading, ImageService, ProductFactory, Log){

	var reload = function(){
		$scope.getProduct(true);
		$ionicLoading.hide();
	}
	var errorHandler = function(err){
		Log.message(err, true, "Error");
		$ionicLoading.hide();
	}

	$scope.getProduct = function(noCache){
		return ProductFactory.getProductDetailsById($state.params.productId, noCache);
	}

	$scope.getImageClass = function(image){
		if(!image.Shopify_Id__c)
			return 'col thumb new';
		else if(image.Shopify_Id__c == $scope.product.Image__r.Shopify_Id__c)
			return 'col thumb selected';
		else
			return 'col thumb';
	}

	$scope.getPicture = function(e) {
			$scope.menu.state = "closed";
			try{
					var options = {
							quality: 100,
							destinationType: Camera.DestinationType.DATA_URL,
							sourceType: Camera.PictureSourceType.CAMERA,
							allowEdit : false,
							encodingType: Camera.EncodingType.PNG,
							saveToPhotoAlbum : true,
							targetWidth: 1200,
							targetHeight: 1800
					};
					$cordovaCamera.getPicture(options).then(function(data) {
						var loadingImage = {Image_Thumb__c : "data:image/png;base64," + data};
						$scope.loading.images.push(loadingImage);


						var image = {attachment : data};
						if(!$scope.product.Images__r || $scope.product.Images__r.records.length == 0)
							image.position = 1;

						ProductFactory.createImage(image, $scope.product.Shopify_Id__c).then(function(){
							$scope.loading.images.splice($scope.loading.images.indexOf(loadingImage), 1);
							reload();
						}, errorHandler);
					}, function(){

					});
			}catch(err){
				Log.message("Cannot access camera", true, "Error");
			}
	}
	$scope.getPictureFromGallery = function(e) {
		$scope.menu.state = "closed";
		var options = {
				maximumImagesCount: 1,
				quality: 100
		};

		try {
			 $cordovaImagePicker.getPictures(options)
					.then(function(results) {
							if (results[0]) {
									if(ionic.Platform.isIOS())
										results[0] = results[0].substring(results[0].indexOf('/tmp/'));

									ImageService.convertUrlToBase64(results[0], function(data) {
										$timeout(function(){
											var loadingImage = {Image_Thumb__c : data};
											$scope.loading.images.push(loadingImage);

											if(data.indexOf('base64,') >= 0)
												data = data.substring(data.indexOf('base64,') + 7);

											var image = {attachment : data};
											if(!$scope.product.Images__r || $scope.product.Images__r.records.length == 0)
												image.position = 1;
											ProductFactory.createImage(image, $scope.product.Shopify_Id__c).then(function(){
												$scope.loading.images.splice($scope.loading.images.indexOf(loadingImage), 1);
												reload();
											}, errorHandler);
										})
									}, "image/jpeg", 1200, 1800);
							}else{

							}
					}, function(error) {
						Log.message("Error loading photo", true, "Error");
					});
		} catch(err){
			Log.message("Cannot access gallery", true, "Error");
		}
	}

	$scope.openSubmenu = function($event, image){
		var sheet = $ionicActionSheet.show({
			destructiveText : '<i class="icon ion-trash-a"></i> Delete',
			buttons : [
				{text : '<i class="icon ion-checkmark-circled"></i> Make Primary Image'}
			],
			destructiveButtonClicked : function(){
				sheet();
				var confirmPopup = $ionicPopup.confirm({
				  title: 'Delete Image',
				  template: 'Are you sure you want to delete this image?'
				}).then(function(res) {
				  if(res) {
						$ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
				    ProductFactory.deleteImage(image.Shopify_Id__c, $scope.product.Shopify_Id__c).then(reload, errorHandler);
				  }
				});
			},
			buttonClicked : function(index){
				sheet();
				if(index == 0){
					$ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
					ProductFactory.updateImage({
						"id" : image.Shopify_Id__c,
						"position" : 1
					}, $scope.product.Shopify_Id__c).then(reload, errorHandler);
				}
			},
			cssClass : "dorrbell_menu"
		})
	}

	$scope.$on('$ionicView.beforeEnter', function(){
    $scope.getProduct(false);
		$scope.menu = {state : 'closed'};

		$scope.$watchCollection($scope.getProduct(true), function(newValue, oldValue){
			if(newValue){
				$scope.product = newValue[0];
				$rootScope.$emit('lazyImg:refresh');
			}
		});

		if(window.screen.lockOrientation){
			window.screen.lockOrientation('portrait')
		}
  });
	$scope.$on('$ionicView.beforeLeave', function(){
		if(window.screen && window.screen.unlockOrientation){
			window.screen.unlockOrientation()
		}
	});
	$scope.loading = {images : new Array()};
});

angular.module('dorrbell').controller('VariantNewController', function($scope, $state, $ionicLoading, $ionicPopup, $ionicHistory, $cordovaBarcodeScanner, $ionicNativeTransitions, $q, $filter, ProductFactory, MetadataFactory, Log){
	$scope.getProduct = function(noCache){
		return ProductFactory.getProductDetailsById($state.params.productId, noCache);
	}

	$scope.saveVariant = function(){
		$scope.menu = "closed";
		$ionicLoading.show({
    	template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
  	});

		$scope.variant.metafields = [
			{
				"key" : "metaprice",
				"value" : $scope.metaprice.price * 100,
				"value_type" : "integer",
				"namespace" : "price"
			},
			{
				"key" : "metalistprice",
				"value" : $scope.metaprice.price * 100,
				"value_type" : "integer",
				"namespace" : "price"
			},
			{
				"key" : "metalistpricecurrent",
				"value" : $scope.metaprice.price * 100,
				"value_type" : "integer",
				"namespace" : "price"
			}
		];
		$scope.variant.inventory_policy = "deny";
		$scope.variant.inventory_management = "shopify";

		ProductFactory.createVariant($scope.parentProduct.Shopify_Id__c, $scope.variant, function(res){
			$ionicLoading.hide();

			$ionicPopup.show({
				title :  'Variant Saved',
				subTitle : $scope.variant.option1 + '/' + $scope.variant.option2 + ' ' + $scope.parentProduct.Name,
				scope : $scope,
				buttons : [
					{
						text : 'Done',
						onTap : function(e){
							$ionicHistory.goBack();
						}
					},
					{
						text : 'New',
						onTap : function(e){
							$ionicHistory.currentView($ionicHistory.backView());
							$ionicNativeTransitions.stateGo($state.current, {productId : $scope.parentProduct.Id}, {
							    "type": "flip"
							}, {reload: true});
							//$state.go($state.current, {productId : $scope.parentProduct.Id}, {reload: true});
						},
						type: 'button-positive',
					}
				]
			});
		}, function(err){
			$ionicLoading.hide();
			if(err.data.base)
				Log.message(err.data.base[0], true, "Error");
			else
				Log.message("Oops...something went wrong", true, "Error");
		});
	}

	$scope.getProductSizes = function(query){
		return $q(function(resolve, reject){
			ProductFactory.getProductSizes().then(function(res){
				resolve($filter("listSorter")(res, query));
		 	}, reject)
		});
	}

	$scope.getProductColors = function(query){
		return $q(function(resolve, reject){
			ProductFactory.getProductColors().then(function(res){
				resolve($filter("listSorter")(res, query));
		 	}, reject)
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
		$scope.metaprice = {};

    $scope.$watchCollection($scope.getProduct(false), function(newValue, oldValue){
			if(newValue){
				$scope.parentProduct = newValue[0];
				$scope.variant = {
					sku : $scope.parentProduct.SKU__c,
					inventory_quantity : 1,
					option2 : $state.params.color
				};
				if($scope.parentProduct.Images__r && $scope.parentProduct.Images__r.records)
					$scope.variant.image_id = $scope.parentProduct.Images__r.records[0].Shopify_Id__c;
				else
					$scope.parentProduct.Images__r = {records : new Array()};

				if(newValue[0].Variants__r && newValue[0].Variants__r.records.length > 0){
					ProductFactory.getPriceForProduct(newValue[0].Variants__r.records[0].Id).then(function(results){
						if(results && results.length > 0)
							$scope.metaprice.price = results[0].UnitPrice;
					})
				}
			}
			$scope.$broadcast('scroll.refreshComplete');
		});
  });

	$scope.options = {
		slidesPerView : 3,
		centeredSlides : true,
		paginationHide : true,
		paginationBulletRender : function (){ return '';}
	}
	$scope.$on("$ionicSlides.sliderInitialized", function(event, data){
	  $scope.slider = data.slider;
	});
	$scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
		$scope.variant.image_id = $scope.parentProduct.Images__r.records[data.slider.activeIndex].Shopify_Id__c;
	});

})

angular.module('dorrbell').controller('VariantEditController', function($scope, $ionicLoading, $ionicPopup, $state, $timeout, $ionicHistory, $ionicNativeTransitions, $cordovaBarcodeScanner, $q, $filter, ProductFactory, Log){
	$scope.getProduct = function(noCache){
		return ProductFactory.getProductDetailsById($state.params.productId, noCache);
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
	$scope.getProductSizes = function(query){
		return $q(function(resolve, reject){
			ProductFactory.getProductSizes().then(function(res){
				resolve($filter("listSorter")(res, query));
		 	}, reject)
		});
	}

	$scope.getProductColors = function(query){
		return $q(function(resolve, reject){
			ProductFactory.getProductColors().then(function(res){
				resolve($filter("listSorter")(res, query));
		 	}, reject)
		});
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

	$scope.saveVariant = function(){
		$scope.menu = "closed";
		$ionicLoading.show({
    	template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
  	});
		ProductFactory.updateVariantFromProduct($scope.product, function(res){
			$ionicLoading.hide();
			$ionicPopup.show({
				title :  'Variant Saved',
				subTitle : $scope.findOption($scope.product.Product_Options__r.records, 'Size').Value__c + '/' + $scope.findOption($scope.product.Product_Options__r.records, 'Color').Value__c + ' ' + $scope.product.Root_Product_Name__c,
				scope : $scope,
				buttons : [
					{
						text : 'Done',
						onTap : function(e){
							$ionicHistory.goBack();
						}
					},
					{
						text : 'New',
						onTap : function(e){
							$ionicHistory.currentView($ionicHistory.backView());
							$ionicNativeTransitions.stateGo("db.variantNew", {productId : $scope.product.Parent_Product__c, color : $scope.findOption($scope.product.Product_Options__r.records, 'Color').Value__c}, {
							    "type": "flip"
							}, {location : 'replace'});
							//$state.go("db.variantNew", {productId : $scope.product.Parent_Product__c, color : $scope.findOption($scope.product.Product_Options__r.records, 'Color').Value__c}, {location : 'replace'});
						},
						type: 'button-positive',
					}
				]
			});
		});
	}

	$scope.$on('$ionicView.beforeEnter', function(){
    if(!$scope.product){
			$scope.$watchCollection($scope.getProduct(false), function(newValue, oldValue){
				if(newValue){
					$scope.product = newValue[0];
					ProductFactory.getProductImages($scope.product.Parent_Product__c).then(function(records){
						$scope.images = records;
						if(!$scope.activeIndex){
							if($scope.product.Image__r){
								for(var i = 0; i<$scope.images.length; i++){
									if($scope.images[i].Shopify_Id__c == $scope.product.Image__r.Shopify_Id__c)
										$scope.activeIndex = i;
								}
							}else{
								$scope.activeIndex = 0;
								$scope.product.Image__r = $scope.images[0];
							}

						}
					});
				}
				$scope.$broadcast('scroll.refreshComplete');
			});
    }
  });
	$scope.options = {
		slidesPerView : 3,
		centeredSlides : true,
		paginationHide : true,
		paginationBulletRender : function (){ return '';}
	}
	$scope.$on("$ionicSlides.sliderInitialized", function(event, data){
	  $scope.slider = data.slider;
		$scope.slider.slideTo($scope.activeIndex);
	});
	$scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
		$scope.product.Image__r = $scope.images[data.slider.activeIndex];
		$scope.activeIndex = data.slider.activeIndex;
	});
})
