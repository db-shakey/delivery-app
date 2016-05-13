angular.module('dorrbell').config(function($stateProvider) {

  $stateProvider
    .state('unavailable', {
      url: '/unavailable',
      templateUrl: 'js/modules/application/templates/unavailable.html',
      data : {
        requireLogin : true
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load(['lib/ngCordova/dist/ng-cordova.js', 'js/modules/application/app-controller.js']);
        }
      },
      nativeTransitions: {
         "type": "fade",
         "duration": "400"
      }
    })
});
