angular.module('dorrbell').config(function($stateProvider) {

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
      url : '/deliverylist',
      views : {
        'menuContent' : {
          templateUrl : 'delivery/templates/delivery-list.html',
          controller : 'DeliveryListController'
        }
      },
      nativeTransitions: {
         "type": "fade",
         "duration": "400"
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
    })
    .state('ret.deliverydetail', {
      url: '/deliverydetail/:deliveryId',
      views: {
        'menuContent': {
          templateUrl: 'js/modules/delivery/templates/ret-delivery-detail.html',
          controller : 'DeliveryDetail'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files :['js/modules/delivery/delivery-directive.js',
                    'js/modules/delivery/delivery-factory.js',
                    'js/modules/delivery/delivery-controller.js']
          });
        }
      }
    })
    .state('ret.account', {
      url : '/account',
      views : {
        'menuContent' : {
          templateUrl : 'application/templates/account.html',
          controller : 'AccountController'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [
              'js/modules/application/app-factory.js',
              'js/modules/application/app-controller.js'
            ]
          });
        }
      }
    })
    .state('ret.password', {
      url : '/password',
      views : {
        'menuContent' : {
          templateUrl : 'application/templates/change-password.html',
          controller : 'ChangePasswordController'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [
              'js/modules/application/app-factory.js',
              'js/modules/application/app-controller.js'
            ]
          });
        }
      }
    })
    .state('ret.itemsearch', {
      url : '/itemsearch/:deliveryId',
      views : {
        'menuContent' : {
          templateUrl : 'product/templates/product-search.html',
          controller : 'ProductSearch',
          cache: false
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [
              'js/modules/delivery/delivery-factory.js',
              'js/modules/product/product-factory.js',
              'js/modules/product/product-controller.js'
            ]
          });
        }
      }
    })

   .state('ret.productdetails', {
      url : '/productdetails/:productId/:deliveryId',
      views : {
        'menuContent' : {
          templateUrl : 'product/templates/product-detail.html',
          controller : 'ProductDetail'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [
              'js/modules/delivery/delivery-factory.js',
              'js/modules/product/product-factory.js',
              'js/modules/product/product-controller.js'
            ]
          })
        }
      }
    })
  });
