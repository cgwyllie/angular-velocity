
(function () {

	'use strict';

	var app = angular.module('angular-velocity', ['ngAnimate']);

	// Check we have velocity and the UI pack
	if (!$.Velocity || !$.Velocity.RegisterUI) {
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
			if (userOpts.complete) {
				opts.complete = function () {
					done();
					scope.$apply(userOpts.complete);
					scope = null;
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

	// Factory for the angular animation effect function (move animations)
	function makeAnimFor(animation, $parse) {
		return function ($el, done) {

			var opts = getVelocityOpts($parse, $el, done);

			$el.velocity(animation, opts);

			return function (cancel) {
				if (cancel) {
					$el.velocity('stop');
				}
			};
		};
	}

	// Factory for the angular animation effect function (class animations)
	function makeClassAnimFor(animation, $parse) {
		return function ($el, className, done) {

			if ('ng-hide' === className || 'ng-show' === className) {

				var opts = getVelocityOpts($parse, $el, done);

				$el.velocity(animation, opts);

				return function (cancel) {
					if (cancel) {
						$el.velocity('stop');
					}
				};
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
				'addClass': makeClassAnimFor(animation, $parse),
				'removeClass': makeClassAnimFor(animation, $parse)
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
				'addClass': makeClassAnimFor(animation, $parse),
				'removeClass': makeClassAnimFor(opp, $parse)
			};
		}];
	}

	// Use the factories to define animations for all velocity's sequences
	angular.forEach($.Velocity.RegisterUI.packagedEffects, function (_, animation) {
		var selector = '.' + animationToClassName(animation),
			oppositesSelector = '.' + animationToOppositesClassName(animation);

		app.animation(selector, makeAngularAnimationFor(animation));

		if (animation.substr(-2) === 'In') {
			app.animation(oppositesSelector, makeOppositesAnimationFor(animation));
		}
	});

})();
