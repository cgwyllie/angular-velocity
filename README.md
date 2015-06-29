
# Angular Velocity

[AngularJS](http://angularjs.org) ngAnimate integration for the [Velocity](http://velocityjs.org) animation library's UI pack plugin.

## Getting Started

### Install with Bower

```
bower install angular-velocity --save
```

#### Include Scripts

```html
<script src="bower_components/velocity/velocity.min.js"></script>
<script src="bower_components/velocity/velocity.ui.min.js"></script>
<script src="bower_components/angular-velocity/angular-velocity.min.js"></script>
```

> N.B. angular-velocity assumes that the Angular core and the additional `ngAnimate` module is loaded. `ngAnimate` can be found in the AngularJS 'additional modules'.

### Install with npm

```
npm install angular-velocity --save
```

#### Include Scripts

```html
<script src="node_modules/angular-velocity/angular-velocity.min.js"></script>
```
> N.B. When installing from npm, it is assumed that VelocityJS will be installed and loaded before Angular Velocity.

> N.B. angular-velocity assumes that the Angular core and the additional `ngAnimate` module is loaded. `ngAnimate` can be found in the AngularJS 'additional modules'.

### Declare Angular Dependency

```javascript
angular.module('your-app', ['angular-velocity']);
```

## Usage

This module declares Angular animations for each of the animations in the UI pack of Velocity following a standardised naming convention.

From Velocity, the period in a transition or callout name is replaced by a hyphen. For example, `transition.slideUpIn` becomes `velocity-transition-slideUpIn`.

This animation name is then used as a class name on any element you want to animate with the ngAnimate system, for example:

```html
<div class="velocity-transition-slideUpIn" ng-show="someCondition">
	I've been animated with Velocity and Angular!
</div>
```

### Opposites

Angular Velocity defines opposite animations for all animations that have a 'directional' component. For every 'In' transition, there is an opposite 'Out' transition that can be used.

These are defined with the prefix `velocity-opposites-` and will work with ngAnimate's enter & leave, and ngShow & ngHide.

For example:

```html
<div ng-view class="velocity-opposites-transition-slideUpIn">
	I enter with a transition.slideUpIn.<br>
	I leave with a transition.slideDownOut.
</div>
```

### Different Enter & Leave Animations

Angular Velocity defines an enter animation for every 'In' transition, and a leave animation for every 'Out' transition.

These are defined with the prefixes `velocity-enter-` and `velocity-leave-`, which work with ngEnter & ngShow, and ngLeave & ngHide respectively.

For example:

```html
<div ng-view class="velocity-enter-transition-slideRightIn velocity-leave-transition-slideDownOut">
	I enter with a transition.slideRightIn.<br>
	I leave with a transition.slideDownOut.
</div>
```

> You do not have to use an enter and a leave transition, they are independednt and you can specify them separaetly if desired.

### Velocity Options

Setting [Velocity options](http://julian.com/research/velocity/#arguments) is possible by defining the `data-velocity-opts` attribute on your animated element. This is an Angular-aware expression, so you can pass objects, bindings, or references to scope objects:

```html
<div 
    class="velocity-transition-slideUpIn"
    ng-show="someCondition"
    data-velocity-opts="{ duration: 5000 }">
	I've been animated with Velocity and Angular!
</div>
```

### Stagger

Staggering is supported for `ngEnter` and `ngLeave` animations. This works especially well with `ngRepeat`:

```html
<ul>
	<li 
	    class="velocity-transition-bounceRightIn"
	    data-velocity-opts="{ stagger: 350 }"
	    ng-repeat="item in items">
		{{ item }}
	</li>
</ul>
```

> **Complete Function**
> 
> The Velocity `complete` callback can be passed in the options and will be executed against your element's scope in a digest cycle.


## Contributing

Please feel free to fork, push, pull and all that other good Git stuff!

### Compression

```
uglifyjs angular-velocity.js -c -m -r '$,angular' --source-map angular-velocity.min.map -o angular-velocity.min.js
```

# Disclaimer

This project is not associated officially with either AngularJS or Velocity. It is just a little utility that was quickly thrown together to bridge an animation-shaped gap.

# Thanks

- [@albertogasparin](https://github.com/albertogasparin) for allowing registration of custom transitions after script load time
- [@MikaAK](https://github.com/MikaAK) for jQuery dependency removal
- [@tvararu](https://github.com/tvararu) for updates to work with Velocity 1.x
- [@rosslavery](https://github.com/rosslavery) for an example of how to access UI pack animations
