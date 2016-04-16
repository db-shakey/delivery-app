angular.module('dorrbell').factory("ProductFactory", function(force, $rootScope, $localCache){
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
		setBarcode : function(productId, barcodeData, callback){
			force.update("Product2", {"Id" : productId, "Barcode__c" : barcodeData.text, "Barcode_Type__c" : barcodeData.format}, callback);
		}
	}
});

angular.module('dorrbell').factory("SearchFactory", function(force, $rootScope, HerokuService){
	return {
		searchItems : function(searchText, store, limit, coords, callback){
				searchText = (typeof searchText != "undefined" && searchText.trim().length <= 0) ? 'undefined' : searchText;
				if(store){
					HerokuService.get("/api/searchStoreItems/" + store + "/" + encodeURIComponent(searchText) + "/" + limit, callback);
				}else{
					HerokuService.get("/api/searchAllItems/" + encodeURIComponent(searchText) + "/" + coords.latitude + "/" + coords.longitude + "/" + limit, callback);
				}
		},
		searchByBarcode : function(barcode, store, callback){
			HerokuService.get("/api/searchProductByBarcode/" + barcode + "/" + store, callback);
		}
	}
});
