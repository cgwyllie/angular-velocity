;(function () {
	'use strict';

	var app = angular.module('angular-velocity.view-animation.core', [
		'angular-velocity.ngRoute',
		'angular-velocity.ui-router'
	]);

	// Utility to parse out velocity options
	// TODO split into factory?
	function getVelocityOpts($parse, $el, done) {
		var optsAttrVal = $el.attr('data-velocity-opts'),
			scope = $el.scope(),
			opts = {
				complete: done
			},
			userOpts;

		if (optsAttrVal) {
			userOpts = $parse(optsAttrVal)(scope);
			angular.extend(opts, userOpts);
			if (userOpts.begin) {
				opts.begin = function () {
					var args = Array.prototype.slice.call(arguments, 0);
					scope.$apply(function () {
						userOpts.begin.apply(args[0], args);
					});
				};
			}
			if (userOpts.complete) {
				opts.complete = function () {
					var args = Array.prototype.slice.call(arguments, 0);
					scope.$apply(function () {
						userOpts.complete.apply(args[0], args);
					});
					scope = null;
					done();
				};
			}
		}

		return opts;
	}

	app.animation('.animated-view', function ($parse, viewAnimationDirector) {
		return {
			'enter': function ($el, done) {
				var trans = viewAnimationDirector.getTransition(),
					opts = getVelocityOpts($parse, $el, done);
				console.log('enter with ' + trans.enter);

				$el.velocity(trans.enter, opts);
			},
			'leave': function ($el, done) {
				var trans = viewAnimationDirector.getTransition(),
					opts = getVelocityOpts($parse, $el, done);
				console.log('leave with ' + trans.leave);

				$el.velocity(trans.leave, opts);
			}
		};
	});

	app.service('historyStack', [function () {
		// Possible states:
		// 'child', 'parent', 'sibling', 'root'
		this.stack = [];
		this.stackPtr = -1;
		this.normalizePath = function (path) {
			path = path.replace(/^#?\//, ''); // Trim leading '#/' if present
			console.log('normal path: ' + path);
			return path;
		};

		this.splitPath = function (path) {
			return path.split('/');
		};
		
		this.push = function (path) {
			this.stack.push(this.normalizePath(path));
			++this.stackPtr;
			console.log(this.stack);
		};

		this.getType = function (toPath) {
			if (this.stackPtr < 0) {
				return 'new';
			}

			toPath = this.normalizePath(toPath);

			var rootParts = this.splitPath(this.stack[0]),
				toParts = this.splitPath(toPath),
				prevParts, prevPath;

			if (rootParts[0] !== toParts[0]) {
				this.stack = [];
				this.stackPtr = -1;
				return 'root change';
			}

			// Else the root is the same and it must be a child, parent, or sibling
			prevPath = this.stack[ this.stackPtr ];
			prevParts = this.splitPath(prevPath);

			var sharedLength = Math.min(toParts.length, prevParts.length),
				sharedRoot = true;

			for (var i = 0; i < sharedLength; ++i) {
				sharedRoot = sharedRoot && (prevParts[i] === toParts[i]);
			}

			// console.log('Shared root:');
			// console.log(sharedRoot);

			if (prevParts.length === toParts.length) {
				// Shot at 'sibling'
				return 'sibling';
			}
			else if (!sharedRoot) {
				return 'root change';
			}
			else {
				if (toParts.length < prevParts.length) {
					return 'parent';
				}
				else {
					return 'child';
				}
			}

			return 'unknown';
		};

		this.getDirection = function (toPath) {
			switch (this.getType(toPath)) {
				case 'new':
				case 'root change':
				case 'sibling':
					return 'none';
				case 'parent':
					return 'back';
				case 'child':
					return 'forward';
			}
		};
	}])

	app.service('viewAnimationDirector', function ($rootScope, historyStack) {
		var dirTransMap = {
				none: {
					enter: 'transition.fadeIn',
					leave: 'transition.fadeOut'
				},
				back: {
					enter: 'transition.slideLeftIn',
					leave: 'transition.slideRightOut',
				},
				forward: {
					enter: 'transition.slideRightIn',
					leave: 'transition.slideLeftOut'
				}
			},
			trans = dirTransMap['none'];

		this.getTransition = function () {
			return trans;
		};

		this.pushPath = function (path) {
			var dir = historyStack.getDirection(path);

			trans = dirTransMap[dir];

			historyStack.push(path);
		};
	});
})();