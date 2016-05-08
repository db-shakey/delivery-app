angular.module('dorrbell').factory("StoreFactory", function(HerokuService, $localCache){
  return {
		searchStores : function(searchString, limit, callback){
      searchString = (!searchString || searchString.trim().length == 0) ? ' ' : searchString;
      limit = (limit == 0 || !limit) ? 10 : limit;
      HerokuService.get('/api/searchStores/' + searchString + '/' + limit, callback);
		},

    getStoreById : function(storeId, noCache){
      var query = "SELECT Id, \
                          Name, \
                          Phone__c, \
                          Address__c, \
                          Google_Phone_Number__c, \
                          Google_Website__c, \
                          Google_Icon__c, \
                          Google_Rating__c, \
                          Google_Store_Hours__c, \
                          External_Id__c, \
                          (SELECT Id, Name FROM Products__r WHERE RecordType.DeveloperName = 'Product' AND IsActive = TRUE), \
                          (SELECT Id, Image_Url__c FROM Store_Images__r LIMIT 1), \
                          (SELECT Id, Name FROM Contacts__r WHERE RecordType.DeveloperName = 'Retailer_Contact') \
                      FROM Store__c \
                      WHERE Id = '" + storeId + "'";
			$localCache.getRecords(query, noCache);
			return function(){
				return $localCache.fromCache(query);
			}
    }
  }
})
