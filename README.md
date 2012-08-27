# dejavu #

---

Have you ever had the feeling that you're seeing something you've already seen
before? That's the feeling you get when using `dejavu`.

If you are a developer coming from a language like PHP, Java, ActionScript 3.0,
and others, it's likely that you are already familiar with Object Oriented
Programming. However, JavaScript uses prototypal inheritance which, although
powerful and flexible, can be difficult to understand, and specially to maintain
in large projects.

`dejavu` is a library that delivers classical inheritance on top of JavaScript
prototypal inheritance, making it a breeze to move into JavaScript.



## Why another? ##

There are some libraries out there able to shim classical inheritance,
however none offers all the functionality that many programmers require.

Plus, performance and testing round-trips are really important for developers,
which is why `dejavu` is built on top of
[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD). Also, even though being one
of the most feature rich OOP libraries out there, it has one of the best
performances, rivaling with vanilla JS in production.



## Features ##

* Classical inheritance
* Abstract classes
* Interfaces
* Mixins (so you can get some sort of multiple inheritance)
* Private and protected members
* Static members
* Constants
* Ability to declare true singletons via protected/private constructors
* Context binding for functions (useful for functions that will be used as
  callbacks/handlers)
* Method signature checks
* Custom instanceOf with support for Interfaces
* Two builds, `regular` and `AMD` based
    * `AMD` optimized for speeding up developer workflow, allowing testing
      without the need to re-compile everything into a single file
    * `regular` ideal if you want to deploy, with less files
* Two modes for each build, `strict` and `loose`
    * `strict` best in development, enforcing a lot of checks, making sure you
      don't make many typical mistakes
    * `loose` best for production, without checks, improving performance
* Classes and instances are locked, members cannot be changed or added (only
  applicable to some browsers, such as Chrome)

