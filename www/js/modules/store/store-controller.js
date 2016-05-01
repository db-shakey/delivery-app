angular.module('dorrbell').controller('StoreListController', function($scope, StoreFactory, $ionicFilterBar, $ionicLoading, $state){
  var filterBarInstance;

  $scope.searchStores = function(str, lim){
    $scope.searchString = str;
    $scope.currentLimit = lim;
    StoreFactory.searchStores(str, lim, function(results){
      $scope.hasMore = results.hasMore;
      $scope.storeList = results.records;
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $ionicLoading.hide();
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
          $scope.searchStores(filterText);
        }
      }
    });
  };

  $scope.goToStore = function(store){
    $scope.canLoad = false;
    $state.go("db.storeDetail", {storeId : store.Id});
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.canLoad = true;
    if(!$scope.storeList){
      $scope.storeList = [];
      $scope.searchStores('', 10);
    }
  });

});

angular.module('dorrbell').controller("StoreDetailController", function($scope, $state, StoreFactory){
  $scope.getStore = function( noCache){
    $scope.$watch(StoreFactory.getStoreById($state.params.storeId, noCache), function(newValue, oldValue) {
      if (newValue){
        $scope.store = newValue[0];
        if($scope.store.Google_Store_Hours__c){
          angular.forEach($scope.store.Google_Store_Hours__c.split(/\r\n|\r|\n/g), function(obj, index){
            if(index == (new Date().getDay() - 1) || (index == 6 && new Date().getDay() == 0)){
              $scope.store.currentHour = obj;
            }
          });
        }
        console.log($scope.store);
      }
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.getStore(false);
  });
})
