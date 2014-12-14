;(function () {
	'use strict';

	var module;

	try {
		// Try to get the router module
		angular.module('ngRoute');
		// Declare a module that depends on it if exists
		module = angular.module('angular-velocity.ngRoute', ['ngRoute']);
	}
	catch (e) {
		// Failed to get the ui.router module, so we declare a module with no dependencies and bail out
		console.log(e);
		module = angular.module('angular-velocity.ngRoute', []);
		return;
	}

	module.run(function ($rootScope, viewAnimationDirector) {
		$rootScope.$on('$routeChangeSuccess', function (_, to) {
			var toPath = to.$$route.originalPath;
			viewAnimationDirector.pushPath(toPath);
		});
	});

})();