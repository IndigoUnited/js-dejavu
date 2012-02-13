# Classify, a set of object-oriented tools for JavaScript #

---

Prototypal inheritance is powerful and flexible, yet difficult to understand and to use on large projects.
Classify is a library that delivers classic inheritance on top of JavaScript prototypal inheritance.


## Why another? ##

There are some libraries around that are able to shim classical inheritance, though none of them offered all the functionality that I was looking for.
Besides that, I was looking for something fast on top of [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD).



## Features ##

* Basic classical inheritance
* Abstract classes
* Interfaces
* Mixins (so you can get some sort of multiple inheritance)
* Context binding for functions (useful for functions that will be used as callbacks/handlers)
* Method signature checks
* Custom instanceOf that also works with interfaces
* Has two builds, one regular and one AMD based

__NOTE__: Regular build will be made soon!


## Performance ##

All kind of validations to ensure that your classes are well defined and obey all the common rules of classic inheritance degrade performance.
Thats why there is a __strict__ and a __loose__ version for each build.

The strict version throws an error when something is not right and therefore is suitable for development.
The loose build has no overhead associated with verifications and therefore is suitable for production.
If your classes schema work in the strict version then is safe to use them in the loose version.
The loose version also has lower memory footprint and less size in bytes.

There is no super() or parent() inside your functions. In order to do that, a wrapper must be created for each function, degrading performance.
Instead, we provide an alternative syntax that performs much better (see usage bellow).

## To be done ##

* Protected/private members are not yet supported, instead they should prefixed with an _ and an __ respectively.
Private and protected functions could be made by creating wrappers around them.
Still, there is no crossbrowser way to define private and protected variables.
Those will be implemented soon using the [Object.defineProperty](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty) in the strict version only in environments that implement it.
* Support for constants/final.

Stay tuned!

## Usage ##

All examples bellow use the AMD format.



### Interface definition ###

Object interfaces allow you to create code which specifies which methods a class must implement, without having to define how these methods are handled.
Bellow there's an example of an _EventsInterface_, that has the role of adding event listeners and fire events:

```js
define(['path/to/classify/Interface'], function (Interface) {

    var EventsInterface = Interface({

        addListener: function (name, fn, context) {},

        removeListener: function (name, fn) {},

        fireEvent: function (name, args) {}
    });

    return EventsInterface;
});
```

Interfaces can extend multiple interfaces. They can also define static functions signature.
Be aware that all functions must obey it's base signature (see explanation bellow).

```js
define(['path/to/EventsInterface', 'path/to/classify/Interface'], function (Interface) {

    var SomeEventsInteface = Interface({
        Extends: EventsInterface,   // This interface extends EventsInterface

        Statics: {                  // This is how we define statics
            getTotalListeners: function () {}
        }

    });

    return SomeEventsInterface;
});
```



### Interface usage example ###

A class that implements an interface must define all the interface methods and be compatible with their signature.
You define that a class implements an interface by specifying it in the Implements keyword.
The Implements keyword can be an interface or an array of interfaces.
Following our previous example we can define a concrete class - _EventsEmitter_ - that implements the _EventsInterface_ interface.

```js
define(['path/to/EventsInterface', 'path/to/classify/Class'], function (EventsInterface, Class) {

    var EventsEmitter = Class({
        Implements: EventsInterface,   // The class implements the EventsInterface interface
                                       // You can specify multiple interfaces in an array

        addListener: function (name, fn, context) {
            // Implementation goes here
        },

        removeListener: function (name, fn) {
            // Implementation goes here
        },

        fireEvent: function (name, args) {
            // Implementation goes here
        }
    });

    return EventsEmitter;
});
```



### Abstract classes ###

Classes defined as abstract may not be instantiated, and any class that contains at least one abstract method must also be abstract.
Methods defined as abstract simply declare the method's signature.
When an abstract class implements an interface and doesn't implement some of its methods, those will be automatically declared as abstract.
Bellow there is an example of an abstract class - _AbstractEmitter_ - that implements all of the _EventsInterface_ interface methods, except the _fireEvent()_ method.

```js
define([
    'path/to/EventsInterface',
    'path/to/classify/AbstractClass'
],
function (EventsInterface, AbstractClass) {

    var AbstractEventsEmitter = Class({
        Implements: EventsInterface,   // The class must implement the EventsInterface

        initialize: function (argument1) {
            // This is the constructor
            // Calling new on an abstract class will throw an error
            // Though a class that extends this abstract class will run this constructor if called
        },

        addListener: function (name, fn, context) {
            // Implementation goes here
        },

        removeListener: function (name, fn) {
            // Implementation goes here
        },

        // fireEvent() is not implemented, therefore is automatically declared as abstract

        Abstracts: {                   // This how we defined abstract methods

            removeAll: function () {},

            Statics: {                 // We can also define abstract static methods
                getTotalListeners: function () {}
            }
        }
    });

    return AbstractEventsEmitter;
});
```

