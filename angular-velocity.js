
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

	function makeAnimFor(animation) {
		return function ($el, done) {
			// console.log('Running animation ' + animation);
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
		return function () {
			return {
				enter: makeAnimFor(animation),
				leave: makeAnimFor(animation),
				move: makeAnimFor(animation),
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
