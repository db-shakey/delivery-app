angular.module('dorrbell').directive("itemStatus", function(){
	return {
		restrict : 'E',
		templateUrl : 'modal/templates/delivery-item-status.html',
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
