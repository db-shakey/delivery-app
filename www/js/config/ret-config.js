angular.module('dorrbell').config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $locationProvider, $ionicConfigProvider) {
  $stateProvider
    .state('ret', {
      url: '/ret',
      abstract: true,
      templateUrl: 'js/modules/application/templates/ret-menu.html',
      controller: 'AppCtrl',
      data : {
        requireLogin : true
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load(['lib/ngCordova/dist/ng-cordova.js', 'js/modules/application/app-controller.js']);
        }
      }
    })
    .state('ret.deliveryList', {
      url : '/deliverylist/:type',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/delivery/templates/delivery-list.html',
          controller : 'DeliveryListController'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files :['lib/angular-filter/dist/angular-filter.min.js',
                    'js/modules/delivery/delivery-factory.js',
                    'js/modules/delivery/delivery-controller.js']
          });
        }
      }
    });
  });
