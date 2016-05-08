angular.module('dorrbell').directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value, 10);
      });
    }
  };
});

angular.module('dorrbell').directive("productTypes", function(HerokuService){
  return {
    template : '<option ng-repeat="option in pTypeOptions" value="{{option}}" ng-selected="{{$index == 0}}">{{option}}</option>',
    link : function($scope, element, attrs){
      HerokuService.get('/api/shopify/productTypes', function(res){
        $scope.pTypeOptions = res;
      });
    }
  }
});
