/*jslint browser:true, devel:true, nomen:true*/
/*globals define*/

/**
 * EventsEmitter abstract class.
 *
 * This class is declared as abstract because it does not work on its own.
 * Instead it should be mixed in to provide pub/sub mechanism to any class.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define(['amd/strict/AbstractClass', 'amd-utils/lang/toArray'], function (AbstractClass, toArray) {

    'use strict';

    var EventsEmitter = {
        $name: 'EventsEmitter',

        __events: {},

        // public methods

        /**
         * Adds a new event listener.
         * If the listener is already attached, it won't get duplicated.
         *
         * @param {String}   name      The event name
         * @param {Function} fn        The function
         * @param {Object}   [context] The context in which the function will be executed
         *
         * @return {mixed} The instance itself to allow chaining
         */
        addListener: function (name, fn, context) {
            var events = this.__events[name] = this.__events[name] || [];

            if (this.__getListenerIndex(name, fn) === -1) {
                events.push({ fn: fn, context: context });
            }

            return this;
        },

        /**
         * Removes an existent event listener.
         *
         * @param {String}   name The event name
         * @param {Function} fn   The function
         *
         * @return {mixed} The instance itself to allow chaining
         */
        removeListener: function (name, fn) {
            var index = this.__getListenerIndex(name, fn);

            if (index !== -1) {
                this.__events[name].splice(index, 1);
                if (!this.__events[name].length) {
                    delete this.__events[name];
                }
            }

            return this;
        },

        /**
         * Removes all listeners of the given name.
         * If no type is specified, removes all events of all names.
         *
         * @param {String} [name] The event name
         *
         * @return {mixed} The instance itself to allow chaining
         */
        removeListeners: function (name) {
            if (name) {
                delete this.__events[name];
            } else {
                this.__events = {};
            }

            return this;
        },

        // protected methods

        /**
         * Fires an event.
         *
         * @param {String}   name The event name
         * @param {...mixed} args The arguments to pass to each listener
         *
         * @return {mixed} The instance itself to allow chaining
         */
        _fireEvent: function (name, args) {
            var events = this.__events[name],
                params = toArray(arguments),
                x;

            params.shift();

            if (events) {
                for (x = 0; x < events.length; x += 1) {
                    events[x].fn.apply(events[x].context || this, params);
                }
            }

            return this;
        },

        // private methods

        /**
         * Gets a listener index.
         *
         * @param {String}   name The event name
         * @param {Function} fn   The function
         *
         * @return {Number} The index of the listener if found or -1 if not found
         */
        __getListenerIndex: function (name, fn) {
            var events = this.__events[name],
                x;

            if (events) {
                for (x = events.length - 1; x >= 0; x -= 1) {
                    if (events[x].fn === fn) {
                        return x;
                    }
                }
            }

            return -1;
        }
    };

    return AbstractClass.declare(EventsEmitter);
});
