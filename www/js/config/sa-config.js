angular.module('dorrbell').config(function($stateProvider) {
    $stateProvider
    .state("home",{
      url : '/',
      template : "<ion-view></ion-view>",
      controller : "BaseController",
      data : {
        requireLogin : false
      },
      nativeTransitions: {
         "type": "fade",
         "duration": "400"
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load(['js/modules/application/app-controller.js']);
        }
      }
    })

    .state("login", {
      url : '/login',
      templateUrl : 'application/templates/login.html',
      controller : 'LoginController',
      data : {
        requireLogin : false
      },
      nativeTransitions: {
         "type": "fade",
         "duration": "400"
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load(['js/modules/application/app-controller.js', 'extras/sha1.js']);
        }
      }
    })

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'application/templates/sa-menu.html',
      controller: 'AppCtrl',
      data : {
        requireLogin : true
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load(['js/modules/application/app-controller.js']);
        }
      }
    })

    .state('app.orders', {
      url: '/orders',
      views: {
        'menuContent': {
          templateUrl: 'order/templates/order-list.html',
          controller : 'OrdersController'
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
            files :['js/modules/order/order-factory.js'
            ,'js/modules/order/order-controller.js']
          });
        }
      }
    })

    .state('app.order', {
      url : '/order/:orderId',
      views : {
        'menuContent' : {
          templateUrl : 'order/templates/order-detail.html',
          controller : 'OrderDetail',
          cache: false
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [ 'js/modules/order/order-directive.js',
            'js/modules/order/order-factory.js',
            'js/modules/order/order-controller.js']
          });
        }
      }
    })

    .state('app.orderproducts', {
      url : '/orderproducts/:orderId',
      views : {
        'menuContent' : {
          templateUrl : 'order/templates/order-products.html',
          controller : 'OrderProductDetail'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [ 'js/modules/order/order-directive.js'
            ,'js/modules/order/order-factory.js'
            ,'js/modules/delivery/delivery-factory.js'
            ,'js/modules/order/order-controller.js']
          });
        }
      }
    })

    .state('app.deliverydetail', {
      url : '/deliverydetail/:deliveryId',
      views : {
        'menuContent' : {
          templateUrl : 'delivery/templates/sa-delivery-detail.html',
          controller : 'DeliveryDetail'
        }
      },
      resolve : {
        loadController : function($ocLazyLoad){
          return $ocLazyLoad.load({
            serie : true,
            files : [ 'js/modules/delivery/delivery-directive.js',
            'js/modules/delivery/delivery-factory.js',
            'js/modules/delivery/delivery-controller.js'
          ]
        });
      }
    }
  })

  .state('app.returns', {
    url : '/returns/:orderId',
    views : {
      'menuContent' : {
        templateUrl : 'return/templates/returns.html',
        controller : 'ReturnController'
      }
    },
    resolve : {
      loadController : function($ocLazyLoad){
        return $ocLazyLoad.load({
          serie : true,
          files : [ 'js/modules/delivery/delivery-factory.js',
          'js/modules/order/order-factory.js',
          'js/modules/return/return-controller.js'
        ]
      });
    }
  }
})

.state('app.productdetails', {
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

.state('app.itemsearch', {
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

.state('app.account', {
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
.state('app.password', {
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

.state("register", {
  url : '/register',
  templateUrl : 'application/templates/register.html',
  controller : 'RegisterController',
  params : {contact : null, endpoint : 'https://dorrbell.herokuapp.com'},
  data : {
    requireLogin : false
  },
  resolve : {
    loadController : function($ocLazyLoad){
      return $ocLazyLoad.load(['js/modules/application/app-controller.js']);
    }
  }
});

});
