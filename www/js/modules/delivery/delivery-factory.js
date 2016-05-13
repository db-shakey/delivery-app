angular.module('dorrbell').factory("DeliveryFactory", function(force, $rootScope, $localCache){
	var cache = {};
	return {
		getDeliveriesForOrder : function(orderId, noCache){
			var query = "SELECT Id, \
							Store__r.Name, \
							Store__r.Phone__c, \
							Store__r.Store_Street_Address__c, \
							Store__r.Store_City__c, \
							Store__r.State_Province__c, \
							Store__r.Postal_Zip_Code__c \
						FROM Order_Store__c \
						WHERE Orcer__c = '" + orderId + "'";
			return $localCache.watchRecords(query, noCache);
		},
		getDeliveriesForStore : function(beginDate, noCache){
			beginDate.setHours(0,0,0,0);
			var endDate = new Date();
			endDate.setDate(beginDate.getDate() + 1);
			endDate.setHours(0,0,0,0);
			console.log($rootScope.currentUser);
			var query = "SELECT Id, \
								Name, \
								Order__r.In_Home_Try_On_Start__c, \
								Order__r.In_Home_Try_On_End__c, \
								Order__r.ShipToContact.FirstName, \
								Order__r.ShipToContact.LastName, \
								Order__r.ShipToContact.Name, \
								Status__c \
							FROM Order_Store__c \
							WHERE Store__c = '" + $rootScope.currentUser.Store__c + "' \
							AND Order__r.In_Home_Try_On_Start__c > " + beginDate.toISOString() + " AND Order__r.In_Home_Try_On_Start__c < " + endDate.toISOString();
			return $localCache.watchRecords(query, noCache);
		},
		getDeliveryById : function(deliveryId, noCache){
			var query = "SELECT Id, \
								Name, \
								Status__c, \
								Checkout_Ready__c, \
								Store__r.Name, \
								Store__c, \
								Order__r.Name, \
								Order__r.Shopify_Id__c, \
								Order__r.Request_Additional_Items__c, \
								Order__r.Status__c, \
								Order__c, \
								(SELECT Id, \
									PricebookEntry.Product2.Name, \
									PricebookEntry.Product2.Image__r.Image_Source__c, \
									PricebookEntry.Product2.Parent_Product__r.Image__r.Image_Source__c, \
									PricebookEntry.Product2.Root_Product_Name__c, \
									PricebookEntryId, \
									Status__c, \
									ListPrice, \
									UnitPrice, \
									OrderId, \
									Order_Store__c, \
									PricebookEntry.Product2.SKU__c, \
									PricebookEntry.Product2.Brand__c, \
									PricebookEntry.Product2.Barcode__c, \
									PricebookEntry.Product2.Department__c, \
									PricebookEntry.Product2.Family \
								FROM Order_Products__r WHERE Status__c <> 'Removed') \
							FROM Order_Store__c \
							WHERE Id = '" + deliveryId + "'";
			$localCache.getRecords(query, noCache);
			return function(){
				return $localCache.fromCache(query);
			}
		},
		setStatus : function(deliveryId, status, callback){
			var data = {"Id" : deliveryId, "Status__c" : status};
			force.update("Order_Store__c", data, callback);
		},
		acceptDelivery : function(deliveryId, callback){
			var data = {"Id" : deliveryId, "Status__c" : "Accepted By Retailer", "Accepted_By__c" : $rootScope.currentUser.Id, "Accepted_At__c" : new Date()};
			force.update("Order_Store__c", data, callback);
		},
		createOrderItem : function(PricebookEntry, OrderShopifyId, orderStoreId, callback, error){
			force.post("/api/createOrderItem", {"PricebookEntry" : PricebookEntry, "OrderId" : OrderShopifyId, "ContactId" : $rootScope.currentUser.Id}, 'Order_Store__c', orderStoreId,  function(res){
				if(res == "Ok"){
					$localCache.triggerUpdate("Order_Store__c", orderStoreId);
					callback();
				}else
					error();
			});

		}
	}
});

angular.module('dorrbell').factory("DeliveryItemFactory", function(force, $rootScope){
	return {
		confirmPrice : function(itemId, ConfirmPrice, callback){
			var data = {"Id" : itemId, "UnitPrice" : ConfirmPrice, "Price_Confirmed__c": true, "Status__c" : "Ready For Check Out", "Price_Confirmed_By__c" : $rootScope.currentUser.Id};
			force.update('OrderItem', data, callback);
		},
		updatePrice : function(itemId, ConfirmPrice, callback){
			var data = {"Id" : itemId, "UnitPrice" : ConfirmPrice};
			force.update('OrderItem', data, callback);
		},
		startReturn : function(item, callback){
			force.post("/api/returnItem", item, "Order", item.OrderId, callback);
		},
		confirmItem : function(item, callback){
			var data = {
						"Id" : item.Id,
						"Item_Confirmed__c" : true,
						"Status__c" : "Ready For Check Out",
						"Item_Confirmed_By__c" : $rootScope.currentUser.Id,
						"UnitPrice": item.UnitPrice
					};
			force.update("OrderItem", data, callback);
		},
		checkOutItem : function(item, callback){
			var data = {
				"Id" : item.Id,
				"Was_Checked_Out__c" : true,
				"Item_Checked_Out_By__c" : $rootScope.currentUser.Id,
				"Status__c" : "Checked Out"
			};
			force.update("OrderItem", data, callback);
		},
		checkIn : function(item, callback){
			force.post("/api/checkInItem", item, "Order", item.OrderId, callback);
		},
		removeItem : function(itemId, removeReason, callback){
			var data = {"Id" : itemId, "Removed_Reason__c" : removeReason, "Status__c" : "Removed", "Item_Removed_By__c" : $rootScope.currentUser.Id, "Item_Confirmed_By__c" : "", "Price_Confirmed_By__c" : "", "Item_Checked_Out_By__c" : "", "UnitPrice" : 0};
			force.update("OrderItem", data, callback);
		}
	}
});

_app.factory("SearchFactory", function(force, $rootScope){
	return {
		searchItems : function(searchText, store, limit, coords, callback){
			searchText = (!searchText || searchText.trim().length == 0) ? ' ' : searchText;
			store = (!store || store.trim().length == 0) ? ' ' : store;
			force.get("/api/searchAllItems/" + encodeURIComponent(searchText) + "/" + store + "/"  + limit, callback);
		},
		searchByBarcode : function(barcode, store, callback){
			force.get("/api/searchProductByBarcode/" + barcode + "/" + store, callback);
		}
	}
});
