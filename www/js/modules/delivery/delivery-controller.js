/**
 *  DeliveryDetail
 *  @description: Detail controller for delivery details
 */
angular.module('dorrbell').controller('DeliveryDetail', function($scope, $state, DeliveryFactory, DeliveryItemFactory, $timeout, $ionicPopup, $filter, $cordovaBarcodeScanner, $ionicActionSheet, $ionicLoading, $ionicHistory, Log, ItemValidator, DeliveryValidator, MetadataFactory){
  var deliveryId = $state.params.deliveryId;
  $scope.v = ItemValidator;
  $scope.dv = DeliveryValidator;
  $scope.slideHeader = false;
  $scope.slideHeaderPrevious = 0;
  $scope.buttonState = 'open';
  MetadataFactory.describe("OrderItem", function(metaFields){
    $scope.removeReasons = $filter('filter')(metaFields, {name : 'Removed_Reason__c'})[0].picklistValues;
  });

  var manualBarcode = function(item, callback){
    $scope.item = item;
    $scope.updateItem = false;

    var confirmPopup = $ionicPopup.confirm({
      title: 'Enter Barcode',
      template: '<label class="item-input-wrapper"><input type="text" ng-model="item.manual_barcode" autofocus/></label>',
      scope : $scope
    });
    confirmPopup.then(function(res){
        if(res && $scope.item.manual_barcode)
            callback($scope.item.manual_barcode.toUpperCase());
    });
  }
  var scanItem = function(item, callback){
    $cordovaBarcodeScanner
    .scan()
    .then(function(barcodeData){
        if(!barcodeData.cancelled)
            callback(barcodeData.text.toUpperCase());
    }, function(error) {
      Log.message(error, true);
    });
  }

  var verifyItem = function(item, callback){
    var sheet = $ionicActionSheet.show({
      buttons : [
        {
            text : '<i class="icon ion-ios-barcode"></i> Scan Barcode'
        },
        {
            text : '<i class="icon ion-edit"></i> Manual Entry'
        }
      ],
      buttonClicked : function(index){
        sheet();

        var afterEntry = function(barcodeData){
          if(barcodeData == item.PricebookEntry.Product2.Barcode__c.toUpperCase()){
              callback();
          }else{
            Log.message("The barcode " + barcodeData + " does not match the selected item.", true, "Invalid Barcode");
          }

        }

        if(index == 0)
          scanItem(item, afterEntry)
        else if(index == 1)
          manualBarcode(item, afterEntry)
      },
      cssClass : "dorrbell_menu"
    })
  }

  $scope.setPrice = function(item, callback){
    var p = $ionicPopup.show({
      template : '<label class="item-input-wrapper"><i class="icon ion-social-usd placeholder-icon"></i><input type="text" ng-model="item.UnitPrice" ui-number-mask autofocus/></label>',
      title : 'Confirm Price',
      scope : $scope,
      buttons : [
        {text : 'Cancel'},
        {
          text : '<b>Confirm</b>',
          type : 'button-positive',
          onTap : function(e){
            p.close();
            $ionicLoading.show({
              template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
            });
            callback();
          }
        }
      ]
    });
  }

  $scope.getDelivery = function(noCache){
    $scope.$watch(DeliveryFactory.getDeliveryById($state.params.deliveryId, noCache), function(newValue, oldValue){
      if(newValue)
        $scope.delivery = newValue[0];
      $scope.$broadcast('scroll.refreshComplete');
      $ionicLoading.hide();
    });
  }

  $scope.confirmItem = function(item){
      verifyItem(item, function(){
        $scope.setPrice(item, function(){
          DeliveryItemFactory.confirmItem(item, $scope.getDelivery);
        });
      })
  }

  $scope.checkoutItem = function(item){
    verifyItem(item, function(){
      $ionicLoading.show({
        template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
      });
      DeliveryItemFactory.checkOutItem(item, function(){
        $ionicLoading.hide();
        Log.message(item.PricebookEntry.Product2.Root_Product_Name__c, true, 'Item Checked Out');
      });
    })
  }

  $scope.checkInItem = function(item){
    verifyItem(item, function(){
      $ionicLoading.show({
        template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
      });
      DeliveryItemFactory.checkIn(item, function(){
        $ionicLoading.hide();
        Log.message(item.PricebookEntry.Product2.Root_Product_Name__c, true, 'Item Checked In');
      })
    })
  }

  $scope.removeItem = function(item){
    $scope.item = item;
    $scope.item.Removed_Reason__c = $scope.removeReasons[0].value;
    var p = $ionicPopup.show({
      template : '<select ng-model="item.Removed_Reason__c"><option ng-repeat="r in removeReasons" value="{{r.value}}">{{r.label}}</option></select>',
      title : 'Remove Item',
      subTitle : 'Please select a reason',
      scope : $scope,
      buttons : [
        {text : 'Cancel'},
        {
          text : '<b>Remove</b>',
          type : 'button-assertive',
          onTap : function(e){
            DeliveryItemFactory.removeItem(item.Id, $scope.item.Removed_Reason__c, function(){
              $scope.getDelivery(true);
            });
           p.close();
          }
        }
      ]
    });
  }
  $scope.openSubmenu = function($event){
    var sheet = $ionicActionSheet.show({
      buttons : [
        {
          text : '<i class="icon ion-plus-circled"></i> Add Item'
        }
      ],
      buttonClicked : function(index){
        sheet();
        if(index == 0){
          if($scope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact')
            $state.go('app.itemsearch', {"deliveryId" : $scope.delivery.Id});
          else
            $state.go('ret.itemsearch', {"deliveryId" : $scope.delivery.Id});
        }
      },
      cssClass : "dorrbell_menu"
    })
  }
  $scope.openItemSubmenu = function(item, $event){
    $scope.item = item;
    var sheet = $ionicActionSheet.show({
      buttons : [
        {
            text : '<i class="icon ion-ios-pricetag"></i> Update Price'
        },
        {
            text : '<i class="icon ion-close"></i> Remove Item'
        }
      ],
      buttonClicked : function(index){
        sheet();
        if(index == 1)
          $scope.removeItem(item);
        else if(index == 0){
          $scope.setPrice($scope.item, function(){
            DeliveryItemFactory.updatePrice($scope.item.Id, $scope.item.UnitPrice, $scope.getDelivery);
          });
        }
      },
      cssClass : "dorrbell_menu"
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

  $scope.goBack = function(){
    $ionicHistory.goBack();
  }

  $scope.getDelivery();
});



/**
 *  DeliveryListController
 *  @description: Controller to display list of deliverys based on type
 */
angular.module('dorrbell').controller('DeliveryListController', function($scope, $state, DeliveryFactory, RecordTypeFactory, $ionicPopup, $filter, $ionicHistory, ionicDatePicker){
  $ionicHistory.clearHistory();
  $scope.sort = 'Name';

  $scope.openDatePicker = function(){
    ionicDatePicker.openDatePicker({
      setLabel: 'Select',
      templateType: 'modal', //Optional
      callback: function (val) {  //Mandatory
        if(val){
          $scope.selectedDate = new Date(val);
          $scope.getDeliveries(false);
        }
      },
      closeOnSelect : true,
      showTodayButton: true,
      dateFormat: 'MM/dd/yyyy', //Optional
      inputDate: (!$scope.selectedDate) ? new Date() : $scope.selectedDate //Optional
    });
  };



  $scope.selectedDate = new Date();
  $scope.getDeliveries = function(noCache){
    $scope.$watch(DeliveryFactory.getDeliveriesForStore($scope.selectedDate, noCache), function(newValue, oldValue){
      if(newValue){
        angular.forEach(newValue, function(obj, index){
          var start = moment(obj.Order__r.In_Home_Try_On_Start__c);
          var end = moment(obj.Order__r.In_Home_Try_On_End__c);

          obj.easyStart = start.format("h:mm A");
          obj.easyEnd = end.format("h:mm A");

        });
        $scope.deliveryList = newValue;
      }

      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.acceptDelivery = function(delivery){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Accept Delivery',
      template: 'Do you want to accept this delivery?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        DeliveryFactory.acceptDelivery(delivery.Id, function(){
          $scope.getDeliveries();
          $state.go("ret.deliverydetail", {deliveryId : delivery.Id});
        });
      }
    });
  }
  $scope.orderBy = function(field){
      $scope.menuState = 'closed';
      $scope.sort = field;
  }

  $scope.getDeliveries(true);
});
