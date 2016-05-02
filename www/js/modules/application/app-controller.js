angular.module('dorrbell').controller("BaseController", function($scope, $rootScope, $state, $ionicHistory, $ionicLoading, HerokuService, MetadataFactory){


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
    else if($rootScope.currentUser.RecordType.DeveloperName == 'Retailer_Contact')
      $state.go("ret.deliveryList", {type : "New"});
    else if($rootScope.currentUser.RecordType.DeveloperName == 'Dorrbell_Employee_Contact')
      $state.go("db.storeList");
  }, function(err){
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
angular.module('dorrbell').controller("LoginController", function($scope, $state, HerokuService, Log, $ionicModal, $ionicViewSwitcher, $rootScope, $ionicLoading, $cordovaOauth){


  $scope.login = function(){
    $ionicLoading.show({
        template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
    });

    HerokuService.login($scope.user, function(res){
      if($rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact')
        $state.go("app.orders");
      else if($rootScope.currentUser.RecordType.DeveloperName == 'Retailer_Contact')
        $state.go("ret.deliveryList");
      else if($rootScope.currentUser.RecordType.DeveloperName == 'Dorrbell_Employee_Contact')
        $state.go("db.storeList");

      $ionicLoading.hide();
    }, function(err){
        $ionicLoading.hide();
        Log.message((err && err.data) ? err.data.message : 'There was a problem logging in', true, 'Login Failed');
    });
  }

  $scope.facebookAuthenticate = function(){
    $cordovaOauth.facebook("1687129318228339", ["email"]).then(function(result) {
        console.log(result);
    }, function(error) {
        // error
    });
  }

  $scope.twitterAuthentication = function(){
    $cordovaOauth.twitter("07nSJGnNhAQ9wbYrA10hTof9A", "alIG7T1qyHRtGlnvFO8mrhWPaTHCCfIRFSkovHn3oSnlY67u5v").then(function(result) {
        console.log(result);
    }, function(error) {
        // error
    });
  }


  /*
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
  */
  $scope.checkBeta = function(){
    HerokuService.get('/api/beta/' + $scope.user.beta_key, function(res){
      $ionicViewSwitcher.nextDirection('forward');
      $state.go("register", {contact : res});
    }, function(err){
      $scope.modal.remove();
      Log.message(err.data.message, true, 'Invalid Key');
    })
  }

  $scope.getStarted = function(){
    $ionicModal.fromTemplateUrl('register-modal.htm', {
      scope : $scope,
      animation : 'slide-in-up'
    }).then(function(modal){
      $scope.modal = modal;
      modal.show();
    });
  }

  $scope.closeModal = function(){
    if($scope.modal)
      $scope.modal.hide();
  }


  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.user = {};
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  });
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

angular.module('dorrbell').controller("AccountController", function($scope, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $ionicPopup, $rootScope, $timeout, $state, ImageService, AccountFactory, Log, RegistrationValidator, force) {
    $scope.contact = {
        FirstName : $scope.currentUser.FirstName,
        Email : $scope.currentUser.Email,
        LastName : $scope.currentUser.LastName,
        MobilePhone : $scope.currentUser.MobilePhone,
        Id : $scope.currentUser.Id
    };
    $scope.getPicture = function(e) {
        $scope.popup.close();
        try{
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourcType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                targetWidth: 300,
                targetHeight: 300,
                encodingType: Camera.EncodingType.JPEG
            };
            $cordovaCamera.getPicture(options).then(function(imageURI) {
                ImageService.convertUrlToBase64(imageURI, function(data) {
                    AccountFactory.uploadProfilePhoto($scope.currentUser.Id, data, function(updatedUser) {
                        $rootScope.currentUser = updatedUser;
                    });
                }, "image/jpeg");
            });
        }catch(err){
            $timeout(function(){
                Log.message("Cannot access camera", true, "Error");
            });
        }
    }
    $scope.getPictureFromGallery = function(e) {
        $scope.popup.close();
        var options = {
            maximumImagesCount: 1,
            width: 300,
            height: 300,
            quality: 50
        };

        try {
             $cordovaImagePicker.getPictures(options)
                .then(function(results) {
                    if (results[0]) {
                        ImageService.convertUrlToBase64(results[0], function(data) {
                            console.log(data);
                            AccountFactory.uploadProfilePhoto($scope.currentUser.Id, data, function(updatedUser) {
                                $rootScope.currentUser = updatedUser;
                            });
                        }, "image/jpeg");
                    }
                }, function(error) {
                    Log.message("Error loading photo", true, "Error");
                });
        } catch(err){
            $timeout(function(){
                Log.message("Cannot access gallery", true, "Error");
            });
        }
    }

    $scope.openSubmenu = function($event) {
        var sheet = $ionicActionSheet.show({
            buttons: [{
                text: '<i class="icon ion-image"></i> Change Profile Photo'
            }, {
                text: '<i class="icon ion-unlocked"></i> Change Password'
            }],
            buttonClicked: function(index) {
                sheet();
                if (index == 0) {
                    $scope.popup = $ionicPopup.show({
                        template: " <button class='button button-full button-positive' ng-click='getPicture()'>Camera</button>\
                                    <button class='button button-full button-positive' ng-click='getPictureFromGallery()'>Gallery</button>\
                                    <button class='button button-full button-stable' ng-click='popup.close()'>Cancel</button>",
                        title: "Choose Image Source",
                        subTitle: "Select a location to upload your profile photo from.",
                        scope: $scope
                    })
                }else if(index == 1){
                    if($rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact'){
                        $state.go("app.password");
                    }else if($rootScope.currentUser.RecordType.DeveloperName == 'Dorrbell_Employee_Contact'){
                        $state.go('db.password');
                    }else{
                      $state.go("ret.password");
                    }
                }
            },
            cssClass: "dorrbell_menu"
        })
    }

     $scope.submit = function() {
        if (RegistrationValidator.validateContact($scope.contactForm)) {
            $.extend(true, $rootScope.currentUser, $scope.contact);
            force.update("Contact", $scope.contact, function(){
                Log.message("Your account information has been updated", true, "Account Update");
            })
        }
    }
});

angular.module('dorrbell').controller("ChangePasswordController", function($scope, RegistrationValidator, Log, force, HerokuService, $ionicLoading){
    $scope.password = {};

    $scope.submit = function(){
        console.log($scope);
        if(RegistrationValidator.validateContact($scope.passwordForm)){
            if($scope.password.newPassword != $scope.password.confirm){
                Log.message("Your passwords do not match", true, "Invalid Password");
            }else{
              $ionicLoading.show({
                  template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
              });
                force.post(
                    "/api/changePassword",
                    {
                        password : $scope.password,
                        contact : $scope.currentUser
                    },
                    false,
                    null,
                    function(res){
                        HerokuService.login({
                            username : $scope.currentUser.Email,
                            password : $scope.password.newPassword
                        }, function(result){
                            $ionicLoading.hide();
                            Log.message("Your password has been updated", true, "Success");
                        }, function(error){
                            $ionicLoading.hide();
                            Log.message(error, true, "Error");
                        });
                    },
                    function(error){
                        $ionicLoading.hide();
                        Log.message(error.data, true, "Error");
                    }
                )
            }
        }
    }

})
