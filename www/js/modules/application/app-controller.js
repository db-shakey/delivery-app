angular.module('dorrbell').controller("BaseController", function($scope, $rootScope, $state, $ionicHistory, $ionicLoading, HerokuService, MetadataFactory){
  if(navigator.splashscreen) {
    navigator.splashscreen.hide();
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    HerokuService.refreshToken(function(){
      $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
      });

      $ionicLoading.hide();
      if($rootScope.currentUser.RecordType.DeveloperName == 'Shopping_Assistant_Contact')
        $state.go("app.orders", {type : "Unassigned_Order"});
      else if($rootScope.currentUser.RecordType.DeveloperName == 'Retailer_Contact')
        $state.go("ret.deliveryList", {type : "New"});
      else if($rootScope.currentUser.RecordType.DeveloperName == 'Dorrbell_Employee_Contact')
        $state.go("db.storeList");
      else{
        $state.go("unavailable");
      }


    }, function(err){
      $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
      });
      $state.go("login");
    });
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
    window.open("tel:+15035681118");
  }
});

/**
 *  LoginController
 *  @description: Handles login screen when not authenticated with Salesforce
 */
angular.module('dorrbell').controller("LoginController", function($scope, $state, $q, HerokuService, force, ImageService, Log, $ionicModal, $localStorage, $ionicViewSwitcher, $rootScope, $ionicLoading, $ionicPopup, $cordovaOauth, $cordovaFacebook){


  $scope.login = function(){
    $ionicLoading.show({
        template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
    });

    HerokuService.login($scope.user, function(res){
      $ionicLoading.hide();
      $state.go("home");
    }, function(err){
        $ionicLoading.hide();
        Log.message((err && err.data) ? err.data.message : 'There was a problem logging in', true, 'Login Failed');
    });
  }

  $scope.facebookAuthenticate = function(){
    var authResponse;
    $cordovaFacebook.login(["email", "public_profile", "user_location"]).then(function(result){
      $scope.closeModal();
      $ionicLoading.show({
          template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'
      });
      authResponse = result.authResponse;
      return $cordovaFacebook.api(result.authResponse.userID + "?fields=location{location},first_name,last_name,locale,middle_name,payment_pricepoints,relationship_status,gender,picture,email");
    }).then(function(userInfo){
      ImageService.convertUrlToBase64(userInfo.picture.data.url, function(data) {
        userInfo.attachment = data;
        userInfo.accessToken = authResponse.accessToken;
        force.post('/api/fb-register', userInfo, null, null, function(res){
          HerokuService.login({
              username: userInfo.email,
              password: userInfo.accessToken
          }, function(res) {
              $ionicLoading.hide();
              $state.go("home");
          }, function(err) {
              $ionicLoading.hide();
              $state.go("login");
          });
        }, function(err){
          $ionicLoading.hide();
          Log.message("There was an error authenticating", true, "Registration Failed");
        });
      }, "image/jpeg");
    }, function(err){
      $ionicLoading.hide();
      console.log(err);
    });
  }

  $scope.twitterAuthentication = function(){
    $cordovaOauth.twitter("07nSJGnNhAQ9wbYrA10hTof9A", "alIG7T1qyHRtGlnvFO8mrhWPaTHCCfIRFSkovHn3oSnlY67u5v").then(function(result) {
        console.log(result);
    }, function(error) {
        // error
    });
  }

  $scope.checkBeta = function(){
    $scope.modal.remove();

    $ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
    HerokuService.get('/api/beta/' + $scope.user.beta_key, function(res){
      $ionicLoading.hide();
      $state.go("register", {contact : res, endpoint : $scope.user.endpoint});
    }, function(err){
      $ionicLoading.hide();
      Log.message((err && err.data) ? err.data.message : 'You have entered an invalid key.', true, 'Invalid Key');
    }, $scope.user.endpoint);
  }

  $scope.getStarted = function(){
    $ionicModal.fromTemplateUrl('modal/templates/register-modal.html', {
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

  $scope.selectDomain = function(){
    $scope.defaultEndpoint = $scope.user.endpoint;
    $ionicPopup.show({
      template : '<ion-list>\
                    <ion-radio ng-model="user.endpoint" ng-value="\'https://dorrbell.herokuapp.com\'">Live</ion-radio>\
                    <ion-radio ng-model="user.endpoint" ng-value="\'https://dorrbell-test.herokuapp.com\'">Test</ion-radio>\
                  </ion-list>',
      title : 'Enter The Domain',
      scope : $scope,
      buttons : [
        {
          text : 'Cancel',
          type : 'button-small',
          onTap : function(e){
            $scope.user.endpoint = $scope.defaultEndpoint;
          }
        },
        {
          text : '<b>Save</b>',
          type : 'button-positive button-small'
        }
      ]
    })
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    $localStorage.get('endpoint', 'https://dorrbell.herokuapp.com').then(function(v){
      $scope.user = {
        endpoint : v
      };

    })

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  });
});

angular.module('dorrbell').controller("RegisterController", function($scope, $state, $ionicLoading, RegistrationValidator, HerokuService, Log) {
    $scope.contact = $state.params.contact;
    $scope.contact.Password__c = null;

    $scope.submit = function() {
        $scope.contact.Username__c = $scope.contact.Email;
        if($scope.contact.Password__c != $scope.contact.password_confirm){
          Log.message("Your passwords do not match.", true, "Password Mismatch");
        }else if (RegistrationValidator.validateContact($scope.contactForm)) {
            $ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
            delete $scope.contact.password_confirm;
            HerokuService.post('/api/register/' + $scope.contact.Id, $scope.contact,
                function(res) {
                    $ionicLoading.hide();
                    if (res.success == true) {
                        HerokuService.login({
                            username: $scope.contact.Email,
                            password: $scope.contact.Password__c,
                            endpoint : $state.params.endpoint
                        }, function(res) {
                            $state.go("home");
                        }, function(err) {
                            $state.go("login");
                        });
                    }
                }, function(err) {
                    $ionicLoading.hide();
                    Log.message(err.data.message, true, 'An Error Occurred');
                }, false, $state.params.endpoint
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
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
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
              $ionicLoading.show({template: '<ion-spinner icon="crescent" class="spinner-light"></ion-spinner>'});
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
