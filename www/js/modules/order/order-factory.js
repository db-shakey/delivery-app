_app.factory("OrderFactory", function(force, RecordTypeFactory, $filter, $localCache, $rootScope){

	return {
		getOrders : function(beginDate, noCache){

			beginDate.setHours(0,0,0,0);
			var endDate = new Date();
			endDate.setDate(beginDate.getDate() + 1);
			endDate.setHours(0,0,0,0);

			var query = "SELECT Id, \
								Name, \
								Status__c, \
								ShipToContact.FirstName, \
								ShipToContact.LastName, \
								ShipToContact.Name, \
								Marked_Delivered__c, \
								Return_Collection_Time__c, \
								Return_Shopping_Assistant__c, \
								Delivery_Shopping_Assistant__c, \
								In_Home_Try_On_Start__c, \
								In_Home_Try_On_End__c, \
								(SELECT Id FROM Order_Stores__r) \
							FROM Order \
							WHERE (Delivery_Shopping_Assistant__c = '" + $rootScope.currentUser.Id + "' \
								AND In_Home_Try_On_Start__c > " + beginDate.toISOString() + " AND In_Home_Try_On_Start__c < " + endDate.toISOString() + ") \
								OR (Return_Shopping_Assistant__c = '" + $rootScope.currentUser.Id + "' AND Return_Collection_Time__c > " + beginDate.toISOString() + " AND Return_Collection_Time__c < " + endDate.toISOString() + ") \
							ORDER BY In_Home_Try_On_Start__c ASC";
			$localCache.getRecords(query, noCache);
			return function(){
				return $localCache.fromCache(query);
			}
		},

		getAvailableOrders : function(beginDate, noCache){
			beginDate.setHours(0,0,0,0);
			var endDate = new Date();
			endDate.setDate(beginDate.getDate() + 1);
			endDate.setHours(0,0,0,0);

			var query = "SELECT Id, \
								Name, \
								Status__c, \
								ShipToContact.FirstName, \
								ShipToContact.LastName, \
								ShipToContact.Name, \
								In_Home_Try_On_Start__c, \
								In_Home_Try_On_End__c, \
								Marked_Delivered__c, \
								ShippingLatitude, \
								ShippingLongitude, \
								(SELECT Id FROM Order_Stores__r) \
							FROM Order \
							WHERE DISTANCE(ShippingAddress, \
								GEOLOCATION(" + $rootScope.currentUser.Mailing_Location__Latitude__s + ", " + $rootScope.currentUser.Mailing_Location__Longitude__s + "), 'mi') < 20 \
								AND In_Home_Try_On_Start__c > " + beginDate.toISOString() + " AND In_Home_Try_On_End__c < " + endDate.toISOString() + " \
								AND ((Status__c = 'New' AND Delivery_Shopping_Assistant__c = null) OR (Status__c = 'Delivered To Customer' AND Return_Shopping_Assistant__c = null))";
			$localCache.getRecords(query, noCache);
			return function(){
				return $localCache.fromCache(query);
			}
		},

		getOrderById : function(orderId, noCache){
			var query = "SELECT Id, \
								Name, \
								Status__c, \
								ShipToContact.FirstName, \
								ShipToContact.LastName, \
								ShipToContact.Name, \
								ShipToContact.Phone, \
								In_Home_Try_On_Start__c, \
								In_Home_Try_On_End__c, \
								Shipping_Name__c, \
								ShippingStreet, \
								ShippingCity, \
								ShippingState, \
								ShippingPostalCode, \
								Note__c, \
								Delivery_Shopping_Assistant__c, \
								Return_Shopping_Assistant__c, \
								Marked_Delivered__c, \
								Marked_Retrieved__c, \
								Return_Collection_Time__c, \
								ShippingLatitude, \
								ShippingLongitude, \
								(SELECT Id \
									FROM OrderItems \
									WHERE Status__c != 'Removed'), \
								(SELECT Id, \
												Store__r.Name, \
												Status__c, \
												Store__r.Store_Street_Address__c, \
												Store__r.Store_City__c, \
												Store__r.State_Province__c, \
												Store__r.Postal_Zip_Code__c, \
												Store__r.Coordinates__Latitude__s, \
												Store__r.Coordinates__Longitude__s, \
												Store__r.Phone__c \
											FROM Order_Stores__r) \
							FROM Order WHERE Id = '" + orderId + "'";

			$localCache.getRecords(query, noCache);
			return function(){
				return $localCache.fromCache(query);
			}
		},
		getReturnsForOrder : function(orderId, noCache){
			var query = "SELECT Id, \
								PricebookEntryId, \
								PricebookEntry.Product2.Barcode__c, \
								PricebookEntry.Product2.Image__r.Image_Source__c, \
								PricebookEntry.Product2.Name, \
								PricebookEntry.Product2.Parent_Product__r.Family, \
								PricebookEntry.Product2.Root_Product_Name__c, \
								PricebookEntry.Product2.SKU__c, \
								PricebookEntry.Product2.Parent_Product__c, \
								PricebookEntry.Product2.Parent_Product__r.Image__r.Image_Source__c, \
								Order_Store__r.Store__c, \
								Order_Store__r.Store__r.Name, \
								Order_Store__c, \
								OrderId \
							FROM OrderItem \
							WHERE OrderId = '" + orderId + "' \
							 AND (Status__c = 'Returning' OR Status__c = 'Checked In')";
			$localCache.getRecords(query, noCache);
			return function(){
				return $localCache.fromCache(query);
			}
		},
		getDeliveryItemsForOrder : function(orderId, noCache){
			var query = "SELECT \
								PricebookEntry.Product2.Barcode__c, \
								Id, \
								Order_Store__c, \
								Status__c, \
								OrderId \
							FROM OrderItem \
							WHERE OrderId = '" + orderId + "' \
							 AND Status__c = 'Checked Out' AND Status__c != 'Removed'";
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
		acceptOrder : function(orderId, callback){
			force.post("/api/acceptOrder", {"orderId" : orderId, "contactId" : $rootScope.currentUser.Id}, "Order", orderId, callback);
		},
		acceptReturn : function(orderId, callback){
			force.post("/api/acceptReturn", {"orderId" : orderId, "contactId" : $rootScope.currentUser.Id}, "Order", orderId, callback);
		},
		setStatus : function(orderId, status, callback){
			var data = {"Id": orderId, "Status__c" : status};
			force.update("Order", data, callback);
		},
		startPickup : function(orderId, callback){
			force.post("/api/startPickup", {"orderId" : orderId}, "Order", orderId, callback);
		},
		startDelivery : function(orderId, callback){
			force.post("/api/startDelivery", {"orderId" : orderId}, "Order", orderId, callback);
		},
		startCollectingReturns : function(orderId, callback){
			force.post("/api/startCollectingReturns", {"orderId" : orderId}, "Order", orderId, callback);
		},
		completeDelivery : function(orderId, returnCollectionTime, callback){
			force.post("/api/completeDelivery", {"orderId" : orderId, "returnCollectionTime" : returnCollectionTime, "returnUser" : $rootScope.currentUser.Id}, "Order", orderId, callback);
		},
		completeOrder : function(order, callback){
			force.post("/api/completeOrder", order, "Order", order.Id, callback);
		},
		startReturns : function(order, callback){
			force.post("/api/startReturns", order, "Order", order.Id, callback);
		}
	}
});
