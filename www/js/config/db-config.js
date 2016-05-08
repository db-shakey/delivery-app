angular.module('dorrbell').config(function($stateProvider) {

  $stateProvider
    .state('db', {
      url: '/db',
      abstract: true,
      templateUrl: 'js/modules/application/templates/db-menu.html',
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

    .state('db.storeList', {
      url : '/storeList',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/store/templates/store-list.html',
          controller : 'StoreListController'
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
            files :['js/modules/store/store-directive.js',
                    'js/modules/store/store-factory.js',
                    'js/modules/store/store-controller.js']
          });
        }
      }
    })

    .state('db.productlist', {
      url : '/productlist/:storeId',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/product/templates/db-product-list.html',
          controller : 'ProductList',
          cache: false
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [
              'js/modules/product/product-directive.js',
              'js/modules/product/product-factory.js',
              'js/modules/product/product-controller.js'
            ]
          });
        }
      }
    })

    .state('db.newProduct', {
      url : '/newProduct/:storeId/:productId',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/product/templates/product-new.html',
          controller : 'NewProductController'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [
              'js/modules/store/store-factory.js',
              'js/modules/product/product-directive.js',
              'js/modules/product/product-factory.js',
              'js/modules/product/product-controller.js',
              'js/modules/product/product-service.js'
            ]
          });
        }
      }
    })

    .state('db.productDetail', {
      url : '/productdetails/:productId/:deliveryId',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/product/templates/db-product-detail.html',
          controller : 'DbProductDetailController'
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

    .state('db.variantEdit', {
      url : '/variantEdit/:productId',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/product/templates/db-variant-edit.html',
          controller : 'VariantEditController'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [
              'js/modules/product/product-directive.js',
              'js/modules/product/product-factory.js',
              'js/modules/product/product-controller.js',
              'js/modules/product/product-service.js'
            ]
          })
        }
      }
    })

    .state('db.variantNew', {
      url : '/variantNew/:productId',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/product/templates/db-variant-new.html',
          controller : 'VariantNewController'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [
              'js/modules/product/product-directive.js',
              'js/modules/product/product-factory.js',
              'js/modules/product/product-controller.js',
              'js/modules/product/product-service.js'
            ]
          })
        }
      }
    })
    .state('db.account', {
      url : '/account',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/application/templates/account.html',
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
    .state('db.password', {
      url : '/password',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/application/templates/change-password.html',
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
    .state('db.storeDetail', {
      url : '/storeDetail/:storeId',
      views : {
        'menuContent' : {
          templateUrl : 'js/modules/store/templates/store-detail.html',
          controller : 'StoreDetailController'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files :['js/modules/store/store-directive.js',
                    'js/modules/store/store-factory.js',
                    'js/modules/store/store-controller.js']
          });
        }
      }
    });
});
