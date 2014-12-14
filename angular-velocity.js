
(function () {

	'use strict';

	var app = angular.module('angular-velocity', ['ngAnimate', 'angular-velocity.ui-router']);

	// Some 'constants'
	var CLASS_ANIM_ADD = 0,
		CLASS_ANIM_REMOVE = 1;

	// Check we have velocity and the UI pack
	if (!$.Velocity || !$.Velocity.RegisterEffect) {
		throw "Velocity and Velocity UI Pack plugin required, please include the relevant JS files. Get Velocity with: bower install velocity";
	}

	// Utility to create class name for a sequence
	function animationToClassName(animation) {
		return 'velocity-' + animation.replace('.', '-');
	}

	// Utility to create an opposites class name for a sequence
	function animationToOppositesClassName(animation) {
		return 'velocity-opposites-' + animation.replace('.', '-');
	}

	// Utility to parse out velocity options
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

	// Utility for queueing animations together.
	// Staggering isn't natively supported by ngAnimate for JS animations yet, so
	// we use the workaround from: http://www.yearofmoo.com/2013/12/staggering-animations-in-angularjs.html
	function newAnimationQueue($timeout) {
		var queue = {
			enter: [],
			leave: []
		};

		return function queueAllAnimations(event, element, done, onComplete) {
				var eventQueue = queue[event];

				eventQueue.push({
					element : element,
					done : done
				});

				eventQueue.timer && $timeout.cancel(eventQueue.timer);
				eventQueue.timer = $timeout(function() {
					var elms = [],
						doneFns = [],
						onDone;

					angular.forEach(eventQueue, function(item) {
						item && elms.push(item.element);
						doneFns.push(item.done);
					});

					onDone = function() {
						angular.forEach(doneFns, function(fn) {
						  fn();
						});
					};

					onComplete(elms, onDone);
					queue[event] = [];
				}, 10, false);

				return function() {
					queue[event] = [];
				};
			};
	}

	function makeCancelFunctionFor($el) {
		return function (cancel) {
			if (cancel) {
				$el.velocity('stop');
			}
		};
	}

	// Factory for the angular animation effect function (move animations)
	function makeAnimFor(animation, $parse) {
		return function ($el, done) {

			var opts = getVelocityOpts($parse, $el, done);

			$el.velocity(animation, opts);

			return makeCancelFunctionFor($el);
		};
	}

	// Factory for the angular animation effect function (class animations (ng-hide))
	function makeClassAnimFor(addOrRemove, addAnim, removeAnim, $parse) {
		return function ($el, className, done) {

			var animation = addAnim,
				opts;

			if ('ng-hide' === className) {

				animation = (addOrRemove === CLASS_ANIM_ADD) ? removeAnim : animation;

				opts = getVelocityOpts($parse, $el, done);

				$el.velocity(animation, opts);

				return makeCancelFunctionFor($el);
			}
		};
	}

	// Factory for the angular animation effect function (grouped animations)
	function makeGroupedAnimFor(animation, event, queueFn, $parse) {
		return function ($el, done) {

			var opts = getVelocityOpts($parse, $el, done);

			// Hide element so it doesn't briefly show whilst queue is built
			if (event === 'enter') {
				$el.css('opacity', 0);
			}

			var cancel = queueFn(event, $el[0], done, function(elements, done) {
				$(elements).velocity(animation, opts);
			});

			return function onClose(cancelled) {
				cancelled && cancel();
			};
		};
	}

	// Factory for making animations
	function makeAngularAnimationFor(animation) {
		return ['$timeout', '$parse', function ($timeout, $parse) {

			var queueFn = newAnimationQueue($timeout);

			return {
				'enter': makeGroupedAnimFor(animation, 'enter', queueFn, $parse),
				'leave': makeGroupedAnimFor(animation, 'leave', queueFn, $parse),
				'move': makeAnimFor(animation, $parse),
				'addClass': makeClassAnimFor(CLASS_ANIM_ADD, animation, animation, $parse),
				'removeClass': makeClassAnimFor(CLASS_ANIM_REMOVE, animation, animation, $parse)
			};
		}];
	}

	// Factory for making opposite animations
	function makeOppositesAnimationFor(animation) {
		return ['$timeout', '$parse', function ($timeout, $parse) {
			var queueFn = newAnimationQueue($timeout);

			var opp = animation.replace('In', 'Out');

			if (opp.indexOf('Down') > -1) {
				opp = opp.replace('Down', 'Up');
			}
			else if (opp.indexOf('Up') > -1) {
				opp = opp.replace('Up', 'Down');
			}
			else if (opp.indexOf('Left') > -1) {
				opp = opp.replace('Left', 'Right');
			}
			else if (opp.indexOf('Right') > -1) {
				opp = opp.replace('Right', 'Left');
			}

			return {
				'enter': makeGroupedAnimFor(animation, 'enter', queueFn, $parse),
				'leave': makeGroupedAnimFor(opp, 'leave', queueFn, $parse),
				'move': makeAnimFor(animation, $parse),
				'addClass': makeClassAnimFor(CLASS_ANIM_ADD, animation, opp, $parse),
				'removeClass': makeClassAnimFor(CLASS_ANIM_REMOVE, animation, opp, $parse)
			};
		}];
	}

	// Use the factories to define animations for all velocity's sequences
	angular.forEach($.Velocity.RegisterEffect.packagedEffects, function (_, animation) {
		var selector = '.' + animationToClassName(animation),
			oppositesSelector = '.' + animationToOppositesClassName(animation);

		app.animation(selector, makeAngularAnimationFor(animation));

		if (animation.substr(-2) === 'In') {
			app.animation(oppositesSelector, makeOppositesAnimationFor(animation));
		}
	});

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
			// console.log(this.stack);
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

	// app.service('viewAnimationDirector', function ($rootScope, $state) {
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

		// $rootScope.$on('$routeChangeStart', function (_, to, from) {
		// 	var toPath = to.$$route.originalPath,
		// 		dir = historyStack.getDirection(toPath);
			
		// 	trans = dirTransMap[dir];
			
		// 	historyStack.push(toPath);
		// });

		// $rootScope.$on('$stateChangeStart', function (_, to, toParams) {
		// 	// console.log(to);
		// 	// // console.log($state.href(to, toParams));

		// 	var toPath = $state.href(to, toParams),
		// 		dir = historyStack.getDirection(toPath);
			
		// 	console.log(dir);

		// 	trans = dirTransMap[dir];
		// });

		// $rootScope.$on('$stateChangeSuccess', function (_, to, toParams) {
		// 	var toPath = $state.href(to, toParams);
		// 	historyStack.push(toPath);
		// });

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
