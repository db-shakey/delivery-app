angular.module('dorrbell').factory("AccountFactory", function(force){
	return {
		uploadProfilePhoto : function(contactId, base64data, callback){
			var data = {imageData : base64data};
			force.post("/api/uploadProfilePhoto/" + contactId, data, null, null, callback);
		}
	}
})