Users are encouraged to declare
['use strict'](https://developer.mozilla.org/en/JavaScript/Strict_mode) while
using the `dejavu` strict mode, otherwise some code might fail silently.

This can happen because `dejavu` uses `Object.freeze` and `Object.seal` to lock
classes and instances, guaranteeing that no one changes the behaviour of your
classes by replacing methods, etc, and possibly breaking your code, making it
really hard to pin point what's wrong.

**Do not confuse 'use strict' with the dejavu strict mode.**


## Works on ##

* IE (6+?)
* Chrome (4+?)
* Safari (3+?)
* Firefox (3.6+?)
* Opera (9+?)
* Node.js and Rhino

Even though only modern JavaScript engines support some features, like
protected/private visibility through `Object.defineProperty`, `dejavu` provides
fallback mechanisms that enforce these restrictions.

Since the regular build is compatible with CommonJS modules, it works well with
[Node.js](http://nodejs.org/) and
[Rhino](https://developer.mozilla.org/en-US/docs/Rhino).



## Getting started ##

The quickest way to start using `dejavu` in your project, is by simply including
`dist/regular/strict/dejavu.js` (note that this is in __strict__ mode).

If you're developing a __client-side__ app, simply put the file in some folder,
and include it in the HTML:

```HTML
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <script type="text/javascript" src="dejavu.js"></script>
    </head>
    <body>
        <script type="text/javascript">
            'use strict';

            // declare the "Person" class
            var Person = dejavu.Class.declare({
                _name: null,

                initialize: function(name) {
                    this.setName(name);
                },

                setName: function(name) {
                    this._name = name;

                    return this;
                },

                getName: function() {
                    return this._name;
                }
            });

            // create a new instance of person
            var indigo = new Person("Marco");
            console.log("A new indigo was born,", indigo.getName());
        </script>
    </body>
</html>
```

If you're developing in __Node.js__, put `dejavu.js` somewhere, and require it:

```js
// in this case, dejavu.js is in the root folder of the project
var dejavu = require('./dejavu');

// declare the "Person" class
var Person = dejavu.Class.declare({
    _name: null,

    initialize: function(name) {
        this.setName(name);
    },

    setName: function(name) {
        this._name = name;

        return this;
    },

    getName: function() {
        return this._name;
    }
});

// create a new instance of person
var indigo = new Person("Marco");
console.log("A new indigo was born,", indigo.getName());
```

This will make a `dejavu` global available for you. Remember to replace it with
the _loose_ version before deploying. You can find it in
`dist/regular/loose/dejavu.js`.

Read further in order to check the syntax of `dejavu`, and also to check what
is exactly supported.



## Performance ##

Since all those nice features and common rules of classic OOP degrade
performance, `dejavu` has two separates modes, for different stages in the
development.

The `strict` mode is suitable for __development__, and will do all sorts of
checks, throwing an error when you try to do something considered illegal.

**Note that if your project works in strict mode, it will work in loose mode.**

As for the `loose` mode, there is no overhead associated with checks, thus
making it suitable for __production__, since it will be more efficient and
have a __lower memory footprint and filesize__.

Finally, in order to achieve that extra edge, that puts `dejavu` next to vanilla
JS in terms of performance, you should run the optimizer that is bundled with
the library. Note that this step is completely optional, and `dejavu` will still
perform faster than the other libraries in most browsers, even if you don't run
the optimizer. The optimizer will analyse your code, and make some improvements
boosting it a bit further.

You can check the benchmarks in [jsperf](http://jsperf.com/oop-benchmark/58)
comparing `dejavu` with other OOP libraries. Note that the loose regular version
is used in this test, simulating a production environment, and both the normal
and optimized versions are tested.



## Taking it to another level

If you're an [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) fan, and just
want to require specific parts of `dejavu`, you can do so.

Please note that this is only useful if you're developing something that
absolutely can't live with those extra bytes, and it will be at the expense of
having to keep closer attention to what you need exactly.

The AMD approach is usually more useful for your own code, since you don't have
to keep building your project into a monolithic file, after editing a single
line in one of the dozens of files that compose the project, thus speeding up
testing round-trips.

Still, if you really want to have a full-blown AMD set up, and by this you mean
having not only your code using an AMD philosophy, but also `dejavu` code, these
are the modules you can include:

* Interface
* AbstractClass
* Class
* FinalClass
* instanceOf

Here's an example requiring `dejavu` selectively, using an AMD approach:

```js
define([
    'path/to/Human',
    'path/to/TalkInterface',
    'path/to/dejavu/Class'
],
function (Human, TalkInterface, Class) {

    var Person = Class.declare({
        $extends: Human,
        $implements: [TalkInterface],

        /**
         * class constructor.
         */
        initialize: function (name) {
            // call super
            this.$super(name);

            // greet the universe
            this._say("Hi universe! I'm " + this.name);
        },

        _say: function (message) {
            // implementation
        },

    });

    return Person;
});
```

As you can see, in this case, only the `Class` module of `dejavu` is included,
which means all the other modules are not loaded.

You can find these modules in `dist/amd/strict`, for strict mode, and
`dist/amd/loose`, for loose mode.



## Syntax

### Interface definition ###

Object interfaces allow you to create code which specifies which methods a class must implement, without having to define how these methods are handled.
Below there's an example of an _EventsInterface_ that has the role of adding event listeners and fire events:

```js
define(['path/to/dejavu/Interface'], function (Interface) {

    var EventsInterface = Interface.declare({

        addListener: function (name, fn, context) {},

        removeListener: function (name, fn) {},

        fireEvent: function (name, args) {}
    });

    return EventsInterface;
});
```

Interfaces can extend multiple interfaces. They can also define static functions signature.
Be aware that all functions must obey its base signature (see explanation later in this document).

```js
define(['path/to/EventsInterface', 'path/to/dejavu/Interface'], function (EventsInterface, Interface) {

    var SomeEventsInterface = Interface.declare({
        $extends: EventsInterface,   // This interface extends EventsInterface
                                     // Interfaces can extend multiple ones, just reference them in an array

        $statics: {                  // This is how we define statics
            getTotalListeners: function () {}
        }

    });

    return SomeEventsInterface;
});
```
Alternatively, one can extend an interface with the extend() function. The equivalent code of the shown above is:

```js
define(['path/to/EventsInterface', 'path/to/dejavu/Interface'], function (EventsInterface, Interface) {

    var SomeEventsInterface = EventsInterface.extend(

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
    'path/to/dejavu/Class'
], function (EventsInterface, Class) {

    var EventsEmitter = Class.declare({
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
    'path/to/dejavu/AbstractClass'
],
function (EventsInterface, AbstractClass) {

    var AbstractEventsEmitter = AbstractClass.declare({
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
    'path/to/other/interface',
    'path/to/dejavu/AbstractClass'
],
function (SomeClass, SomeInterface, OtherInterface, AbstractClass) {

    var ComplexAbstractClass = AbstractClass.declare({
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

Alternatively, one can extend a concrete or abstract class with the extend() function. The equivalent code of the shown above is:

```js
define([
    'path/to/some/class',
    'path/to/some/interface',
    'path/to/other/interface',
    'path/to/dejavu/AbstractClass'
],
function (SomeClass, SomeInterface, OtherInterface, AbstractClass) {

    var ComplexAbstractClass = SomeClass.extend({
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
    'path/to/other/interface',
    'path/to/dejavu/Class'
],
function (SomeClass, OtherClass, SomeInterface, OtherInterface, Class) {

    var ConcreteClass = Class.declare({
        $extends: SomeClass,
        $implements: [SomeInterface, OtherInterface],
        $borrows: OtherClass,                           // We can add mixins by specifying them in here
                                                        // You can specify multiple mixins in an array

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
        }.$bound(),                                     // $bound() let you automatically bind the function to the instance
                                                        // Useful for handlers/callbacks

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

The $bound() function allows you to bind a function to the instance.
This is useful if certain functions are meant to be used as callbacks or handlers.
You don't need to bind the function manually, it will be bound for you automatically.

```js
define([
    'path/to/dejavu/Class'
],
function (Class) {

    var ConcreteClass = Class.declare({

        /**
         * Constructor.
         */
        initialize: function (element) {
            element.addEventListener('click', this._handleClick);
        },

        /**
         * Handles some click event.
         */
        handleClick: function () {
            // Handle click here
        }.$bound(),

    });
});
```

Alternatively, one can use anonymous functions and bind them to the instance to preserve the context as well as allowing private/protected methods invocations.

```js
define([
    'path/to/dejavu/Class'
],
function (Class) {

    var ConcreteClass = Class.declare({

        /**
         * Constructor.
         */
        initialize: function (element) {
            element.addEventListener('click', function () {
                console.log('caught click');
                this._doSomething();
            }.$bind(this));                                                    // Use the $bind

            element.addEventListener('keydown', this.$bind(function () {
                console.log('caught keydown');
                this._doSomething();                                           // Use the this.$bind (same behavior as above)
            });
        },

        /**
         * Some protected method
         */
        _doSomething: function () {
            // ..
        },

    });
});
```


### Constants ###

The $constants keyword allows you to defined constants.
If Object.defineProperty is available, any attempt to modify the constant value will throw an error (only in the strict version).
Constants can be defined in classes, abstract classes and interfaces.

```js
define(['path/to/dejavu/Class', function (Class) {

    var SomeClass = Class.declare({
        $constants: {
            FOO: 'bar'
            BAR: 'foo'
        },

        /**
         * Class constructor.
         */
        initialize: function () {
            this.$self.FOO;    // 'bar'
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
define(['path/to/dejavu/FinalClass', function (FinalClass) {

    var SomeClass = FinalClass.declare({    // This class cannot be extended

        /**
         * Class constructor.
         */
        initialize: function () {
            // ...
        }
    });

    return SomeClass;
});

define(['path/to/dejavu/Class', function (Class) {

    var SomeClass = Class.declare({

        /**
         * Class constructor.
         */
        initialize: function () {
            // ...
        },

        $finals: {                  // Classes that extend this one are not allowed to override the members below

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



### Signature check ###

All functions are virtual functions, therefore they can be overriden except if it's classified as final.
additionally, if a method is abstract, a subclass can only implement/override it if they obey their signature (must be equal or augmented with additional optional arguments).
Arguments prefixed with a $ are evaluated as optional. The signature check is done for all abstract functions (interface functions are also considered abstract).

```js
var SomeAbstractClass = AbstractClass.declare({
    $abstracts: {
        foo: function (param1) {}
    }
});

var SomeClass = Class.declare({
    $extends: SomeAbstractClass,

    foo: function (param1) {             // Signature is equal, it's valid
        // Do something here
    }
});

var ComplexClass = Class.declare({
    $extends: SomeClass,

    foo: function (param1, $param2) {    // Although it's signature is not equal, was augmented with an additional optional argument, so it's valid
        // Do something here
    }
});

var OtherComplexClass = Class.declare({
    $extends: SomeClass,

    foo: function (param1, param2) {     // Will throw an error because foo(param1) is not compatible with foo(param1, param2)
        // Do something here
    }
});
```


### Calling static methods within an instance ###

To call static methods inside an instance you can use $self and $static.
$self gives access to the class itself and $static gives access to the called class in a context of static inheritance.
$self is the same as using the class variable itself.

```js
var Example1 = Class.declare({
    foo: function (param1) {
        return this.$self.bar;    // same as Example1.bar;
    },
    $statics: {
        bar: 'hello'
    }
});

var Example2 = Class.declare({
    foo: function (param1) {
        return this.$static.bar;
    },
    $statics: {
        bar: 'hello'
    }
});

var Example3 = Class.declare({
    $extends: Example1
    $statics: {
        bar: 'bye'
    }
});

var Example4 = Class.declare({
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



### Notes ###

Please avoid using object constructors for strings, objects, booleans and numbers:

```js
var MyClass = Class.declare({
    foo: new String('bar'),  // Don't use this
    foz: 'bar'               // Ok
});
```



## Dependencies ##

dejavu depends on [amd-utils](https://github.com/millermedeiros/amd-utils).
If you use the regular build, you don't need to worry because all functions used from amd-utils are bundled for you.
If you use the AMD build, you must specify the path to amd-utils.
For example, if you use [RequireJS](http://requirejs.org/):

```js
    paths : {
        'amd-utils': '../vendor/amd-utils/src'
    },

    packages: ['dejavu', {
            location: '../../dist/amd/strict',
            name: 'dejavu'
        }
    ]
```



## Bulding dejavu ##

Please take a look at the [build](https://github.com/IndigoUnited/dejavu/tree/master/build) section.



## Testing dejavu ##

Please take a look at the [test](https://github.com/IndigoUnited/dejavu/tree/master/test) section.



## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).