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
      },
      initialFilterText : $scope.searchString,
      favoritesEnabled : false
    });
  };

  $scope.goToStore = function(store){
    $scope.canLoad = false;
    $state.go("db.storeDetail", {storeId : store.Id});
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    if($scope.searchString)
      $scope.showFilterBar();

    $scope.canLoad = true;
    if(!$scope.storeList){
      $scope.searchStores('', 10);
    }
  });

});

angular.module('dorrbell').controller("StoreDetailController", function($scope, $state, $ionicModal, StoreFactory){
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
      }
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.goToUrl = function(url){
    window.open(url, '_system', 'location=yes');
  }

  $scope.doCall = function(phone){
    window.open("tel:+1" + phone);
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.openHours = function(){
    $ionicModal.fromTemplateUrl('store-hours.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.getStore(false);
  });
})
