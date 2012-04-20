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
* Private and protected members
* Context binding for functions (useful for functions that will be used as callbacks/handlers)
* Method signature checks
* Custom instanceOf that also works with interfaces
* Has two builds, one regular and one AMD based
* Loose build (the one to be used in production) has 9.71Kb minified and 3.7Kb minified + gziped
* Classes and instances are locked, members cannot be changed or added (only applicable to some browsers, such as Chrome)

Users are encouraged to declare 'use strict' while using the strict build otherwise some code can fail [silently](https://developer.mozilla.org/en/JavaScript/Strict_mode).
This is because Classify uses Object.freeze and/or Object.seal to lock classes and instances, guarateeing that nobody changes the behaviour of your classes the wrong way (replacing methods, etc).
The regular build is __not__ compatible with the 'use strict' because it uses the deprecated .caller property to provide better performance (avoiding wrappers for methods in order to support the $super()).
Run a preprocessor to remove 'use strict' from all production code (e.g.: requirejs optimizer tool).

## Works on ##

* IE (6+?)
* Chrome (4+?)
* Safari (3+?)
* Firefox (3.6+?)
* Opera (9+?)
* Node and Rhino

Some features like private and protected members access management are only available in modern JavaScript engines (the ones that support Object.defineProperty).
Still, the library provide fallbacks for those cases.
The regular build is also compatible with CommonJS modules, so it works well with Node and Rhino.

Please avoid using object constructors for strings, objects, booleans and numbers:

```js
var MyClass = Class({
    foo: new String('bar'),  // Don't use this
    foz: 'bar'               // Ok
});
```

## Performance ##

All kind of validations to ensure that your classes are well defined and obey all the common rules of classic inheritance degrade performance.
That's why there is a __strict__ and a __loose__ version for each build.

The strict version throws an error when something is not right and therefore is suitable for development.
The loose build has no overhead associated with verifications and therefore is suitable for production.
If your classes schema work in the strict version then is safe to use them in the loose version.
The loose version also has lower memory footprint and less size in bytes.

Also there is an alternative to $super() inside your functions. The alternative is relatively faster than the original $super() and can be used in critical code.
See below for more information.

I've publish a new test revision on [jsperf](http://jsperf.com/oop-benchmark/13) comparing Classify with other OOP libraries.
The version running is the regular (loose build). Classify uses a wrapper for the constructor function therefore its performance can't be compared to JSFace or my.Class.
The constructor wrapper is needed in order to apply binds and to make mutable types unique for each instance (for example, if an property is an array it should not be shared among instances, but in JSFace and my.Class they actually are).

## Usage ##

All examples below use the AMD format.



### Interface definition ###

Object interfaces allow you to create code which specifies which methods a class must implement, without having to define how these methods are handled.
Below there's an example of an _EventsInterface_ that has the role of adding event listeners and fire events:

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
Be aware that all functions must obey it's base signature (see explanation later in this document).

```js
define(['path/to/EventsInterface', 'path/to/classify/Interface'], function (EventsInterface, Interface) {

    var SomeEventsInterface = Interface({
        $extends: EventsInterface,   // This interface extends EventsInterface
                                     // Interfaces can extend multiple ones, just reference them in an array

        $statics: {                  // This is how we define statics
            getTotalListeners: function () {}
        }

    });

    return SomeEventsInterface;
});
```



### Interface usage example ###

A class that implements an interface must define all the interface methods and be compatible with their signature.
You define that a class implements an interface by specifying it in the $implements keyword.
The $implements keyword can be an interface or an array of interfaces.
Following the previous example we can define a concrete class - _EventsEmitter_ - that implements the _EventsInterface_ interface.

```js
define([
    'path/to/EventsInterface',
    'path/to/classify/Class'
], function (EventsInterface, Class) {

    var EventsEmitter = Class({
        $implements: EventsInterface,   // The class implements the EventsInterface interface
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
Below there is an example of an abstract class - _AbstractEmitter_ - that implements all of the _EventsInterface_ interface methods, except the _fireEvent()_ method.

```js
define([
    'path/to/EventsInterface',
    'path/to/classify/AbstractClass'
],
function (EventsInterface, AbstractClass) {

    var AbstractEventsEmitter = AbstractClass({
        $implements: EventsInterface,   // The class must implement the EventsInterface

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

        $abstracts: {                   // This how we defined abstract methods

            removeAll: function () {},

            $statics: {                 // We can also define abstract static methods
                getTotalListeners: function () {}
            }
        }
    });

    return AbstractEventsEmitter;
});
```

Abstract classes can extend other abstract classes or concrete classes while implementing other interfaces.

```js
define([
    'path/to/some/class',
    'path/to/some/interface',
    'path/to/other/interfaces',
    'path/to/classify/AbstractClass'
],
function (SomeClass, SomeInterface, OtherInterface, AbstractClass) {

    var ComplexAbstractClass = AbstractClass({

        $extends: SomeClass,
        $implements: [SomeInterface, OtherInterface],

        /**
         * Class constructor.
         */
        initialize: function (argument1) {
            // Call super
            this.$super(argument1);

            // Do other things here
        },

        $statics: {
            // Some class static members
        },

        $abstracts: {

            // Some abstract functions

            $statics: {
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
Below is described the full syntax that can be used in concrete and abstract classes.

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
        $extends: SomeClass,
        $implements: [SomeInterface, OtherInterface],
        $borrows: OtherClass,                            // We can add mixins by specifying them in here
                                                        // You can specify multiple mixins in an array

        $binds: 'handleClick',                          // $binds let you automatically bind the function to the instance
                                                        // Useful for handlers/callbacks
                                                        // You can specify multiple binds in an array

        /**
         * Class constructor.
         */
        initialize: function () {
            // Call super
            this.$super();

            // Do other things here
        },

        /**
         * Handles some click event.
         */
        handleClick: function () {
            // Handle click here
        },

        $statics: {
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

The $binds keyword allows you to specify functions that should be bound to the instance.
This is useful if certain functions are meant to be used as callbacks or handlers.
You don't need to bind the function manually, it will be bound for you automatically.


### Constants ###

The $constants keyword allows you to defined constants.
If Object.defineProperty is available, any attempt to modify the constant value will throw an error (only in the strict version).
Constants can be defined in classes, abstract classes and interfaces.

```js
define(['path/to/classify/Class', function (Class) {

    var SomeClass = Class({
        $constants: {
            FOO: 'bar'
            BAR: 'foo'
        },

        /**
         * Class constructor.
         */
        initialize: function () {
            this.$self().FOO;  // 'bar'
            SomeClass.FOO;     // 'bar' (is the same as above)
        }
    });

    SomeClass.FOO; // 'bar'
    SomeClass.BAR; // 'foo'

    return SomeClass;
});
```


### Final members/classes ###

Members that are declared as final cannot be overriden by a child class.
If the class itself is being defined final then it cannot be extended.

```js
define(['path/to/classify/FinalClass', function (FinalClass) {

    var SomeClass = FinalClass({        // This class cannot be extended

        /**
         * Class constructor.
         */
        initialize: function () {
            // ...
        }
    });

    return SomeClass;
});

define(['path/to/classify/Class', function (Class) {

    var SomeClass = Class({

        /**
         * Class constructor.
         */
        initialize: function () {
            // ...
        },

        $finals: {                 // Classes that extend this one are not allowed to override the members below

            someMethod: function () {
                // ...
            },
            someProperty: 'foo',

            $statics: {             // We can also define static methods as final
                staticMethod: function () {
                    // ...
                },
                staticProperty: 'bar'
            }
    });

    return SomeClass;
});

```

### Protected and private members ###

Protected and private members should be prefixed with _ and __ respectively.
If Object.defineProperty is available, it will be used to manage their access (only in the strict version).



### Calling the parent function ###

As mentioned above, $super() can be slow compared to its alternative.
Its alternative is as simple as ClassName.$parent.prototype.method.call(this, args1, ...) for instances and ClassName.$parent.method.call(this, args1, ...) from within static context:

```js
define(['path/to/classify/Class'], function (Class) {

    var SomeClass = Class({
        foo: function () {
            // Do something here
        },
        $statics: {
            bar: function () {
                // Do something here
            }
        }
    });

    var ComplexClass = Class({
        $extends: SomeClass,

        foo: function () {
            // Call super
            ComplexClass.$parent.prototype.foo.call(this);

            // Do other things
        },

        $statics: {
            bar: function () {
                // Call super
                ComplexClass.$parent.bar.call(this);

                // Do other things
            }
        }
    });

    return ComplexClass;
});
```

Because the parent reference is attached statically there is no performance overhead.
With this syntax it also gives you the flexibility to call other parent methods.

### Signature check ###

All functions are virtual functions, therefore it can be overriden except if it's classified as final.
Aditionally, if a method is abstract, a subclass can only implement/override it if they obey their signature (must be equal or augmented with additional optional arguments).
Arguments prefixed with a $ are evaluated as optional. The signature check is done for all abstract functions (interface functions are also considered abstract).

```js
var SomeAbstractClass = AbstractClass({
    $abstracts: {
        foo: function (param1) {}
    }
});

var SomeClass = Class({
    $extends: SomeAbstractClass,

    foo: function (param1) {             // Signature is equal, it's valid
        // Do something here
    }
});

var ComplexClass = Class({
    $extends: SomeClass,

    foo: function (param1, $param2) {    // Although it's signature is not equal, was augmented with an additional optional argument, so it's valid
        // Do something here
    }
});

var OtherComplexClass = Class({
    $extends: SomeClass,

    foo: function (param1, param2) {     // Will throw an error because foo(param1) is not compatible with foo(param1, param2)
        // Do something here
    }
});
```

### Calling static methods within an instance ###

To call static methods inside an instance you can use $self() and $static().
$self gives access to the class itself and $static gives access to the called class in a context of static inheritance.
$self is the same as using the class variable itself.

```js
var Example1 = Class({
    foo: function (param1) {
        return this.$self().bar;    // same as Example1.bar;
    },
    $statics: {
        bar: 'hello'
    }
});

var Example2 = Class({
    foo: function (param1) {
        return this.$static().bar;
    },
    $statics: {
        bar: 'hello'
    }
});

var Example3 = Class({
    $extends: Example1
    $statics: {
        bar: 'bye'
    }
});

var Example4 = Class({
    $extends: Example2
    $statics: {
        bar: 'bye'
    }
});

Example3.foo(); // hello
Example4.foo(); // bye
```

### instanceOf ###

The instanceOf function works exactly the same way as the native instanceof except that it also works for interfaces.



## Dependencies ##

Classify depends on [amd-utils](https://github.com/millermedeiros/amd-utils).
If you use the regular build, you don't need to worry because all functions used from amd-utils are bundled for you.
If you use the AMD build, you must specify the path to amd-utils.
For example, if you use [RequireJS](http://requirejs.org/):

```js
    paths : {
        'amd-utils': '../vendor/amd-utils/src'
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
