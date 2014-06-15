
# Angular Velocity

AngularJS ngAnimate integration for the VelocityJS animation library's UI pack plugin.

## Installation

```
bower install angular-velocity
```

## Usage

### Dependencies

- VelocityJS
- VelocityJS UI Pack Plugin
- ngAnimate

Include `angular-velocity.js` and declare it as a dependency on your Angular app's module:

```javascript
angular.module('your-app', ['angular-velocity']);
```

This module declares Angular animations for each of the animations in the UI pack of Velocity following a standardised naming convention.

From Velocity, the period in a transition or callout name is replaced by a hyphen. For example, `transition.slideUpIn` becomes `velocity-transition-slideUpIn`.

This animation name is then used as a class name on any element you want to animate with the ngAnimate system, for example:

```html
<div class="velocity-transition-slideUpIn" ng-show="someCondition">
	I've been animaetd with Velocity and Angular!
</div>

```

### Opposites

Angular Velocity defines opposite animations for all animations that have a 'directional' component. For every 'In' transition, there is an opposite 'Out' transition that can be used.

These are defined with the prefix `velocity-opposites-` and will work with ngAnimate's enter & leave, and ngShow & ngHide.

For example:

```html
<div ng-view class="velocity-opposites-transition-slideUpIn">
	I leave with a transition.slideDownOut.
</div>
```

## Contributing

Please feel free to fork, push, pull and all that other good Git stuff!

# Disclaimer

This project is not associated officially with either AngularJS or VelocityJS. It is just a little utility that was quickly thrown together to bridge an animation-shaped gap.
