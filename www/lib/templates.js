angular.module("templates").run(["$templateCache", function($templateCache) {$templateCache.put("templates/account.html","\r\n<ion-view>\r\n	<ion-nav-title>\r\n  		My Account\r\n  	</ion-nav-title>\r\n  	<ion-nav-buttons side=\"right\">\r\n        <button class=\"button button-icon button-clear ion-android-more-vertical m-r-sm\" ng-click=\"openSubmenu()\"></button>\r\n    </ion-nav-buttons>\r\n	<form name=\"contactForm\" novalidate ng-submit=\"submit()\">\r\n		<ion-content has-bouncing=\"false\">\r\n\r\n		<div class=\"middle-box text-center p-lg\">\r\n			<div>\r\n				<!--\r\n				<div>\r\n					<img src=\"img/logo_beta_salesforce_email_letterhead.png\"/>\r\n				</div>\r\n				-->\r\n				<div class=\"m-b-lg skin-1\">\r\n              		<img alt=\"image\" class=\"img-circle profile-thumbnail\" src=\"{{(currentUser.thumbnail) ? currentUser.thumbnail : \'img/default_profile.jpg\'}}\"/>\r\n            		<span class=\"clear\">\r\n			              <span>\r\n			                ({{currentUser.RecordType.Name}})\r\n			              </span>\r\n		            </span>\r\n            	</div>\r\n\r\n\r\n				<div class=\"list\">\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Email Address</span>\r\n						<input\r\n							type=\"email\"\r\n							name=\"Email Address\"\r\n							placeholder=\"Email Address\"\r\n							ng-model=\"contact.Email\"\r\n							ng-required=\"true\"\r\n							ng-minlength=\"2\"\r\n							ng-trim=\"true\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">First Name</span>\r\n						<input type=\"text\"\r\n								name=\"First Name\"\r\n								placeholder=\"First Name\"\r\n								ng-model=\"contact.FirstName\"\r\n								ng-required=\"true\"\r\n								ng-minlength=\"2\"\r\n								ng-trim=\"true\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Last Name</span>\r\n						<input type=\"text\" name=\"Last Name\" placeholder=\"Last Name\" ng-model=\"contact.LastName\" ng-required=\"true\" ng-trim=\"true\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Phone #</span>\r\n						<input type=\"text\" placeholder=\"Phone #\" name=\"Phone Number\" ng-model=\"contact.MobilePhone\" ui-us-phone-number required/>\r\n					</label>\r\n					<!--\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Password</span>\r\n						<input type=\"password\"\r\n								placeholder=\"Password\"\r\n								name=\"Password\"\r\n								ng-model=\"contact.Password__c\"\r\n								ng-required=\"true\"\r\n								ng-minlength=\"6\"\r\n								ng-maxlength=\"20\"\r\n								ng-trim=\"true\"\r\n								ng-pattern=\"/^(?=.*\\d)(?=.*[a-zA-Z]).{6,20}$/\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Confirm Your Password</span>\r\n						<input type=\"password\" name=\"Password Confirmation\" placeholder=\"Confirm Your Password\" ng-model=\"contact.password_confirm\" ng-required=\"true\" ng-trim=\"true\"/>\r\n					</label>\r\n					-->\r\n				</div>\r\n\r\n				<div class=\"m-t-xl\">\r\n					<button type=\"submit\" class=\"button button-positive button-block icon-left\" style=\"padding-top:3px;\">\r\n						<i class=\"icon ion-ios-cloud-upload-outline\"></i>\r\n						Save\r\n					</button>\r\n				</div>\r\n\r\n\r\n			</div>\r\n		</div>\r\n\r\n		</ion-content>\r\n	</form>\r\n</ion-view>\r\n");
$templateCache.put("templates/change-password.html","\r\n<ion-view class=\"change-password\">\r\n	<ion-nav-title>\r\n  		Change Password\r\n  	</ion-nav-title>\r\n	<form name=\"passwordForm\" novalidate ng-submit=\"submit()\">\r\n		<ion-content has-bouncing=\"false\">\r\n\r\n		<div class=\"middle-box text-center p-lg\">\r\n			<div>\r\n				<div class=\"list\">\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Current Password</span>\r\n						<input type=\"password\"\r\n								placeholder=\"Current Password\"\r\n								name=\"Password\"\r\n								ng-model=\"password.old\"\r\n								ng-required=\"true\"\r\n								ng-minlength=\"6\"\r\n								ng-maxlength=\"20\"\r\n								ng-trim=\"true\"\r\n								ng-pattern=\"/^(?=.*\\d)(?=.*[a-zA-Z]).{6,20}$/\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">New Password</span>\r\n						<input type=\"password\"\r\n								placeholder=\"New Password\"\r\n								name=\"Password\"\r\n								ng-model=\"password.newPassword\"\r\n								ng-required=\"true\"\r\n								ng-minlength=\"6\"\r\n								ng-maxlength=\"20\"\r\n								ng-trim=\"true\"\r\n								ng-pattern=\"/^(?=.*\\d)(?=.*[a-zA-Z]).{6,20}$/\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Confirm Your Password</span>\r\n						<input type=\"password\" name=\"Password Confirmation\" placeholder=\"Confirm Your Password\" ng-model=\"password.confirm\" ng-required=\"true\" ng-trim=\"true\"/>\r\n					</label>\r\n				</div>\r\n\r\n				<button type=\"submit\" class=\"button button-positive button-block icon-left\" style=\"padding-top:3px;margin-top:5em;\">\r\n					<i class=\"icon ion-ios-cloud-upload-outline\"></i>\r\n					Submit\r\n				</button>\r\n\r\n			</div>\r\n		</div>\r\n\r\n		</ion-content>\r\n	</form>\r\n</ion-view>\r\n");
$templateCache.put("templates/db-menu.html","<ion-side-menus enable-menu-with-back-views=\"false\">\r\n  <ion-side-menu-content>\r\n    <ion-nav-bar class=\"bar-positive\" align-title=\"center\">\r\n      <ion-nav-back-button>\r\n      </ion-nav-back-button>\r\n\r\n      <ion-nav-buttons side=\"left\">\r\n        <button class=\"button button-icon button-clear ion-navicon\" menu-toggle=\"left\">\r\n        </button>\r\n      </ion-nav-buttons>\r\n    </ion-nav-bar>\r\n    <ion-nav-view name=\"menuContent\"></ion-nav-view>\r\n  </ion-side-menu-content>\r\n\r\n  <ion-side-menu side=\"left\" drag-content=\"false\">\r\n    <ion-header-bar class=\"bar-positive\" align-title=\"center\">\r\n      <h1 class=\"title\">\r\n        <img src=\"img/receipt-header-logo-hi-res.png\"/>\r\n      </h1>\r\n    </ion-header-bar>\r\n    <ion-content class=\"bg-stable\">\r\n      <ion-list class=\"skin-1\">\r\n\r\n        <ion-item class=\"bg-positive\">\r\n          <div class=\"profile-element\">\r\n            <span>\r\n              <img alt=\"image\" class=\"img-circle profile-thumbnail\" src=\"{{(currentUser.thumbnail) ? currentUser.thumbnail : \'img/default_profile.jpg\'}}\"/>\r\n            </span>\r\n            <span class=\"clear\">\r\n              <span class=\"block m-t-xs\">\r\n                {{currentUser.Name}}\r\n              </span>\r\n              <span>\r\n                ({{currentUser.RecordType.Name}})\r\n              </span>\r\n            </span>\r\n\r\n          </div>\r\n        </ion-item>\r\n\r\n        <ion-item menu-close ui-sref=\"db.storeList\" class=\"item-icon-left\">\r\n          <i class=\"icon ion-ios-list\"></i>\r\n          Manage Stores\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ui-sref=\"db.account\">\r\n          <i class=\"icon ion-person\"></i>\r\n          My Account\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ng-click=\"callSupport()\">\r\n          <i class=\"icon ion-iphone\"></i>\r\n          Call Dorrbell Support\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ng-click=\"signOut()\">\r\n          <i class=\"icon ion-log-out\"></i>\r\n          Sign Out\r\n        </ion-item>\r\n      </ion-list>\r\n    </ion-content>\r\n  </ion-side-menu>\r\n</ion-side-menus>\r\n");
$templateCache.put("templates/login.html","\r\n<ion-view class=\"login\" animation=\"no-animation\">\r\n	<ion-content has-bouncing=\"false\">\r\n\r\n	<div class=\"middle-box text-center loginscreen\">\r\n		<div>\r\n			<div>\r\n          <h1 class=\"logo-name\">\r\n            <img src=\"img/receipt-header-logo-hi-res.png\"/>\r\n          </h1>\r\n      </div>\r\n			<h3 class=\"m-t-lg\">The On-Demand Fitting Room</h3>\r\n      <p>Try on clothing and accessories at home before you buy. Delivered to your house in as little as an hour.\r\n      </p>\r\n      <p>Login To see it in action.</p>\r\n\r\n			<div class=\"m-t m-b-m\">\r\n				<div class=\"list\">\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Username</span>\r\n						<input type=\"email\" placeholder=\"Username\" ng-model=\"user.username\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Password</span>\r\n						<input type=\"password\" placeholder=\"Password\" ng-model=\"user.password\"/>\r\n					</label>\r\n				</div>\r\n				<button class=\"button button-positive button-block m-t-xl icon-left\" style=\"padding-top:3px;\" ng-click=\"login()\">\r\n					<i class=\"icon ion-ios-cloud-outline\"></i>\r\n					Login\r\n				</button>\r\n\r\n	    </div>\r\n			<p class=\"text-muted text-center m-t-md m-b-md\"><small>Or</small></p>\r\n\r\n			<button class=\"button button-outline button-light button-block button-small icon-right\" ng-click=\"getStarted()\">\r\n				Get Started\r\n				<i class=\"icon ion-arrow-right-c\"></i>\r\n			</button>\r\n\r\n		</div>\r\n\r\n	</div>\r\n\r\n	</ion-content>\r\n</ion-view>\r\n");
$templateCache.put("templates/register.html","\r\n<ion-view>\r\n	<form name=\"contactForm\" novalidate ng-submit=\"submit()\">\r\n		<ion-content has-bouncing=\"false\" class=\"login\">\r\n\r\n		<div class=\"middle-box text-center loginscreen\">\r\n			<div>\r\n\r\n				<div class=\"list\">\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Email Address</span>\r\n						<input\r\n							type=\"email\"\r\n							name=\"Email Address\"\r\n							placeholder=\"Email Address\"\r\n							ng-model=\"contact.Email\"\r\n							ng-required=\"true\"\r\n							ng-trim=\"true\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">First Name</span>\r\n						<input type=\"text\"\r\n								name=\"First Name\"\r\n								placeholder=\"First Name\"\r\n								ng-model=\"contact.FirstName\"\r\n								ng-required=\"true\"\r\n								ng-trim=\"true\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Last Name</span>\r\n						<input type=\"text\" name=\"Last Name\" placeholder=\"Last Name\" ng-model=\"contact.LastName\" ng-required=\"true\" ng-trim=\"true\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Phone #</span>\r\n						<input type=\"tel\" placeholder=\"Phone #\" name=\"Phone Number\" ng-model=\"contact.MobilePhone\" ui-us-phone-number required/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Password</span>\r\n						<input type=\"password\"\r\n								placeholder=\"Password\"\r\n								name=\"Password\"\r\n								ng-model=\"contact.Password__c\"\r\n								ng-required=\"true\"\r\n								ng-minlength=\"6\"\r\n								ng-maxlength=\"20\"\r\n								ng-trim=\"true\"\r\n								ng-pattern=\"/^(?=.*\\d)(?=.*[a-zA-Z]).{6,20}$/\"/>\r\n					</label>\r\n					<label class=\"item item-input item-floating-label\">\r\n						<span class=\"input-label\">Confirm Your Password</span>\r\n						<input type=\"password\" name=\"Password Confirmation\" placeholder=\"Confirm Your Password\" ng-model=\"contact.password_confirm\" ng-required=\"true\" ng-trim=\"true\"/>\r\n					</label>\r\n				</div>\r\n\r\n				<button type=\"submit\" class=\"button button-positive button-block m-t-xl icon-left\" style=\"padding-top:3px;\">\r\n					<i class=\"icon ion-ios-cloud-upload-outline\"></i>\r\n					Submit\r\n				</button>\r\n				<button class=\"button button-positive button-block button-clear button-small icon-left\" style=\"padding-top:3px; margin-top:20px;\" ui-sref=\"login\">\r\n					<i class=\"icon ion-chevron-left\"></i>\r\n					Back to Login\r\n				</button>\r\n				<p class=\"m-t\">\r\n					<small>Dorrbell © 2015</small>\r\n				</p>\r\n\r\n			</div>\r\n		</div>\r\n\r\n		</ion-content>\r\n	</form>\r\n</ion-view>\r\n");
$templateCache.put("templates/ret-menu.html","<ion-side-menus enable-menu-with-back-views=\"false\">\r\n  <ion-side-menu-content>\r\n    <ion-nav-bar class=\"bar-positive\" align-title=\"center\">\r\n      <ion-nav-back-button>\r\n      </ion-nav-back-button>\r\n\r\n      <ion-nav-buttons side=\"left\">\r\n        <button class=\"button button-icon button-clear ion-navicon\" menu-toggle=\"left\">\r\n        </button>\r\n      </ion-nav-buttons>\r\n    </ion-nav-bar>\r\n    <ion-nav-view name=\"menuContent\"></ion-nav-view>\r\n  </ion-side-menu-content>\r\n\r\n  <ion-side-menu side=\"left\" drag-content=\"false\">\r\n    <ion-header-bar class=\"bar-positive\" align-title=\"center\">\r\n      <h1 class=\"title\">\r\n        Menu\r\n      </h1>\r\n    </ion-header-bar>\r\n    <ion-content>\r\n      <ion-list class=\"skin-1\">\r\n\r\n        <ion-item class=\"bg-positive\">\r\n          <div class=\"profile-element\">\r\n            <span>\r\n              <img alt=\"image\" class=\"img-circle profile-thumbnail\" src=\"{{(currentUser.thumbnail) ? currentUser.thumbnail : \'img/default_profile.jpg\'}}\"/>\r\n            </span>\r\n            <span class=\"clear\">\r\n              <span class=\"block m-t-xs\">\r\n                {{currentUser.Name}}\r\n              </span>\r\n              <span>\r\n                ({{currentUser.RecordType.Name}})\r\n              </span>\r\n            </span>\r\n\r\n          </div>\r\n        </ion-item>\r\n\r\n        <ion-item menu-close ui-sref=\"ret.deliveryList\" class=\"item-icon-left\">\r\n          <i class=\"icon ion-ios-list\"></i>\r\n          My Deliveries\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ui-sref=\"ret.itemsearch\">\r\n          <i class=\"icon ion-search\"></i>\r\n          Item Lookup\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ui-sref=\"ret.account\">\r\n          <i class=\"icon ion-person\"></i>\r\n          My Account\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ng-click=\"callSupport()\">\r\n          <i class=\"icon ion-iphone\"></i>\r\n          Call Dorrbell Support\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ng-click=\"signOut()\">\r\n          <i class=\"icon ion-log-out\"></i>\r\n          Sign Out\r\n        </ion-item>\r\n      </ion-list>\r\n    </ion-content>\r\n  </ion-side-menu>\r\n</ion-side-menus>\r\n");
$templateCache.put("templates/sa-menu.html","<ion-side-menus enable-menu-with-back-views=\"false\">\r\n  <ion-side-menu-content>\r\n    <ion-nav-bar class=\"bar-positive\" align-title=\"center\">\r\n      <ion-nav-back-button>\r\n      </ion-nav-back-button>\r\n\r\n      <ion-nav-buttons side=\"left\">\r\n        <button class=\"button button-icon button-clear ion-navicon\" menu-toggle=\"left\">\r\n        </button>\r\n      </ion-nav-buttons>\r\n    </ion-nav-bar>\r\n    <ion-nav-view name=\"menuContent\"></ion-nav-view>\r\n  </ion-side-menu-content>\r\n\r\n  <ion-side-menu side=\"left\">\r\n    <ion-header-bar class=\"bar-positive\" align-title=\"center\">\r\n      <h1 class=\"title\">\r\n        <img src=\"img/receipt-header-logo-hi-res.png\"/>\r\n      </h1>\r\n    </ion-header-bar>\r\n    <ion-content class=\"bg-stable\">\r\n      <ion-list class=\"skin-1\">\r\n\r\n        <ion-item class=\"bg-positive\">\r\n          <div class=\"profile-element\">\r\n            <span>\r\n              <img alt=\"image\" class=\"img-circle profile-thumbnail\" src=\"{{(currentUser.thumbnail) ? currentUser.thumbnail : \'img/default_profile.jpg\'}}\"/>\r\n            </span>\r\n            <span class=\"clear\">\r\n              <span class=\"block m-t-xs\">\r\n                {{currentUser.Name}}\r\n              </span>\r\n            </span>\r\n\r\n          </div>\r\n        </ion-item>\r\n\r\n        <ion-item menu-close ui-sref=\"app.orders\" class=\"item-icon-left\" ui-sref-active=\"active\">\r\n          <i class=\"icon ion-ios-list\"></i>\r\n          My Schedule\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ui-sref=\"app.itemsearch\" ui-sref-active=\"active\">\r\n          <i class=\"icon ion-search\"></i>\r\n          Item Lookup\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ui-sref=\"app.account\" ui-sref-active=\"active\">\r\n          <i class=\"icon ion-person\"></i>\r\n          My Account\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ng-click=\"callSupport()\" ui-sref-active=\"active\">\r\n          <i class=\"icon ion-iphone\"></i>\r\n          Call Dorrbell Support\r\n        </ion-item>\r\n        <ion-item menu-close class=\"item-icon-left\" ng-click=\"signOut()\" ui-sref-active=\"active\">\r\n          <i class=\"icon ion-log-out\"></i>\r\n          Sign Out\r\n        </ion-item>\r\n      </ion-list>\r\n    </ion-content>\r\n  </ion-side-menu>\r\n</ion-side-menus>\r\n");
$templateCache.put("templates/unavailable.html","\r\n<ion-view class=\"login\" animation=\"no-animation\">\r\n	<ion-content has-bouncing=\"false\">\r\n  	<div class=\"middle-box text-center loginscreen\" style=\"position:relative;top:10vh;\">\r\n  		<div>\r\n  			<div>\r\n            <h1 class=\"logo-name\">\r\n              <img src=\"img/receipt-header-logo-hi-res.png\"/>\r\n            </h1>\r\n        </div>\r\n  			<h3 class=\"m-t-md\">The On-Demand Fitting Room</h3>\r\n        <p class=\"m-t-lg\">\r\n          Thank you for your interest in Dorrbell. Currently, we are in beta and only available in the Portland, Oregon area.\r\n          We will notify you as soon as the service becomes available in your area.\r\n        </p>\r\n        <p class=\"m-t-xl\">\r\n          - The Dorrbell Team\r\n        </p>\r\n  		</div>\r\n  	</div>\r\n	</ion-content>\r\n</ion-view>\r\n");}]);