
(function () {
	
	var app = angular.module('angular-velocity', ['ngAnimate']);

	var animations = [
		'fadeIn',
		'fadeOut',
		'callout.bounce',
		'callout.shake',
		'callout.flash',
		'callout.pulse',
		'callout.swing',
		'callout.tada',
		'transition.flipXIn',
		'transition.flipXOut',
		'transition.flipYIn',
		'transition.flipYOut',
		'transition.flipBounceXIn',
		'transition.flipBounceXOut',
		'transition.flipBounceYIn',
		'transition.flipBounceYOut',
		'transition.swoopIn',
		'transition.swoopOut',
		'transition.whirlIn',
		'transition.whirlOut',
		'transition.shrinkIn',
		'transition.shrinkOut',
		'transition.expandIn',
		'transition.expandOut',
		'transition.bounceIn',
		'transition.bounceOut',
		'transition.bounceUpIn',
		'transition.bounceUpOut',
		'transition.bounceDownIn',
		'transition.bounceDownOut',
		'transition.bounceLeftIn',
		'transition.bounceLeftOut',
		'transition.bounceRightIn',
		'transition.bounceRightOut',
		'transition.slideUpIn',
		'transition.slideUpOut',
		'transition.slideDownIn',
		'transition.slideDownOut',
		'transition.slideLeftIn',
		'transition.slideLeftOut',
		'transition.slideRightIn',
		'transition.slideRightOut',
		'transition.slideUpBigIn',
		'transition.slideUpBigOut',
		'transition.slideDownBigIn',
		'transition.slideDownBigOut',
		'transition.slideLeftBigIn',
		'transition.slideLeftBigOut',
		'transition.slideRightBigIn',
		'transition.slideRightBigOut',
		'transition.perspectiveUpIn',
		'transition.perspectiveUpOut',
		'transition.perspectiveDownIn',
		'transition.perspectiveDownOut',
		'transition.perspectiveLeftIn',
		'transition.perspectiveLeftOut',
		'transition.perspectiveRightIn',
		'transition.perspectiveRightOut'
	];

	function animationToClassName(animation) {
		return 'velocity-' + animation.replace('.', '-');
	}

	function animationToOppositesClassName(animation) {
		return 'velocity-opposites-' + animation.replace('.', '-');
	}

	function makeAnimFor(animation, $timeout) {
		return function ($el, done) {
			$el.velocity(animation, {
				complete: done
			});

			return function (cancel) {
				if (cancel) {
					$el.velocity('stop');
				}
			};
		};
	}

	function makeClassAnimFor(animation) {
		return function ($el, className, done) {
			// console.log('Running animation ' + animation);
			if ('ng-hide' === className || 'ng-show' === className) {
				$el.velocity(animation, {
					complete: done
				});

				return function (cancel) {
					if (cancel) {
						$el.velocity('stop');
					}
				};
			}
		};
	}

	function makeAngularAnimationFor(animation) {
		return function ($timeout, $parse) {

			var queue = { enter : [], leave : [] };
			  function queueAllAnimations(event, element, done, onComplete) {
			    var index = queue[event].length;
			    queue[event].push({
			      element : element,
			      done : done
			    });
			    queue[event].timer && $timeout.cancel(queue[event].timer);
			    queue[event].timer = $timeout(function() {
			      var elms = [], doneFns = [];
			      angular.forEach(queue[event], function(item) {
			        item && elms.push(item.element);
			        doneFns.push(item.done);
			      });
			      var onDone = function() {
			        angular.forEach(doneFns, function(fn) {
			          fn();
			        });
			      };
			      onComplete(elms, onDone);
			      queue[event] = [];
			    }, 10, false);

			    return function() {
			      queue[event] = [];
			    }
			  };

			return {
				//enter: makeAnimFor(animation, $timeout),
				enter: function ($el, done) {

					var optsAttrVal = $el.attr('data-velocity-opts'),
						scope = $el.scope(),
						opts = {
							complete: done
						},
						userOpts, completeFn;

					if (optsAttrVal) {
						userOpts = $parse(optsAttrVal)(scope);
						angular.extend(opts, userOpts);
						if (userOpts.complete) {
							opts.complete = function () {
								done();
								scope.$apply(userOpts.complete);
							};
						}
					}

					console.log(opts);

					$el.css('opacity', 0);

					var cancel = queueAllAnimations('enter', $el[0], done, function(elements, done) {
						$(elements).velocity(animation, opts);
					});

					return function onClose(cancelled) {
						cancelled && cancel();
					};
				},
				leave: makeAnimFor(animation, $timeout),
				move: makeAnimFor(animation, $timeout),
				addClass: makeClassAnimFor(animation),
				removeClass: makeClassAnimFor(animation)
			};
		};
	}

	function makeOppositesAnimationFor(animation) {
		// console.log('Made opposite animation');

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

		return function () {
			return {
				enter: makeAnimFor(animation),
				leave: makeAnimFor(opp),
				move: makeAnimFor(animation),
				addClass: makeClassAnimFor(animation),
				removeClass: makeClassAnimFor(opp)
			};
		};
	}

	var i, animation, selector, oppositesSelector;
	for (i = 0; i < animations.length; ++i) {
		animation = animations[i];

		selector = '.' + animationToClassName(animation);
		oppositesSelector = '.' + animationToOppositesClassName(animation);

		// console.log('Making animation for ' + animation + ' with selector ' + selector);

		app.animation(selector, makeAngularAnimationFor(animation));
		
		if (animation.substr(-2) === 'In') {
			app.animation(oppositesSelector, makeOppositesAnimationFor(animation));
		}
	}

})();
