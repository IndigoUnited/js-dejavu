# Classify, a set of object-oriented tools for JavaScript #

---

Prototypal inheritance is powerful and flexible, yet difficult to understand and to use on large projects.
Classify is a library that delivers classic inheritance on top of JavaScript prototypal inheritance.


## Why another? ##

There are some libraries around that are able to shim classical inheritance, though none of them offered all the functionality that I was looking for.
Besides that, I was looking for something fast on top of [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD).



## Features ##

* Basic classical inheritance
  - Definition of static members as well as their inheritance is supported
* Abstract classes
* Interfaces
* Mixins (so you can get some sort of multiple inheritance)
* Context binding for functions (useful for functions that will be used as callbacks/handlers)
* Has two builds, one regular and one AMD based



## Performance ##

All kind of validations to ensure that your classes are well defined and obey all the common rules of classic inheritance degrade performance.
Thats why there is a __strict__ and a __loose__ version for each build.
The strict version throws an error when something is not right and therefore is suitable for development.
The loose build has no overhead associated with verifications and therefore is suitable for production.
If your classes schema work in the strict version then is safe to use them in the loose version.

Also, there is no super() or parent() inside your functions. In order to do that, a wrapper must be created for each function, degrading performance.
Instead, we provide an alternative syntax that performs much better (see usage bellow).

## Known limitations ##

* Protected/private members are not yet supported, instead they should prefixed with an _ and an __ respectively.
Private and protected functions could be made by creating wrappers around them.
Still, there is no crossbrowser way to define private and protected variables.
Those will be implemented soon using the [Object.defineProperty](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty) in the strict version only in environments that implement it.
* There is no support for constants, in the sense that once defined they cannot be overwritten.
Those will probably won't be implemented. If anyone is willing to take an effort to do so, please make a pull request.
* Interfaces does not validate the function arguments yet. It will be implemented soon.

Stay tuned!

## Usage ##

All examples bellow use the AMD format.



### Interface definition ###

Object interfaces allow you to create code which specifies which methods a class must implement, without having to define how these methods are handled.
Bellow there's an example of an _EventsInterface_, that has the role of adding event listeners and fire events:

```js
define(['path/to/classify/Interface'], function (Interface) {

    var EventsInterface = Interface({

        /**
         * Add a listener for a given event.
         *
         * @param {String}   name    The event name
         * @param {Function} fn      The listener
         * @param {Object}   context The context
         */
        'addListener': function (name, fn, context) {},

        /**
         * Remove a previously added listener.
         *
         * @param {String}   name The event name
         * @param {Function} fn   The listener
         */
        'removeListener': function (name, fn) {},

        /**
         * Fire an event, executing each of the attached listeners.
         *
         * @param {String} name The event name
         * @param {Array}  args The arguments to be passed to the listeners
         */
        'fireEvent': function (name, args) {}

    });

    return EventsInterface;
});
```

Interfaces can extend other interfaces. They can also define static properties and functions signature.

```js
define(['path/to/EventsInterface', 'path/to/classify/Interface'], function (Interface) {

    var SomeEventsInteface = Interface({

        Extends: EventsInterface,   // This interface extends EventInterface

        Statics: {    // This is how we define static members

            Some: 'static property',

            /**
             * Return the total number of listeners.
             *
             * @return {Number} The number of listeners.
             */
            getTotalListeners: function () {}
        }
        
    });

    return SomeEventsInterface;
});
```



### Interface usage example ###

A class that implements an interface must define all the interface methods.
You define that a class implements an interface by specifying it in the Implements keyword.
The Implements keyword can be an interface or an array of interfaces.
If a class does not implement all the interface(s) methods, then a friendly error is thrown.
Following our previous example we can define a concrete class - _EventsEmitter_ - that implements the _EventsInterface_ interface.

```js
define(['path/to/EventsInterface', 'path/to/classify/Class'], function (EventsInterface, Class) {

    var EventsEmitter = Class({

        Implements: EventsInterface,   // The class must implement the EventsInterface interface
                                       // You can specify multiple interfaces in an array

        /**
         * @inheritDoc
         */
        'addListener': function (name, fn, context) {
            // Implementation goes here
        },

        /**
         * @inheritDoc
         */
        'removeListener': function (name, fn) {
            // Implementation goes here
        },

        /**
         * @inheritDoc
         */
        'fireEvent': function (name, args) {
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
define(['path/to/EventsInterface', 'path/to/classify/AbstractClass'], function (EventsInterface, AbstractClass) {

    var AbstractEventsEmitter = Class({

        Implements: EventsInterface,   // The class must implement the EventsInterface

        /**
         * @inheritDoc
         */
        'addListener': function (name, fn, context) {
            // Implementation goes here
        },

        /**
         * @inheritDoc
         */
        'removeListener': function (name, fn) {
            // Implementation goes here
        },

        // fireEvent() is not implemented, therefore is automatically declared as abstract

        Abstracts: {    // This how we defined abstract methods
            
            /**
             * Removes all previously added listeners.
             */
            'removeAll': function () {},
            
            Statics: {   // We can also define abstract static methods

                /**
                 * Return the total number of listeners.
                 *
                 * @return {Number} The number of listeners.
                 */
                getTotalListeners: function () {}
            }
        }
    });

    return AbstractEventsEmitter;
});
```

Abstract classes can extend other abstract classes or concrete classes while implementing other interfaces:

```js
define([
    'path/to/some/class',
    'path/to/some/interface',
    'path/to/other/interfaces,
    'path/to/classify/AbstractClass'
],
function (SomeClass, SomeInterface, OtherInterface, AbstractClass) {
    
    var ComplexAbstractClass = AbstractClass({
        
        Extends: SomeClass,
        Implements: [SomeInterface, OtherInterface],

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
function (SomeClass, OtherClass, SomeInterface, OtherInterface, AbstractClass) {

    var ConcreteClass = AbstractClass({
        
        Extends: SomeClass,
        Implements: [SomeInterface, OtherInterface],
        Borrows: OtherClass                             // We can add mixins by specifying them in here
                                                        // You can specify multiple mixins in an array

        Binds: 'handleClick',                           // Binds let you automatically bind the function to the instance
                                                        // Useful for handlers/callbacks
                                                        // You can specify multiple Binds in an array

        // Some handler
        'handleClick': function () {
            // Handle click here
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
});

```



### Mixins ###

A mixin is a class or object that provides a certain functionality to be reused by other classes.
Mixins can be used like specified in the example above.
If clashes occur with multiple mixins, that last one takes precedence.



### Binds ###

The binds keyword allows you to specify functions that should be bound to the instance.
This is useful if certain functions are meant to be used as callbacks or handlers.
You don't need to bind the function manually, it will be bound for you automatically.

## Bulding Classify ##

Please take a look at the [build](https://github.com/TrinityJS/Classify/tree/master/build) section.

## Testing Classify ##

Please take a look at the [test](https://github.com/TrinityJS/Classify/tree/master/test) section.

## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