Abstract classes can extend other abstract classes or concrete classes while implementing other interfaces.
Be aware that they must obey their base signature.

```js
define([
    'path/to/some/class',
    'path/to/some/interface',
    'path/to/other/interfaces',
    'path/to/classify/AbstractClass'
],
function (SomeClass, SomeInterface, OtherInterface, AbstractClass) {

    var ComplexAbstractClass = AbstractClass({

        Extends: SomeClass,
        Implements: [SomeInterface, OtherInterface],

        /**
         * Class constructor.
         */
        initialize: function (argument1) {
            // Call super
            ComplexAbstractClass.Super.initialize.call(this, argument1);

            // Do other things here
        },

        Statics: {
            // Some class static members
        },

        Abstracts: {

            // Some abstract functions

            Statics: {
                // Some abstract static functions
            }
        }
    });

    return ComplexAbstractClass;
});
```



### Concrete classes ###

Concrete classes can extend other concrete classes or abstract classes as well as implement several interfaces.
They differ from abstract classes in the way that they can't have abstract methods.
Bellow is described the full syntax that can be used in concrete and abstract classes.

```js
define([
    'path/to/some/class',
    'path/to/other/class',
    'path/to/some/interface',
    'path/to/other/interfaces',
    'path/to/classify/Class'
],
function (SomeClass, OtherClass, SomeInterface, OtherInterface, Class) {

    var ConcreteClass = Class({
        Extends: SomeClass,
        Implements: [SomeInterface, OtherInterface],
        Borrows: OtherClass                             // We can add mixins by specifying them in here
                                                        // You can specify multiple mixins in an array

        Binds: 'handleClick',                           // Binds let you automatically bind the function to the instance
                                                        // Useful for handlers/callbacks
                                                        // You can specify multiple Binds in an array

        /**
         * Class constructor.
         */
        initialize: function () {
            // Call super
            ConcreteClass.Super.initialize.call(this, argument1);

            // Do other things here
        },

        /**
         * Handles some click event.
         */
        handleClick: function () {
            // Handle click here
        },

        Statics: {
            // Some class static members
        }
    });
});

```



### Mixins ###

A mixin is a class or object that provides a certain functionality to be reused by other classes, since all their members will be copied (expect for the initialize method).
Mixins can be used like specified in the example above.
If clashes occur with multiple mixins, that last one takes precedence.



### Binds ###

The binds keyword allows you to specify functions that should be bound to the instance.
This is useful if certain functions are meant to be used as callbacks or handlers.
You don't need to bind the function manually, it will be bound for you automatically.



### Calling the parent function ###

As mentioned above, there is no super() or parent() inside of functions.
Libraries that provide it are required to create wrappers to provide it.
Those wrappers obviously degrade performance (e.g.: if you call a instance method 100 times, in reality there was at least 200 function calls).
Instead, you may use this syntax:

```js
define(['path/to/classify/Class'], function (Class) {

    var SomeClass = Class{(
        'foo': function () {
            // Do something here
        }
    });

    var ComplexClass = Class({
        Extends: SomeClass,

        foo: function () {
            // Call super
            ComplexClass.Super.foo.call(this);

            // Do other things
        }
    });

    return ComplexClass;

});
```

Because the parent reference is attached statically there is no performance overhead.
With this syntax it also gives you the flexibility to call other parent methods.

## Signature check ##

All functions are virtual functions. A method can override another if they obey their signature, that means that
they must be equal or augmented with additional optional arguments. Optional arguments are prefixed with a $ so they can be qualified as optional.
The signature check are made for every class, abstract class and interface.

```js
var SomeClass = Class{(
    'foo': function (param1) {
        // Do something here
    }
});

var ComplexClass = Class({
    Extends: SomeClass,

    'foo': function (param1, $param2) { }   // It's ok, was augmented with an additional optional argument
});

var OtherComplexClass = Class({
    Extends: SomeClass,

    'foo': function (param1, param2) { }    // Will throw an error because foo(param1, param2) is not compatible with foo(param1, $param2)
});
```

## Dependencies ##

Classify depends on [amd-utils](https://github.com/millermedeiros/amd-utils).
If you use the regular build, you don't need to worry because all functions used from amd-utils are bundled for you.
If you use the AMD build, you must specify the path to amd-utils.
For example, if you use [RequireJS](http://requirejs.org/):

```js
    paths : {
        'Utils': '../vendor/amd-utils/src'
    },
```



## Bulding Classify ##

Please take a look at the [build](https://github.com/TrinityJS/Classify/tree/master/build) section.



## Testing Classify ##

Please take a look at the [test](https://github.com/TrinityJS/Classify/tree/master/test) section.



## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).



## Credits ##

Thanks to [Luís Couto](https://github.com/Couto) for his initial contributions.
