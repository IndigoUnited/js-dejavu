/*jslint sloppy: true, forin: true, newcap:true*/
/*global define*/

define([
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/keys',
    'Utils/object/hasOwn',
    'Utils/array/forEach',
    'Utils/array/combine',
    'Utils/array/append',
    'Utils/lang/bind',
    'Utils/lang/toArray'
], function (
    isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    keys,
    hasOwn,
    forEach,
    combine,
    append,
    bind,
    toArray
) {

    var Classify;

    /**
     *  Merges source static methods if not defined in target.
     *
     *  @param {Function} source The source
     *  @param {Function} target The target
     */
    function mergeStatics(source, target) {

        if (source.$statics) {

            if (!target.$statics) {
                target.$statics = [];
            }

            forEach(source.$statics, function (value) {
                if (isUndefined(target[value])) {    // Already defined members are not overwritten
                    target[value] = source[value];
                    target.$statics.push(value);
                }
            });

            if (!target.$statics.length) {
                delete target.$statics;
            }
        }
    }

    /**
     * Borrows the properties and methods of various source objects to the target.
     *
     * @param {Array}  sources Array of objects that will give their methods
     * @param {Object} target  Target that will receive the methods
     */
    function borrows(sources, target) {

        var i,
            current,
            key,
            mixins;

        mixins = toArray(sources);

        for (i = mixins.length - 1; i >= 0; i -= 1) {    // We don't use forEach here due to performance

            current = isObject(mixins[i]) ? Classify(mixIn({}, mixins[i])).prototype : mixins[i].prototype;

            for (key in current) {
                if (isUndefined(target.prototype[key])) {    // Already defined members are not overwritten
                    target.prototype[key] = current[key];
                }
            }

            // Merge the statics
            mergeStatics(current.$constructor, target);

            // Merge the binds
            if (current.$constructor.$binds) {
                target.$binds = target.$binds || [];
                combine(target.$binds, current.$constructor.$binds);
            }
        }
    }

    /**
     * Fixes the context of given methods in the target.
     *
     * @param {Array}  fns     The array of functions to be bound
     * @param {Object} context The context that will be bound
     * @param {Object} target  The target class that will have these methods
     */
    function binds(fns, context, target) {

        var i;

        for (i = fns.length - 1; i >= 0; i -= 1) {    // We don't use forEach here due to performance
            target[fns[i]] = bind(target[fns[i]], context);
        }
    }

    /**
     * Grab all the binds from the constructor parent and itself and merges them for later use.
     *
     * @param {Function} constructor The constructor
     */
    function grabBinds(constructor) {

        var parent = constructor.Super ? constructor.Super.$constructor : null,
            binds;

        if (hasOwn(constructor.prototype, 'Binds')) {

            binds = toArray(constructor.prototype.Binds);

            constructor.$binds = append(constructor.$binds || [], binds);
            delete constructor.prototype.Binds;
        }

        if (parent && parent.$binds) {
            constructor.$binds = append(constructor.$binds || [], parent.$binds);
        } else if (constructor.$binds && !constructor.$binds.length) {
            delete constructor.$binds;
        }

    }

    /**
     * Grabs the static methods from the constructor parent and itself and merges them.
     *
     * @param {Function} constructor The constructor
     */
    function grabStatics(constructor) {

        if (hasOwn(constructor.prototype, 'Statics')) {

            mixIn(constructor, constructor.prototype.Statics);
            constructor.$statics = keys(constructor.prototype.Statics);

            delete constructor.prototype.Statics;  // If we got strict enabled, we can't delete the Statics yet (see bellow)
        }

        // Inherit statics from parent
        if (constructor.Super) {
            mergeStatics(constructor.Super.$constructor, constructor);
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
     * @param {Funciton} initialize The initialize function
     *
     * @return {Function} The constructor function
     */
    function constructor(initialize) {

        return function initializer() {

            // Reset some types of the object in order for each instance to have their variables
            reset(this);

            // Apply binds
            if (this.$constructor.$binds) {
                binds(this.$constructor.$binds, this, this);
            }

            // Call initialize
            initialize.apply(this, arguments);
        };
    }

    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    Classify = function (params) {

        delete params.Name;

        var classify,
            parent;

        if (hasOwn(params, 'Extends')) {
            parent = params.Extends;
            delete params.Extends;

            params.initialize = params.initialize || function () { parent.prototype.initialize.apply(this, arguments); };
            classify = constructor(params.initialize);
            classify.Super = parent.prototype;
            classify.prototype = createObject(parent.prototype, params);
        } else {
            params.initialize = params.initialize || function () {};
            classify = constructor(params.initialize);
            classify.prototype = params;
        }

        classify.prototype.$constructor = classify;

        // Grab static methods from the parent and itself
        grabStatics(classify);

        // Grab all the defined mixins
        if (hasOwn(params, 'Borrows')) {
            borrows(params.Borrows, classify);
            delete classify.prototype.Borrows;
        }

        // Grab binds from the parent and itself
        grabBinds(classify);

        // If the class implement some interfaces and is not abstract then verify if interfaces are well implemented
        if (hasOwn(params, 'Implements')) {
            delete classify.prototype.Implements;
        }

        return classify;
    };

    return Classify;
});
