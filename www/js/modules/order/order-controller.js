/**
 *  OrdersController
 *  @description: Controller for order list views
 */
angular.module('dorrbell').controller('OrdersController', function(OrderFactory, $scope, $state, $rootScope, $ionicPopup, $filter, $ionicPosition, $timeout, uiCalendarConfig) {

  var loadSources = function(){
    $scope.eventSources = [
      $scope.events,
      {
        url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
        className: 'gcal-event'           // an option!
      },
      function(start, end, timezone, callback){
        $scope.currentDate = new Date(end);
        if(!$scope.fromLoad){
          $scope.getOrders(false);
        }


        var events = new Array();
        angular.forEach($scope.orders, function(obj, index){
          //for delivery
          if(obj.Delivery_Shopping_Assistant__c == $scope.currentUser.Id){
            events.push({
              id : obj.Id,
              status : obj.Status__c,
              title : 'Order #' + obj.Name + '\nDrop Off Window',
              start : moment(obj.In_Home_Try_On_Start__c).toDate(),
              end : moment(obj.In_Home_Try_On_End__c).toDate(),
              className : (obj.Status__c == 'Assigned' || obj.Status__c == 'Accepted' || obj.Status__c == 'En Route to Customer' || obj.Status__c == 'Pick Up In Progress') ? 'filled' : 'complete'
            });
            var pickUpStart = moment(obj.In_Home_Try_On_Start__c).subtract(45, 'minutes').toDate();

            if(obj.Order_Stores__r){
              events.push({
                id : obj.Id,
                status : obj.Status__c,
                title : 'Order #' + obj.Name + '\nPick Up' + '\n' + obj.Order_Stores__r.totalSize + ' stores',
                start : pickUpStart,
                end : moment(obj.In_Home_Try_On_Start__c).subtract(1, 'minutes').toDate(),
                className : (obj.Status__c == 'Assigned' || obj.Status__c == 'Accepted' || obj.Status__c == 'En Route to Customer' || obj.Status__c == 'Pick Up In Progress') ? 'filled' : 'complete'
              });
            }
          }
          //for return
          if(obj.Return_Shopping_Assistant__c == $scope.currentUser.Id){
            events.push({
              id : obj.Id,
              status : obj.Status__c,
              title : 'Order #' + obj.Name + ' Pick Up',
              start : moment(obj.Return_Collection_Time__c).toDate(),
              end : moment(obj.Return_Collection_Time__c).add(14, 'minutes').toDate(),
              className : (obj.Status__c == 'Completed') ? 'complete' : 'filled'
            });
            events.push({
              id : obj.Id,
              status : obj.Status__c,
              title : 'Order #' + obj.Name + '\nReturn\n' + obj.Order_Stores__r.totalSize + ' stores',
              start : moment(obj.Return_Collection_Time__c).add(15, 'minutes').toDate(),
              end : moment(obj.Return_Collection_Time__c).add(55, 'minutes').toDate(),
              className : (obj.Status__c == 'Completed') ? 'complete' : 'filled'
            });
          }
        });
        $scope.fromLoad = false;
        $scope.$broadcast('scroll.refreshComplete');
        callback(events);
      }
    ];
  }

  $scope.uiConfig = {
    calendar:{
      contentHeight: 'auto',
      editable: false,
      defaultView: 'agendaDay',
      allDaySlot : false,
      businessHours : true,
      nowIndicator : true,
      aspectRatio : 4,
      defaultDate : new moment(),
      minTime : "08:00:00",
      googleCalendarApiKey : 'AIzaSyCFSw6boIaogHZd_LZ8R3SUyystzZm10rs',
      eventRender : function(event, ele){
      },
      eventClick : function(date, jsEvent, view){
        if(date.status == 'Completed')
          $state.go('app.orderproducts', {orderId : date.id});
        else
          $state.go('app.order', {orderId : date.id})
      }
    }
  };

  $scope.getOrders = function(noCache){
    $scope.$watch(OrderFactory.getOrders(new Date($scope.currentDate), noCache), function(newValue, oldValue){
      if (newValue){
        $scope.orders = newValue;
        $scope.fromLoad = true;
        $('#calendar').fullCalendar('refetchEvents');
      }
    });
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.events = [];
    $scope.currentDate = new Date();
    loadSources();
  });

});

