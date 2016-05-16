angular.module('dorrbell').factory("ProductFactory", function(force, $rootScope, $localCache, $q, force){
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
		getProductDetailsById : function(productId, noCache, callback){
			var query = "SELECT Id, \
													SKU__c, \
													Name, \
													Shopify_Id__c, \
													Body_Html__c, \
													Family, \
													Tags__c, \
													Barcode__c, \
													Brand__c, \
													Inventory_Quantity__c, \
													Root_Product_Name__c, \
													Published_At__c, \
													Image__r.Image_Source__c, \
													Image__r.Shopify_Id__c, \
													Store__r.External_Id__c, \
													Store__c, \
													Store__r.Shopping_District__c, \
													Store__r.Name, \
													Parent_Product__c, \
													Parent_Product__r.Shopify_Id__c, \
													(SELECT Id, Name, SKU__c, Barcode__c, Shopify_Id__c, Image__r.Image_Source__c FROM Variants__r WHERE IsActive = TRUE), \
													(SELECT Id, Image_Source__c, Position__c, Shopify_Id__c FROM Images__r), \
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
		getPriceForProduct : function(productId){
			var query = "SELECT UnitPrice FROM PricebookEntry WHERE Product2Id = '" + productId + "'";
			return $q(function(resolve, reject){
				force.query("/api/query", query, resolve, reject);
			});
		},
		createProduct : function(product, storeId, callback, error){
			force.post('/api/shopify/createProduct', product, 'Store__c', storeId, callback, error);
		},
		updateProduct : function(product, storeId, callback, error){
			force.post('/api/shopify/updateProduct', product, 'Product2', product.Id, callback, error);
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
			force.post('/api/shopify/deleteVariant', {
				productId : productExternalId,
				variantId : variantExternalId
			}, null, null, callback);
		},
		setBarcode : function(productId, barcodeData, callback){
			force.update("Product2", {"Id" : productId, "Barcode__c" : barcodeData.text, "Barcode_Type__c" : barcodeData.format}, callback);
		},
		getProductTypes : function(){
			return $q(function(resolve, reject){
				force.get('/api/shopify/productTypes', resolve, reject);
			});
		},
		getProductTags : function(){
			return $q(function(resolve, reject){
				force.get('/api/shopify/productTags', resolve, reject);
			});
		},
		getProductSizes : function(){
			return $q(function(resolve, reject){
				force.get('/api/shopify/sizes', resolve, reject);
			});
		},
		getProductColors : function(){
			return $q(function(resolve, reject){
				force.get('/api/shopify/colors', resolve, reject);
			});
		}
	}
});

angular.module('dorrbell').factory("SearchFactory", function(force, $rootScope){
	return {
		searchItems : function(searchText, store, limit, callback){
			searchText = (!searchText || searchText.trim().length == 0) ? ' ' : searchText;
			store = (!store || store.trim().length == 0) ? ' ' : store;
			force.get("/api/searchAllItems/" + encodeURIComponent(searchText) + "/" + store + "/"  + limit, callback);

		},
		searchByBarcode : function(barcode, store, callback){
			force.get("/api/searchProductByBarcode/" + barcode + "/" + store, callback);
		}
	}
});
