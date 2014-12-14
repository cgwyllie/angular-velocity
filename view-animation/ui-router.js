;(function () {
	'use strict';

	var module;

	try {
		// Try to get the router module
		angular.module('ui.router');
		// Declare a module that depends on it if exists
		module = angular.module('angular-velocity.ui-router', ['ui.router']);
	}
	catch (e) {
		// Failed to get the ui.router module, so we declare a module with no dependencies and bail out
		console.log(e);
		module = angular.module('angular-velocity.ui-router', []);
		return;
	}

	module.run(function ($rootScope, $state, viewAnimationDirector) {
		console.log('hello from router module');

		// $rootScope.$on('$stateChangeStart', function (_, to, toParams) {
		// 	var toPath = $state.href(to, toParams),
		// 		dir = historyStack.getDirection(toPath);
			
		// 	console.log(dir);

		// 	trans = dirTransMap[dir];
		// });

		$rootScope.$on('$stateChangeSuccess', function (_, to, toParams) {
			var toPath = $state.href(to, toParams);
			viewAnimationDirector.pushPath(toPath);
		});
	});

})();