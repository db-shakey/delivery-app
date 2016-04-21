angular.module('dorrbell').factory("ProductFactory", function(force, $rootScope, $localCache, $q, HerokuService, force){
	return {
		getProductById : function(productId, noCache){
			var query = "SELECT Id, \
									Product2.SKU__c, \
									Product2.Root_Product_Name__c, \
									Product2.Name, \
									Product2.Shopify_Id__c, \
									Product2.Id, \
									UnitPrice, \
									Product2.Image__r.Image_Source__c, \
									Product2.Barcode__c, \
									Product2.Store__r.Name, \
									Product2.Store__r.External_Id__c, \
									Product2.Store__c, \
									Product2.Parent_Product__r.Brand__c, \
									Product2.Parent_Product__r.Image__r.Image_Source__c, \
									Product2.Body_Html__c, \
									Product2.Family, \
									External_Id__c, \
									Product2.Store__r.Coordinates__Latitude__s, \
									Product2.Store__r.Coordinates__Longitude__s \
								FROM PricebookEntry \
								WHERE Product2.Parent_Product__c = '" + productId + "'";
			$localCache.getRecords(query, noCache);
			return function(){
				return $localCache.fromCache(query);
			}
		},
		getProductByExternalId : function(externalId, noCache){
			return $q(function(resolve, reject){
				force.query("SELECT Id, \
														SKU__c, \
														Name, \
														Shopify_Id__c, \
														Image__r.Image_Source__c, \
														Barcode__c, \
														Store__r.Name, \
														Store__r.External_Id__c, \
														Store__c, \
														Body_Html__c, \
														Family, \
														Tags__c, \
														(SELECT Id, Name, SKU__c, Barcode__c, Image__r.Image_Source__c FROM Variants__r), \
														(SELECT Id, Value__c, Option__r.Name FROM Product_Options__r) \
											FROM Product2 \
											WHERE Shopify_Id__c = '" + externalId + "'", resolve);
			});
		},
		getProductDetailsById : function(productId, noCache){
			var query = "SELECT Id, \
													SKU__c, \
													Name, \
													Shopify_Id__c, \
													Image__r.Image_Source__c, \
													Barcode__c, \
													Store__r.Name, \
													Published_At__c, \
													Store__r.External_Id__c, \
													Store__c, \
													Body_Html__c, \
													Family, \
													Tags__c, \
													(SELECT Id, Name, SKU__c, Barcode__c, Shopify_Id__c, Image__r.Image_Source__c FROM Variants__r WHERE IsActive = TRUE), \
													(SELECT Id, Value__c, Option__r.Name FROM Product_Options__r) \
										FROM Product2 \
										WHERE Id = '" + productId + "'";
				$localCache.getRecords(query, noCache);
				return function(){
					return $localCache.fromCache(query);
				}
		},
		getVariantById : function(productId, noCache){
			var query = "SELECT Id, \
													SKU__c, \
													Root_Product_Name__c, \
													Name, \
													Shopify_Id__c, \
													Image__r.Image_Source__c, \
													Barcode__c, \
													Store__r.Name, \
													Store__r.External_Id__c, \
													Store__c, \
													Body_Html__c, \
													Family, \
													Tags__c, \
													Parent_Product__c, \
													Inventory_Quantity__c, \
													Parent_Product__r.Shopify_Id__c, \
													(SELECT Id, UnitPrice FROM PricebookEntries), \
													(SELECT Id, Value__c, Option__r.Name FROM Product_Options__r) \
										FROM Product2 \
										WHERE Id = '" + productId + "'";
				$localCache.getRecords(query, noCache);
				return function(){
					return $localCache.fromCache(query);
				}
		},
		getProductsByOrderId : function(orderId, noCache){
			var query = "SELECT Id, \
													Name, \
													( \
														SELECT Id, \
															PricebookEntry.Product2.Name, \
															PricebookEntry.Product2.Image__r.Image_Source__c, \
															PricebookEntry.Product2.Parent_Product__r.Image__r.Image_Source__c, \
															PricebookEntry.Product2.Root_Product_Name__c, \
															PricebookEntryId, \
															Status__c, \
															ListPrice, \
															UnitPrice, \
															OrderId, \
															Order.Name, \
															Order_Store__c, \
															PricebookEntry.Product2.SKU__c, \
															PricebookEntry.Product2.Brand__c, \
															PricebookEntry.Product2.Barcode__c, \
															PricebookEntry.Product2.Department__c, \
															PricebookEntry.Product2.Family \
														FROM OrderItems \
																WHERE Status__c <> 'Removed' \
													) \
										FROM Order WHERE Id = '" + orderId + "'";
			$localCache.getRecords(query, noCache);
			return function(){
				return $localCache.fromCache(query);
			}
		},
		createProduct : function(product, storeId, callback, error){
			force.post('/api/shopify/createProduct', product, 'Store__c', storeId, callback, error);
		},
		updateProduct : function(product, storeId, callback, error){
			HerokuService.post('/api/shopify/updateProduct', product, callback, error);
		},
		updateVariant : function(product, callback){
			force.post('/api/shopify/updateVariant', product, 'Product2', product.Id, callback);
		},
		createVariant : function(productId, variant, callback, error){
			force.post('/api/shopify/createVariant', {
				productId : productId,
				variant : variant
			}, 'Product2', productId, callback, error);
		},
		deleteVariant : function(productExternalId, variantExternalId, callback){
			HerokuService.post('/api/shopify/deleteVariant', {
				productId : productExternalId,
				variantId : variantExternalId
			}, callback);
		},
		setBarcode : function(productId, barcodeData, callback){
			force.update("Product2", {"Id" : productId, "Barcode__c" : barcodeData.text, "Barcode_Type__c" : barcodeData.format}, callback);
		},
		getProductTypes : function(){
			return $q(function(resolve, reject){
				HerokuService.get('/api/shopify/productTypes', resolve, reject);
			});
		}
	}
});

angular.module('dorrbell').factory("SearchFactory", function(force, $rootScope, HerokuService){
	return {
		searchItems : function(searchText, store, limit, coords, callback){
			searchText = (!searchText || searchText.trim().length == 0) ? ' ' : searchText;
				if(store){
					return this.searchStoreItems(store, searchText, limit, callback);
				}else{
					HerokuService.get("/api/searchAllItems/" + encodeURIComponent(searchText) + "/" + coords.latitude + "/" + coords.longitude + "/" + limit, callback);
				}
		},
		searchByBarcode : function(barcode, store, callback){
			HerokuService.get("/api/searchProductByBarcode/" + barcode + "/" + store, callback);
		},
		searchStoreItems : function(store, searchText, limit, callback){
			searchText = (!searchText || searchText.trim().length == 0) ? ' ' : searchText;
			limit = (limit == 0 || !limit) ? 10 : limit;
			HerokuService.get('/api/searchStoreItems/' + store + '/' + encodeURIComponent(searchText) + '/' + limit, callback);
		}
	}
});
