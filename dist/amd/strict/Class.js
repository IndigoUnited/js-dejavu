/*jslint sloppy: true, forin: true, newcap:true*/
/*global define*/

define([
    'Utils/lang/isFunction',
    'Utils/lang/isString',
    'Utils/array/intersection',
    'Utils/array/unique',
    './common/verifyReserved',
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
    isFunction,
    isString,
    intersection,
    unique,
    verifyReserved,
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

        // Verify argument type
        if (!mixins.length && !isArray(sources)) {
            throw new TypeError('Borrows of "' + target.prototype.Name + '" must be a class/object or an array of classes/objects.');
        }
        // Verify duplicate entries
        if (mixins.length !== unique(mixins).length) {
            throw new Error('There are duplicate entries defined in Borrows of "' + target.prototype.Name + '".');
        }

        for (i = mixins.length - 1; i >= 0; i -= 1) {    // We don't use forEach here due to performance

            // Verify each mixin
            if ((!isFunction(mixins[i]) || !mixins[i].$class || mixins[i].$abstract) && (!isObject(mixins[i]) || mixins[i].$constructor)) {
                throw new TypeError('Entry at index ' + i + ' in Borrows of class "' + target.prototype.Name + '" is not a valid class/object (abstract classes and instances of classes are not supported).');
            }

            if (isObject(mixins[i])) {
                try {
                    current = Classify(mixIn({}, mixins[i])).prototype;
                } catch (e) {
                    // When an object is being used, throw a more friend message if an error occurs
                    throw new Error('Unable to define object as class at index ' + i + ' in Borrows of class "' + target.prototype.Name + '" (' + e.message + ').');
                }
            } else {
                current = mixins[i].prototype;
            }

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
     * Checks a target against a interfaces definition.
     *
     * @param {Array}  interfaces The array of interfaces
     * @param {Object} target     The target that will be checked
     */
    function checkInterfaces(interfaces, target) {

        var interf = toArray(interfaces),
            checkStatic = function (value) {
                if (!isFunction(target[value]) || !hasOwn(target, value)) {
                    throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + this.prototype.Name + '" correctly, static method "' + value + '()" was not found.');
                }
            };

        // Verify argument type
        if (!interf.length && !isArray(interfaces)) {
            throw new TypeError('Implements of class "' + target.prototype.Name + '" must be an interface or an array of interfaces.');
        }

        forEach(interfaces, function (curr, i) {

            var k;

            // Verify if it's a valid interface
            if (!isFunction(curr) || !curr.$interface) {
                throw new TypeError('Entry at index ' + i + ' in Implements of class "' + target.prototype.Name + '" is not a valid interface.');
            }

            // Check normal functions
            for (k in curr.prototype) {
                if (k !== 'Name' && k !== '$constructor') {   // Ignore reserved keywords
                    if (isFunction(curr.prototype[k]) && !isFunction(target.prototype[k])) {
                        throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + curr.prototype.Name + '" correctly, method "' + k + '()" was not found.');
                    }
                }
            }

            // Check static functions
            if (curr.$statics) {
                forEach(curr.$statics, checkStatic, curr);
            }
        });
    }

    /**
     * Checks a target against an abstract class.
     *
     * @param {Function} abstractClass The abstract class
     * @param {Object}   target        The target that will be check
     */
    function checkAbstract(abstractClass, target) {

        var abstracts = abstractClass.$abstract;

        // Check normal functions
        forEach(abstracts.normal, function (func) {
            if (!isFunction(target.prototype[func])) {
                throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + abstractClass.prototype.Name + '" correctly, method "' + func + '()" was not found.');
            }
        });

        // Check static functions
        forEach(abstracts.statics, function (func) {
            if (!isFunction(target[func]) || !hasOwn(target, func)) {
                throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + abstractClass.prototype.Name + '" correctly, static method "' + func + '()" was not found.');
            }
        });
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

            // Verify arguments type
            if (!binds.length && !isArray(constructor.prototype.Binds)) {
                throw new TypeError('Binds of "' + constructor.prototype.Name + '" must be a string or an array of strings.');
            }
            // Verify duplicate binds
            if (binds.length !== unique(binds).length) {
                throw new Error('There are duplicate binds in "' + constructor.prototype.Name + '".');
            }
            // Verify duplicate binds already proved in mixins
            if (intersection(constructor.$binds || [], binds).length > 0) {
                throw new Error('There are binds in "' + constructor.prototype.Name + '" that are already being bound by a mixin (used in Borrows).');
            }

            constructor.$binds = append(constructor.$binds || [], binds);
            delete constructor.prototype.Binds;
        }

        if (parent && parent.$binds) {

            // Verify duplicate binds already provided by the parent
            if (intersection(constructor.$binds || [], parent.$binds).length > 0) {
                throw new Error('There are binds in "' + constructor.prototype.Name + '" that are already being bound in the parent class.');
            }

            constructor.$binds = append(constructor.$binds || [], parent.$binds);
        } else if (constructor.$binds && !constructor.$binds.length) {
            delete constructor.$binds;
        }

        // Finnaly verify if all binds are strings and reference existent methods
        if (constructor.$binds) {

            forEach(constructor.$binds, function (value) {
                if (!isString(value)) {
                    throw new TypeError('All bind entries of "' + constructor.Name + '" must be a string.');
                }
                if (!isFunction(constructor.prototype[value]) && (!constructor.prototype.Abstracts || !constructor.prototype.Abstracts[value])) {
                    throw new ReferenceError('Method "' + value + '()" referenced in "' + constructor.prototype.Name + '" binds does not exist.');
                }
            });
        }
    }

    /**
     * Grabs the static methods from the constructor parent and itself and merges them.
     *
     * @param {Function} constructor The constructor
     */
    function grabStatics(constructor) {

        if (hasOwn(constructor.prototype, 'Statics')) {

            // Verify if statics is an object
            if (!isObject(constructor.prototype.Statics)) {
                throw new TypeError('Statics definition for "' + constructor.prototype.Name + '" must be an object.');
            }

            // Verify reserved words
            verifyReserved(constructor.prototype.Statics, 'statics');

            mixIn(constructor, constructor.prototype.Statics);
            constructor.$statics = keys(constructor.prototype.Statics);

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

            if (!this.$constructor.$abstract) {
                this.$initializing = true;    // Mark it in order to let abstract classes run their initialize
            }

            // Call initialize
            initialize.apply(this, arguments);

            if (!this.$constructor.$abstract) {
                delete this.$initializing;    // Remove previous mark
            }
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

        // Validate params as an object
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        // Give the class a default name
        params.Name = params.Name || 'Unnamed';

        // Verify reserved words
        verifyReserved(params);

        // Verify if the class has abstract methods but is not defined as abstract
        if (hasOwn(params, 'Abstracts') && !params.$abstract) {
            throw new Error('Class "' + params.Name + '" has abstract methods, therefore it must be defined as abstract.');
        }

        var classify,
            parent;

        if (hasOwn(params, 'Extends')) {
            // Verify if parent is a valid class
            if (!isFunction(params.Extends) || !params.Extends.$class) {
                throw new TypeError('Specified parent class in Extends of "' + params.Name + '" is not a valid class.');
            }

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
        classify.$class = true;

        // Grab static methods from the parent and itself
        grabStatics(classify);

        // Grab all the defined mixins
        if (hasOwn(params, 'Borrows')) {
            borrows(params.Borrows, classify);
            delete classify.prototype.Borrows;
        }

        // Grab binds from the parent and itself
        grabBinds(classify);

        // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent.$abstract && !params.$abstract) {
            checkAbstract(parent, classify);
        }

        // If the class implement some interfaces and is not abstract then verify if interfaces are well implemented
        if (hasOwn(params, 'Implements')) {
            if (!params.$abstract) {
                checkInterfaces(params.Implements, classify);
            }
            delete classify.prototype.Implements;
        }

        if (hasOwn(params, 'Statics')) {
            delete classify.prototype.Statics;  // If strict where enabled, we can delete statics only now
        }

        return classify;
    };

    return Classify;
});
