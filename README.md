# dejavu #

---

[![Build Status](https://secure.travis-ci.org/IndigoUnited/dejavu.png)](http://travis-ci.org/IndigoUnited/dejavu)

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
Also, even though being one of the most feature rich OOP libraries out there, it has one of the best performances, rivaling with vanilla JS in production.



## Features ##

* Concrete classes
* Abstract classes
* Interfaces
* Mixins (so you can get some sort of multiple inheritance)
* Private and protected members
* Static members
* Constants
* Ability to declare true singletons via protected/private constructors
* Context binding for functions
* Method signature checks
* Possible to extend or borrow from vanilla classes
* Custom instanceOf with support for Interfaces
* Classes and instances are locked by default
    * Functions cannot be added, replaced or deleted
    * Properties can only be modified
* Two builds, `regular` and `AMD` based
    * `AMD` optimized for speeding up developer workflow, allowing testing
      without the need to re-compile everything into a single file
    * `regular` if you are not using `AMD` in your projects
* Two modes for each build, `strict` and `loose`
    * `strict` best in development, enforcing a lot of checks, making sure you
      don't make many typical mistakes
    * `loose` best for production, without checks, improving performance

Users are encouraged to declare
['use strict'](https://developer.mozilla.org/en/JavaScript/Strict_mode) while
using the `dejavu` in strict mode, otherwise some code might fail silently.
This can happen because `dejavu` uses `Object.freeze` and `Object.seal` to lock
classes and instances, guaranteeing that no one changes the behaviour of your
classes by replacing methods, etc, and possibly breaking your code, making it
really hard to pin point what's wrong. Altough this is the default behavior, it can be changed.
You will read more on it later in this document.

**Do not confuse 'use strict' with the dejavu strict mode.**



## Works on ##

* IE (6+)
* Chrome (4+)
* Safari (3+)
* Firefox (3.6+)
* Opera (9+)
* Node.js and Rhino



## Getting started ##

The quickest way to start using `dejavu` in your project, is by simply including
`dist/regular/strict/dejavu.js` (note that this is in __strict__ mode).

If you're developing a __client-side__ app, simply put the file in some folder,
and include it in the HTML:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <script type="text/javascript" src="dejavu.js"></script>
    </head>
    <body>
        <script type="text/javascript">
            'use strict';

            // Declare the "Person" class
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

            // Create a new instance of person
            var indigo = new Person('Marco');
            console.log('A new indigo was born,', indigo.getName());
        </script>
    </body>
</html>
```

This will make a `dejavu` global available for you.
If you're developing in __Node.js__, install it with `npm install dejavu` and use it like so:

```js
var dejavu = require('dejavu');

// Declare the "Person" class
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

// Create a new instance of person
var indigo = new Person("Marco");
console.log("A new indigo was born,", indigo.getName());
```

In node, the default mode running will be the strict mode unless the STRICT environmen
 variable is set to false.
Environment variables can be changed system wide or per process like so:

```js
process.env.STRICT = false;
```



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
comparing `dejavu` with other OOP libraries. Note that the loose mode
is used in this test, simulating a production environment, and both the normal
and optimized versions are tested.



## Taking it to another level


Front-end devs are encouraged to program using the AMD paradigm because of its obvious benefits.
Since dejavu is built upon it, it will integrate seamlessly with your AMD loader.
The easy way to set it up is to define a path for dejavu in your loader config like so:

```js
{
   // Your loader config
   paths: {
       'dejavu': '/path/to/dejavu/dist/strict/main'     // You can switch to the loose mode anytime
   }
}
```

Then require it and use it:

```js
define(['dejavu'], function (dejavu) {

    // The dejavu variable is an object that contains:
    // Class
    // FinalClass
    // AbstractClass
    // Interface
    // instanceOf
    // options

    // Example usage
    var MyClass = dejavu.Class.declare({
        initialize: function () {
            // ...
        }
    });

    return MyClass;
});
```

If you just want to require specific parts of `dejavu`, you can do so.
In order to achieve this, you must configure your loader like so:

```js
{
    // Your loader config
    packages: [
        {
            name: 'dejavu',
            location: '/path/to/dejavu/dist/strict'     // You can switch to the loose mode anytime
        }
    ]
}
```

With this setup, you can still require the dejavu object like shown above or require specific parts of it:

```js
define(['dejavu/Class'], function (Class) {

    // Example usage
    var MyClass = dejavu.Class.declare({
        initialize: function () {
            // ...
        }
    });

    return MyClass;
});
```

As you can see, in this case, only the `Class` module of `dejavu` is included,
which means all the other modules are not loaded.



## Syntax

### Interface definition ###

Object interfaces allow you to create code which specifies which methods a class must implement, without having to define how these methods are handled.
Below there's an example of an _EventsInterface_ that has the role of adding event listeners and fire events:

```js
define(['dejavu/Interface'], function (Interface) {

    'use strict';

    var EventsInterface = Interface.declare({
        $name: 'EventsInterface',                       // Will make easier to debug mistakes (optional)

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
define(['path/to/EventsInterface', 'dejavu/Interface'], function (EventsInterface, Interface) {

    'use strict';

    var SomeEventsInterface = Interface.declare({
        $name: 'SomeEventsInterface',
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
define(['path/to/EventsInterface', 'dejavu/Interface'], function (EventsInterface, Interface) {

    'use strict';

    var SomeEventsInterface = EventsInterface.extend({
        $name: 'SomeEventsInterface',

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
    'dejavu/Class'
], function (EventsInterface, Class) {

    'use strict';

    var EventsEmitter = Class.declare({
        $name: 'EventsEmitter',
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
    'dejavu/AbstractClass'
],
function (EventsInterface, AbstractClass) {

    'use strict';

    var AbstractEventsEmitter = AbstractClass.declare({
        $name: 'AbstractEventsEmitter',
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
    'dejavu/AbstractClass'
],
function (SomeClass, SomeInterface, OtherInterface, AbstractClass) {

    'use strict';

    var ComplexAbstractClass = AbstractClass.declare({
        $name: 'ComplexAbstractClass',
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
    'dejavu/AbstractClass'
],
function (SomeClass, SomeInterface, OtherInterface, AbstractClass) {

    'use strict';

    var ComplexAbstractClass = SomeClass.extend({
        $name: 'ComplexAbstractClass',
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
    'dejavu/Class'
],
function (SomeClass, OtherClass, SomeInterface, OtherInterface, Class) {

    'use strict';

    var ConcreteClass = Class.declare({
        $name: 'ConcreteClass',
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

The $bind() function allows you to bind a anonymous functions to the instance to preserve the context as well as allowing private/protected methods invocations.

```js
define([
    'dejavu/Class'
],
function (Class) {

    'use strict';

    var ConcreteClass = Class.declare({
        $name: 'ConcreteClass',

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
        }
    });
});
```
Alternatively, the $bound() function allows you to bind a class function to the instance.
This is useful if certain functions are meant to be used as callbacks or handlers.
You don't need to bind the function manually, it will be bound for you automatically.

```js
define([
    'dejavu/Class'
],
function (Class) {

    'use strict';

    var ConcreteClass = Class.declare({
        $name: 'ConcreteClass',

        /**
         * Constructor.
         */
        initialize: function (element) {
            element.addEventListener('click', this._handleClick);
        },

        /**
         * Handles some click event.
         */
        _handleClick: function () {
            // Handle click here
        }.$bound()
    });
});
```

### Constants ###

The $constants keyword allows you to defined constants.
If Object.defineProperty is available, any attempt to modify the constant value will throw an error (only in the strict mode).
Constants can be defined in classes, abstract classes and interfaces.

```js
define(['dejavu/Class', function (Class) {

    'use strict';

    var SomeClass = Class.declare({
        $name: 'SomeClass',

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
define(['dejavu/FinalClass', function (FinalClass) {

    'use strict';

    var SomeClass = FinalClass.declare({    // This class cannot be extended
        $name: 'SomeClass',

        /**
         * Class constructor.
         */
        initialize: function () {
            // ...
        }
    });

    return SomeClass;
});

define(['dejavu/Class', function (Class) {

    'use strict';

    var SomeClass = Class.declare({
        $name: 'SomeClass',

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
If Object.defineProperty is available, it will be used to manage their access (only in the strict mode).



### Signature check ###

All functions are virtual functions, therefore they can be overriden except if they are classified as final.
Additionally, if a method is abstract, a subclass can only implement/override it if they obey their signature (must be equal or augmented with additional optional arguments).
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



###  Classes/instances are locked ###

By default, constructors and instances are locked. This means that no one can monkey patch your code.
This behaviour can be changed in two ways:

#### With the $locked flag:

```js
var MyUnlockedClass = Class.declare({
    $name: 'MyUnlockedClass',
    $locked: false

    initialize: function () {
        this.foo = 'bar';           // Altough the foo property is not declared,
                                    // it will not throw an error
    },

    run: function () {
        console.log('run!');
    }
});

MyUnlockedClass.prototype.run = function () {   // Methods can be replaced in the prototype
    console.log('im running!');
};

var myUnlockedInstance = new MyUnlockedClass();
myUnlockedInstance.undeclaredProperty = 'foo'   // Properties can be added to the instance
myUnlockedInstance.run = function () {          // Methods can be replaced in the instance
    console.log('im running naked!');
};
```

#### By setting the global option:

This will change the default behaviour, but classes can still override it with the $locked flag.

```
dejavu.options.locked = false;
```

Note that once a class is unlocked, its subclasses cannot be locked.
Also, although undeclared members are allowed, they will not have their access controlled (they are interpreted as public).
### Notes ###

Please avoid using object constructors for strings, objects, booleans and numbers:

```js
var MyClass = Class.declare({
    foo: new String('bar'),  // Don't use this
    foz: 'bar'               // Ok
});
```



## Optimizer ##

dejavu bundles an optimizer that makes your code faster and lighter.
It specifically:

* Improves $super and $self usage
* Removes all $name and $locked properties because they are not used in the loose version
* Removes the need for wrappers, improving performance by a great margin
* Removes abstract functions from abstract classes
* Removes functions from interfaces
* Replaces $bind() with native bind()

The optimizer is located in the `bin` folder.
Example usage:

`node optimizer < file_in.js > file_out.js`

dejavu also comes with a grunt task.
Bellow is a sample usage copied from a grunt file:

```js
grunt.loadNpmTasks('dejavu');

grunt.initConfig({
    dejavu: {
        optimize: {
            options: {
                exclude: [/bootstrap(\.min)?\.js$/]
            },
            files: {
                'dist/': 'src/**/*.js'
            }
        }
    }
});
```

## Dependencies ##

dejavu depends on [amd-utils](https://github.com/millermedeiros/amd-utils).
If you use the regular build, you don't need to worry because all functions used from amd-utils are bundled for you.
If you use it on node, npm will take care of getting the dependencies for you.
If you use the AMD build, you must specify the path to amd-utils.
For example, if you use [RequireJS](http://requirejs.org/):

```js
    paths : {
        'amd-utils': '../vendor/amd-utils/src'
    },

    packages: [
        {
            name: 'dejavu'
            location: '../../dist/amd/strict',
        }
    ]
```



## Building dejavu ##

Simply run `npm install` to install all the tools needed.
Then just run `npm run-script build` or `node build`.


## Testing dejavu ##

Please take a look at the [test](https://github.com/IndigoUnited/dejavu/tree/master/test) section.



## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).