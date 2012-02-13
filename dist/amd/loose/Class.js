/*jslint sloppy:true forin:true newcap:true*/
/*global define*/

define([
    'Utils/lang/isFunction',
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/hasOwn',
    'Utils/object/forOwn',
    'Utils/array/combine',
    'Utils/array/append',
    'Utils/array/insert',
    'Utils/array/compact',
    'Utils/lang/bind',
    'Utils/lang/toArray'
], function (
    isFunction,
    isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    hasOwn,
    forOwn,
    combine,
    append,
    insert,
    compact,
    bind,
    toArray
) {

    var Class;

    /**
     * Parse borrows (mixins).
     *
     * @param {Function} constructor The constructor
     */
    function parseBorrows(constructor) {

        if (hasOwn(constructor.prototype, 'Borrows')) {

            var current,
                k,
                key,
                mixins = toArray(constructor.prototype.Borrows),
                i = mixins.length,
                grabMethods = function (value, key) {
                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        constructor.prototype[key] = value;
                    }
                };

            for (i -= 1; i >= 0; i -= 1) {

                current = isObject(mixins[i]) ? Class(mixIn({}, mixins[i])).prototype : mixins[i].prototype;

                // Grab mixin methods
                forOwn(current, grabMethods);

                // Grab mixin static methods
                for (k = current.$constructor.$class.staticMethods.length - 1; k >= 0; k -= 1) {
                    key = current.$constructor.$class.staticMethods[k];
                    if (isUndefined(constructor[key])) {    // Already defined members are not overwritten
                        insert(constructor.$class.staticMethods, key);
                        constructor[key] = current.$constructor[key];
                    }
                }

                // Grab mixin static properties
                for (k = current.$constructor.$class.staticProperties.length - 1; k >= 0; k -= 1) {
                    key = current.$constructor.$class.staticProperties[k];
                    if (isUndefined(constructor[key])) {    // Already defined members are not overwritten
                        insert(constructor.$class.staticProperties, key);
                        constructor[key] = current.$constructor[key];
                    }
                }

                // Merge the binds
                combine(constructor.$class.binds, current.$constructor.$class.binds);
            }

            delete constructor.prototype.Borrows;
        }
    }

    /**
     * Applies the context of given methods in the target.
     *
     * @param {Array}  fns     The array of functions to be bound
     * @param {Object} context The context that will be bound
     * @param {Object} target  The target class that will have these methods
     */
    function applyBinds(fns, context, target) {

        var i;

        for (i = fns.length - 1; i >= 0; i -= 1) {
            target[fns[i]] = bind(target[fns[i]], context);
        }
    }

    /**
     * Handle class interfaces.
     *
     * @param {Array}  interfs The array of interfaces
     * @param {Object} target  The target that will be checked
     */
    function handleInterfaces(interfs, target) {

        var interfaces = toArray(interfs),
            x = interfaces.length;

        for (x -= 1; x >= 0; x -= 1) {
            target.$class.interfaces.push(interfaces[x]);
        }
    }

    /**
     * Parse binds.
     *
     * @param {Function} constructor The constructor
     */
    function parseBinds(constructor) {

        if (hasOwn(constructor.prototype, 'Binds')) {
            var binds = toArray(constructor.prototype.Binds);

            combine(constructor.$class.binds, binds);
            delete constructor.prototype.Binds;
        }
    }

    /**
     * Parse all the methods, including static ones.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function parseMethods(params, constructor) {

        // Parse static methods
        if (hasOwn(params, 'Statics')) {

            forOwn(params.Statics, function (value, key) {
                insert(isFunction(value) && !value.$class && !value.$interface ? constructor.$class.staticMethods : constructor.$class.staticProperties, key);
                constructor[key] = value;
            });

            delete constructor.prototype.Statics;
        }
    }

    /**
     * Reset some properties in order to make them unique for the instance.
     * This solves the shared properties for types like objects or arrays.
     *
     * @param {Object} object The instance
     */
    function reset(object) {

        var key;

        for (key in object) {
            if (isArray(object[key])) {    // If is array, clone it
                object[key] = [].concat(object[key]);
            } else if (isObject(object[key])) {    // If is an object, clone it
                object[key] = mixIn({}, object[key]);
            }
        }
    }

    /**
     * Builds the constructor function that calls the initialize and do
     * more things internally.
     *
     * @param {Function} initialize The initialize function
     *
     * @return {Function} The constructor function
     */
    function createConstructor(initialize) {

        var Instance = function () {

            // Reset some types of the object in order for each instance to have their variables
            reset(this);

            // Apply binds
            if (this.$constructor.$class.binds) {
                applyBinds(this.$constructor.$class.binds, this, this);
            }

            // Call initialize
            initialize.apply(this, arguments);
        };

        return Instance;
    }

    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    Class = function Class(params) {

        var classify,
            parent,
            $class = { staticMethods: [], staticProperties: [], interfaces: [], binds: [] },
            k;

        if (hasOwn(params, 'Extends')) {
            parent = params.Extends;
            delete params.Extends;

            params.initialize = params.initialize || function () { parent.prototype.initialize.apply(this, arguments); };
            classify = createConstructor(params.initialize, params.Name);
            classify.Super = parent.prototype;
            classify.prototype = createObject(parent.prototype, params);

            // Grab all the methods, static methods, static properties, binds and interfaces metadata from the parent
            append($class.staticMethods, parent.$class.staticMethods);
            append($class.staticProperties, parent.$class.staticProperties);
            append($class.binds, parent.$class.binds);
            append($class.interfaces, parent.$class.interfaces);

            // Inherit static methods
            for (k =  parent.$class.staticMethods.length - 1; k >= 0; k -= 1) {
                classify[parent.$class.staticMethods[k]] = parent[parent.$class.staticMethods[k]];
            }
        } else {
            params.initialize = params.initialize || function () {};
            classify = createConstructor(params.initialize, params.Name);
            classify.prototype = params;
        }

        delete classify.prototype.Name;

        classify.prototype.$constructor = classify;
        classify.$class = $class;

        // Parse methods
        parseMethods(params, classify);

        // Parse mixins
        parseBorrows(classify);

        // Parse binds
        parseBinds(classify);

        // Handle interfaces
        if (hasOwn(params, 'Implements')) {
            handleInterfaces(params.Implements, classify);
            delete classify.prototype.Implements;
        }

        return classify;
    };

    return Class;
});
