angular.module('dorrbell').directive("orderStatus", function(){
	return {
		restrict : 'EA',
		templateUrl : "order-status.htm",
		link : function($scope, element){
			$scope.$watch('order.Status__c', function(newValue, oldValue){
				if(newValue == 'Assigned' || newValue == 'Accepted'){
					$scope.endTime =  moment($scope.order.In_Home_Try_On_Start__c).subtract(45, 'minutes').toDate().getTime();
					$scope.label = 'Start Pick Up In: ';
				}else if(newValue == 'Pick Up In Progress' || newValue == 'En Route to Customer'){
					$scope.endTime = moment($scope.order.In_Home_Try_On_Start__c).toDate().getTime();
					$scope.label = 'Deliver In: ';
				}else if(newValue == 'Delivered To Customer'){
					$scope.endTime = moment($scope.order.Return_Collection_Time__c).toDate().getTime();
					$scope.label = 'Collect Returns In: ';
				}else if(newValue == 'Retrieved From Customer'){
					$scope.endTime = moment($scope.order.Marked_Retrieved__c).add(40, 'minutes').toDate().getTime();
					$scope.label = 'Return Items In: ';
				}else{
					$scope.label = newValue;
				}
			});


			$scope.today = moment().diff(moment($scope.order.In_Home_Try_On_Start__c), 'hours');
			$scope.$on("timer-stopped", function(event, data){
				$scope.getOrder(true);
				$scope.today = moment().diff(moment($scope.order.In_Home_Try_On_Start__c), 'hours');
			});
			$scope.$broadcast('timer-start');

		}
	}
});

angular.module('dorrbell').directive("deliveryStatus", function(){
	return {
		restrict : 'A',
		link : function($scope, element, attributes){
			if($scope.delivery){
				var status = $scope.delivery.Status__c;
				var statusClass = {
					"New" : "calm",
					"Accepted By Retailer" : "assertive",
					"Preparing Delivery" : "assertive",
					"Checked Out" : "positive",
					"En Route to Customer" : "positive",
					"With Customer" : "positive",
					"Return Started" : "assertive",
					"Checked In" : "positive",
					"Complete" : "positive",
					"Problem - Under Review" : "assertive",
					"Escalated" : "assertive"
				};
				$(element).addClass("text-" + statusClass[status]);
			}
		}
	}
});

angular.module('dorrbell').directive("itemStatus", function(){
	return {
		restrict : 'E',
		templateUrl : 'delivery-item-status.htm',
		replace : true,
		link : function($scope, element, attributes){
			$scope.statusMap = {
				"Requested" : {
					color : "positive",
					icon : "ion-ios-list-outline"
				},
				"Removed" : {
					color : "stable",
					icon : "ion-minus-circled"
				},
				"Escalated" : {
					color : "assertive",
					icon : "ion-alert-circled"
				},
				"Ready For Check Out" : {
					color : "positive",
					icon : "ion-checkmark-circled"
				},
				"Checked Out" : {
					color : "positive",
					icon : "ion-share"
				},
				"Purchased" : {
					color : "positive",
					icon : "ion-pricetag"
				},
				"Checked In" : {
					color : "positive",
					icon : "ion-checkmark-circled"
				},
				"Missing" : {
					color : "assertive",
					icon : "ion-alert-circled"
				},
				"Returning" : {
					color : "positive",
					icon : "ion-ios-undo"
				}
			}
		}
	}
});

angular.module('dorrbell').directive("deliveryItemImage", function(){
	return {
		restrict : 'A',
		link : function($scope, element, attributes){
			var src = $(attributes.anchor).attr("href");
			if(src && src.trim().length > 0)
				$(element).attr("src", src);
			else
				$(element).replaceWith('<div class="step size-96 text-center"><i class="icon ion-image"></i></div>');
		}
	}
});