angular.module('dorrbell').controller("OrderProductDetail", function($scope, $state, $ionicPopup,$ionicActionSheet,$ionicPopup,$cordovaBarcodeScanner,$ionicLoading, OrderFactory, ItemValidator, DeliveryItemFactory){
  $scope.v = ItemValidator;
	$scope.getOrder = function(noCache) {
			return OrderFactory.getProductsByOrderId($state.params.orderId, noCache);
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

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.$watch($scope.getOrder(true), function(newValue, oldValue){
      if (newValue){
        $scope.order = newValue[0];
      }
      $scope.$broadcast('scroll.refreshComplete');
    });
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
    if(item.PricebookEntry.Product2.Barcode__c && item.PricebookEntry.Product2.Barcode__c.trim().length > 0){
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
    }else{
        var confirmPopup = $ionicPopup.confirm({
          title: 'No Barcode',
          template: 'This item has no barcode available. Please ensure you have the correct item before continuing.'
        });

        confirmPopup.then(function(res) {
          if(res) {
            callback();
          }
        });
    }
  }

  $scope.returnItem = function(item){
    verifyItem(item, function(){
      $ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
      DeliveryItemFactory.startReturn(item, $ionicLoading.hide);
    });
  }
});

/**
 *  OrderDetail
 *  @description: Controller for order details
 */
angular.module('dorrbell').controller('OrderDetail', function(OrderFactory, $scope, $state, $ionicPopup, $ionicActionSheet, $timeout, $q, OrderValidator, $ionicHistory, MapFactory, Log, GoogleService, NgMap, NavigatorGeolocation) {


    $scope.renderMap = function(){
      if($scope.v.pickupView($scope.order) || $scope.v.returnView($scope.order)){
        if($scope.order.Order_Stores__r){
          angular.forEach($scope.order.Order_Stores__r.records, function(value, key) {
            value.pos = [value.Store__r.Coordinates__Latitude__s, value.Store__r.Coordinates__Longitude__s];
          });
        }
      }
    }

    $scope.openDelivery = function(delivery){
      if($scope.order.Status__c == 'Assigned')
        Log.message("You must accept the delivery before you can view the pick up details.", true, "Accept delivery");
      else
        $state.go("app.deliverydetail", {deliveryId : delivery.Id});
    }

    $scope.launchNavigator = function(street, city, state, zip){
      MapFactory.launchNavigator(street + ' ' + city + ', ' + state + ' ' + zip);
    };

    $scope.showDetail = function(event, delivery){
      if(event && event.stopPropagation)
        event.stopPropagation();

      $scope.delivery = delivery;
      $scope.map.showInfoWindow('foo', delivery.Id);
      $scope.map.setZoom(17);
    }


    $scope.goToMyLocation = function(){
      NavigatorGeolocation.getCurrentPosition()
       .then(function(position) {
         var lat = position.coords.latitude, lng = position.coords.longitude;
         $scope.map.setCenter(new google.maps.LatLng(lat - .006, lng));
       });
    }

    $scope.returnFilter = function(delivery){
      return delivery.Status__c == 'Return Started' || delivery.Status__c == 'Checked In';
    }

    $scope.openSubmenu = function($event){
      var sheet = $ionicActionSheet.show({
        buttons : [
          {
            text : '<i class="icon ion-android-refresh"></i> Refresh'
          },
          {
            text : '<i class="icon ion-ios-telephone"></i> Call Customer'
          }
        ],
        buttonClicked : function(index){
          sheet();
          if(index == 0){
            $scope.getOrder(true);
          }else if(index == 1){
            window.location.href="tel://"+$scope.order.ShipToContact.Phone;
          }
        },
        cssClass : "dorrbell_menu"
      })
    }

    $scope.getOrder = function(noCache) {
        return OrderFactory.getOrderById($state.params.orderId, noCache);
    }

    $scope.$on('$ionicView.beforeEnter', function(){
      $scope.isIOS = ionic.Platform.isIOS();
      $scope.orderId = $state.params.orderId;
      $scope.v = OrderValidator;
      $scope.menu = {
        state : "closed",
        tab : "details"
      }
      $scope.$broadcast('timer-start');
      $scope.googleMapsUrl="http://maps.googleapis.com/maps/api/js?key=AIzaSyDwQGc8Z6vioP4_7wNBB8ymrhHfj8aMKdo";

      NgMap.getMap().then(function(map){
        $scope.map = map;
      })

      $scope.$watch($scope.getOrder(true), function(newValue, oldValue){
        if (newValue){
          $scope.order = newValue[0];
          $scope.renderMap();
        }

        $scope.$broadcast('scroll.refreshComplete');
      })
    });


    //MapFactory.initMap("#order-map", true, true);
    $scope.getOrder();
});
