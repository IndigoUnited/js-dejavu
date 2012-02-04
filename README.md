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
* Each of those two builds have a version for development and a version for production

_NOTE_: Protected/private variables are not supported due to performance reasons.
        Instead, they are prefixed with a  _ and an __ respectively.

## Usage ##

All examples bellow are using the AMD format.

* Interface definition

Object interfaces allow you to create code which specifies which methods a class must implement, without having to define how these methods are handled.
Also they can define some constants.
Bellow there's an example of an EventsInterface, that has the role of adding event listeners and fire events.

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

 * Interface usage example

A class that implements an interface must define all the interface methods.
You define that a class must implement an interface by specifying it in the Implements keyword.
The Implements keyword can be an interface or an array of interfaces.
If a class does not implement all the interface methods, then a friendly error is thrown.
Bellow there is an example of an EventsEmitter class that implements the EventsInterface.

```js
define(['path/to/EventsInterface', 'path/to/classify/Class'], function (EventsInterface, Class) {

    var EventsEmitter = Class({

        Implements: EventsInterface   // The class must implement the EventInterface
                                      // You can force a class to implement multiple interfaces by specifying them in an array

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