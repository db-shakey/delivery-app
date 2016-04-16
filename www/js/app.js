// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var _app = angular.module('dorrbell', ['ionic', 'oc.lazyLoad', 'ngCordova', 'ngIOS9UIWebViewPatch',
                                        'ui.utils.masks', 'ngAnimate', 'ng-mfb', 'angular.filter',
                                        'timer', 'ksSwiper', 'ionic-datepicker',
                                        'ionicLazyLoad', 'ngMap', 'ui.calendar']);

ionic.Platform.ready(function(){


    angular.module('dorrbell').run(function($ionicPlatform, $ocLazyLoad, $rootScope, $state, HerokuService, $ionicHistory) {
      if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

          var requireLogin = toState.data.requireLogin;

          if($rootScope.stateChangeBypass){
            $rootScope.stateChangeBypass = false;
            return;
          }

          if (requireLogin && typeof $rootScope.currentUser == 'undefined') {
            event.preventDefault();

            HerokuService.refreshToken(function(){
              $rootScope.stateChangeBypass = true;
              $state.go(toState, toParams);
            }, function(){
              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true,
                historyRoot: true
              });
              $state.go("login");
            });

          }
        });

        /**
         *  Load the css
         */
        $ocLazyLoad.load([
          'css/animate.css'
          ,'lib/ng-material-floating-button/mfb/dist/mfb.min.css'
          ,'lib/fullcalendar/dist/fullcalendar.min.css'
          ,'lib/swiper/dist/css/swiper.min.css'
          ,'js/utils/template-utils.html'
        ]);

        /**
         * Load the directive templates
         */
        $ocLazyLoad.load([
          'js/utils/template-utils.html'
        ]);
    });

    _app.config(function($ocLazyLoadProvider){
      $ocLazyLoadProvider.config({
        debug : false,
        events : false
      });
    })



    angular.bootstrap(document, ['dorrbell']);
});
