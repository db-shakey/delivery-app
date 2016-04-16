angular.module('dorrbell').controller("ReturnController", function($scope, $state, $cordovaBarcodeScanner, $ionicPopup, $ionicHistory, Log, DeliveryItemFactory, OrderFactory, $ionicLoading) {
  $scope.getOrder = function(noCache) {
    $scope.$watch(OrderFactory.getOrderById($state.params.orderId, noCache), function(newValue, oldValue) {
      if (newValue){
        $scope.order = newValue[0];
      }
    });
  }
  $scope.scanItem = function() {
      $scope.order.returnStatus = "closed";
      $cordovaBarcodeScanner
          .scan()
          .then(function(barcodeData) {
              if(barcodeData.text && !barcodeData.cancelled)
                  handleBarcode(barcodeData.text)
          }, function(error) {
              Log.message(error, true);
          });
  }

  $scope.enterItem = function() {
      $scope.order.returnStatus = "closed";
      $scope.entryData = {};
      if(window.cordova)
        cordova.plugins.Keyboard.disableScroll(false);

      var confirmPopup = $ionicPopup.confirm({
          title: 'Enter Barcode',
          template: '<label class="item-input-wrapper"><input type="text" ng-model="entryData.barcode"/></label>',
          scope: $scope
      });
      confirmPopup.then(function(res) {
          if(window.cordova)
            cordova.plugins.Keyboard.disableScroll(true);
          if (res) {
              handleBarcode($scope.entryData.barcode);
          }
      });
  }
  $scope.getReturns = function(noCache){
      $scope.$watch(OrderFactory.getReturnsForOrder($state.params.orderId, noCache), function(newValue, oldValue) {
          if (newValue)
            $scope.returns = newValue;

          $scope.$broadcast('scroll.refreshComplete');
      });

      $scope.$watch(OrderFactory.getDeliveryItemsForOrder($state.params.orderId, noCache), function(n, o) {
          if(n)
              $scope.items = n;
      });
  }

  $scope.finishReturns = function(){
    $ionicLoading.show({
    		template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
  	});
    OrderFactory.startReturns($scope.order, function(){
      $ionicLoading.hide();
			$ionicHistory.goBack();
		});
  }

  var handleBarcode = function(barcodeValue){
      var found = false;
      angular.forEach($scope.items, function(obj, index) {
          if (!found && obj.PricebookEntry.Product2.Barcode__c.toUpperCase() == barcodeValue.toUpperCase()) {
              DeliveryItemFactory.startReturn(obj);
              found = true;
          }
      });
      if (!found)
          Log.message("This barcode does not match an item in the order. Please retry.", true, "Invalid Barcode");
  }
  $scope.getOrder();
  $scope.getReturns();
})
