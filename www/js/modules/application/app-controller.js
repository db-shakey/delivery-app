angular.module('dorrbell').controller("BaseController", function($scope, $rootScope, $state, $ionicHistory, $ionicLoading, HerokuService, MetadataFactory){
  $ionicLoading.show({
      template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
  });

  HerokuService.refreshToken(function(){
    //Cache Metadata
    MetadataFactory.describe("Order");
    MetadataFactory.describe("Store__c");
    MetadataFactory.describe("Order_Store__c");
    MetadataFactory.describe("OrderItem");
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    $ionicLoading.hide();
    if($rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact')
      $state.go("app.orders", {type : "Unassigned_Order"});
    else
      $state.go("ret.deliveryList", {type : "New"});
  }, function(err){
    $ionicLoading.hide();
    $ionicHistory.nextViewOptions({
      disableBack: true,
      historyRoot: true
    });
    $state.go("login");
  });

});

/**
 *  AppCtrl
 *  @description: Main App Controller for navigation menu
 */
angular.module('dorrbell').controller('AppCtrl', function($scope, HerokuService, $state, $ionicHistory, $localCache, $ionicSideMenuDelegate, $timeout, $rootScope) {


  $scope.signOut = function(event){
    HerokuService.revoke();
    $state.go("login");
    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
    $localCache.clearCache();
  }
  $timeout(function(){
    $ionicSideMenuDelegate.canDragContent(false);
  });

  $scope.callSupport = function(event){
    document.location.href = "tel:+15035681118";
  }
});

/**
 *  LoginController
 *  @description: Handles login screen when not authenticated with Salesforce
 */
angular.module('dorrbell').controller("LoginController", function($scope, $state, HerokuService, Log, $ionicPopup, $ionicViewSwitcher, $rootScope, $ionicLoading){
  $scope.user = {};

  $scope.login = function(){
    $ionicLoading.show({
        template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
    });

    HerokuService.login($scope.user, function(res){
      if($rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact')
        $state.go("app.orders", {type : "Unassigned_Order"});
      else
        $state.go("ret.deliveryList", {type : "Pre_Checked_Out_Delivery"});

        $ionicLoading.hide();
    }, function(err){
        $ionicLoading.hide();
        Log.message((err && err.data) ? err.data.message : 'There was a problem logging in', true, 'Login Failed');
    });
  }

  $scope.showBeta = function(){
    $scope.checkBeta = false;
    try{
      cordova.plugins.Keyboard.disableScroll(false);
    }catch(e){
      console.log(e);
    }


    var p = $ionicPopup.show({
      template : '<input type="text" ng-model="user.beta_key"/>',
      title : 'Enter Beta Key',
      subTitle : 'Please enter the beta key you received to continue.',
      scope : $scope,
      buttons : [
        {text : 'Cancel'},
        {
          text : '<b>Confirm</b>',
          type : 'button-positive',
          onTap : function(e){
            $scope.checkBeta = true;
          }
        }
      ]
    }).then(function(){
      try{
        cordova.plugins.Keyboard.disableScroll(true);
      }catch(e){console.log(e)};

      if($scope.checkBeta){
        HerokuService.get('/api/beta/' + $scope.user.beta_key, function(res){
          $ionicViewSwitcher.nextDirection('forward');
          $state.go("register", {contact : res});
        }, function(err){
          Log.message(err.data.message, true, 'Invalid Key');
        })
      }
    });
  }
});

angular.module('dorrbell').controller("RegisterController", function($scope, $state, RegistrationValidator, HerokuService, Log) {
    $scope.contact = $state.params.contact;
    $scope.contact.Password__c = null;
    $scope.submit = function() {
        if($scope.contact.Password__c != $scope.contact.password_confirm){
          Log.message("Your passwords do not match.", true, "Password Mismatch");
        }else if (RegistrationValidator.validateContact($scope.contactForm)) {
            delete $scope.contact.password_confirm;
            HerokuService.post('/api/register/' + $scope.contact.Id, $scope.contact,
                function(res) {
                    if (res.sucess = true) {
                        HerokuService.login({
                            username: $scope.contact.Email,
                            password: $scope.contact.Password__c
                        }, function(res) {
                            $state.go("app.orders");
                        }, function(err) {
                            $state.go("login");
                        });
                    }
                }, function(err) {
                    Log.message(err.data.message, true, 'An Error Occurred');
                }
            )
        }
    }
});
