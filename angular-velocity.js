
(function () {

	'use strict';

	var CLASS_ANIM_ADD 	  = 0,
		CLASS_ANIM_REMOVE = 1,
		Velocity = window.Velocity || (window.jQuery && jQuery.Velocity);

	// Check we have velocity and the UI pack
	if (!Velocity || !Velocity.RegisterEffect) {
		throw "Velocity and Velocity UI Pack plugin required, please include the relevant JS files. Get Velocity with: bower install velocity";
	}

	// Utility to normalize the UI pack transition name
	function normalizeTransitionName(animation) {
		return animation.replace('.', '-');
	}

	// Utility to create class name for a sequence
	function animationToClassName(animation) {
		return 'velocity-' + normalizeTransitionName(animation);
	}

	// Utility to create an opposites class name for a sequence
	function animationToOppositesClassName(animation) {
		return 'velocity-opposites-' + normalizeTransitionName(animation);
	}

	// Utility to create an enter transition class name
	function animationToEnterClassName(animation) {
		return 'velocity-enter-' + normalizeTransitionName(animation);
	}

	// Utility to create a leave transition class name
	function animationToLeaveClassName(animation) {
		return 'velocity-leave-' + normalizeTransitionName(animation);
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
				Velocity($el, 'stop');
			}
		};
	}

	// Factory for the angular animation effect function (move animations)
	function makeAnimFor(animation, $parse) {
		return function ($el, done) {

			var opts = getVelocityOpts($parse, $el, done);

			Velocity($el, animation, opts);

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

				Velocity($el, animation, opts);

				return makeCancelFunctionFor($el);
			}
		};
	}

	// Factory for the angular animation effect function (grouped animations)
	function makeGroupedAnimFor(animation, event, queueFn, $parse) {
		return function ($el, done) {
			var cancel;

			// Hide element so it doesn't briefly show whilst queue is built
			if (event === 'enter') {
				$el.css('opacity', 0);
			}

			cancel = queueFn(event, $el[0], done, function(elements, onQueueDone) {
				var opts = getVelocityOpts($parse, $el, onQueueDone);
				Velocity(elements, animation, opts);
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

	// Factory for making enter/show animations
	function makeEnterAnimationFor(animation) {
		return ['$timeout', '$parse', function ($timeout, $parse) {

			var queueFn = newAnimationQueue($timeout);

			return {
				'enter': makeGroupedAnimFor(animation, 'enter', queueFn, $parse),
				'removeClass': makeClassAnimFor(CLASS_ANIM_REMOVE, animation, animation, $parse)
			};
		}];
	}

	// Factory for making leave/hide animations
	function makeLeaveAnimationFor(animation) {
		return ['$timeout', '$parse', function ($timeout, $parse) {

			var queueFn = newAnimationQueue($timeout);

			return {
				'leave': makeGroupedAnimFor(animation, 'leave', queueFn, $parse),
				'addClass': makeClassAnimFor(CLASS_ANIM_ADD, animation, animation, $parse)
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
	angular
		.module('angular-velocity', ['ngAnimate'])
		.config(['$animateProvider', function ($animateProvider) {
			// Use the factories to define animations for all velocity's sequences
			angular.forEach(Velocity.Redirects, function (_, animation) {
				var IN = 'In',
					OUT = 'Out',
					selector = '.' + animationToClassName(animation),
					oppositesSelector = '.' + animationToOppositesClassName(animation),
					enterSelector, leaveSelector;

				$animateProvider.register(selector, makeAngularAnimationFor(animation));

				if (animation.substr(-2) === IN) {
					enterSelector = '.' + animationToEnterClassName(animation);
					$animateProvider.register(oppositesSelector, makeOppositesAnimationFor(animation));
					$animateProvider.register(enterSelector, makeEnterAnimationFor(animation));
				}
				else if (animation.substr(-3) === OUT) {
					leaveSelector = '.' + animationToLeaveClassName(animation);
					$animateProvider.register(leaveSelector, makeLeaveAnimationFor(animation));
				}
			});
		}]);

})();
