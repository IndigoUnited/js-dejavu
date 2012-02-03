/*jslint sloppy: true, forin: true, newcap:true*/
/*global define*/

/**
 * Classify - Sugar syntax for Prototypal Inheritance
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 * @version 1.0.0
 *
 * @example
 *
 *      var MyClass = Classify({
 *          Implements: [SomeInterface, OtherInterface],
 *          Extends: ParentClass,
 *          Borrows: [SomeMixin, OtherMixin],
 *          Binds: ['method1', 'method2'],
 *          Statics: {
 *              staticMethod1: function () {},
 *              staticMethod2: function () {},
 *              staticMethod3: function () {},
 *          },
 *          initialize: function () {
 *              MyClass.Super.initialize.call(this);
 *          },
 *          method1: function () {},
 *          method2: function () {},
 *          method3: function () {}
 *      });
 */
define('Trinity/Classify', [
    //>>includeStart('checks', pragmas.checks);
    'Utils/lang/isFunction',
    'Utils/lang/isString',
    'Utils/array/intersection',
    'Utils/array/unique',
    './common/verifyReserved',
    //>>includeEnd('checks');
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
    'Utils/lang/toArray',
    './Classify.Abstract',
    './Classify.Interface'
], function (
    //>>includeStart('checks', pragmas.checks);
    isFunction,
    isString,
    intersection,
    unique,
    verifyReserved,
    //>>includeEnd('checks');
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
    toArray,
    Abstract,
    Interface
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

        //>>includeStart('checks', pragmas.checks);
        // Verify argument type
        if (!mixins.length && !isArray(sources)) {
            throw new TypeError('Borrows of "' + target.prototype.Name + '" must be a class/object or an array of classes/objects.');
        }
        // Verify duplicate entries
        if (mixins.length !== unique(mixins).length) {
            throw new Error('There are duplicate entries defined in Borrows of "' + target.prototype.Name + '".');
        }
        //>>includeEnd('checks');

        for (i = mixins.length - 1; i >= 0; i -= 1) {    // We don't use forEach here due to performance

            //>>includeStart('checks', pragmas.checks);
            // Verify each mixin
            if ((!isFunction(mixins[i]) || !mixins[i].$class || mixins[i].$abstract) && (!isObject(mixins[i]) || mixins[i].$constructor)) {
                throw new TypeError('Entry at index ' + i + ' in Borrows of class "' + target.prototype.Name + '" is not a valid class/object (abstract classes and instances of classes are not supported).');
            }
            //>>includeEnd('checks');

            // Do the mixin manually because we need to ignore already defined methods and handle statics
            //>>includeStart('checks', pragmas.checks);
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
            //>>includeEnd('checks');
            //>>excludeStart('checks', pragmas.checks);
            current = isObject(mixins[i]) ? Classify(mixIn({}, mixins[i])).prototype : mixins[i].prototype;
            //>>excludeEnd('checks');

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
    //>>includeStart('checks', pragmas.checks);

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
    //>>includeEnd('checks');

    /**
     * Grab all the bound from the constructor parent and itself and merges them for later use.
     *
     * @param {Function} constructor The constructor
     */
    function grabBinds(constructor) {

        var parent = constructor.Super ? constructor.Super.$constructor : null,
            binds = toArray(constructor.prototype.Binds);

        //>>includeStart('checks', pragmas.checks);
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
        //>>includeEnd('checks');

        if (!constructor.$binds) {
            constructor.$binds = binds;
        } else {
            append(constructor.$binds, binds);
        }

        if (parent && parent.$binds) {

            //>>includeStart('checks', pragmas.checks);
            // Verify duplicate binds already provided by the parent
            if (intersection(constructor.$binds, parent.$binds).length > 0) {
                throw new Error('There are binds in "' + constructor.prototype.Name + '" that are already being bound in the parent class.');
            }
            //>>includeEnd('checks');

            append(constructor.$binds, parent.$binds);
        } else if (!constructor.$binds.length) {
            delete constructor.$binds;
        }

        //>>includeStart('checks', pragmas.checks);
        // Finnaly verify if all binds are strings and reference existent methods
        if (constructor.$binds) {
            forEach(constructor.$binds, function (value) {
                if (!isString(value)) {
                    throw new TypeError('All bind entries of "' + constructor.Name + '" must be a string.');
                }
                if (!isFunction(constructor.prototype[value])) {
                    throw new Error('Method "' + value + '()" referenced in "' + constructor.Name + '" binds does not exist.');
                }
            });
        }
        //>>includeEnd('checks');
    }

    /**
     * Grabs the static methods from the constructor parent and itself and merges them.
     *
     * @param {Function} constructor The constructor
     */
    function grabStatics(constructor) {

        // TODO: Shall we improve this function due to performance?
        if (hasOwn(constructor.prototype, 'Statics')) {

            //>>includeStart('checks', pragmas.checks);
            // Verify if statics is an object
            if (!isObject(constructor.prototype.Statics)) {
                throw new TypeError('Statics definition for "' + constructor.prototype.Name + '" must be an object.');
            }

            // Verify reserved words
            verifyReserved(constructor.prototype.Statics, 'statics');
            //>>includeEnd('checks');

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

            //>>includeStart('checks', pragmas.checks);
            // Call initialize
            if (!this.$constructor.$abstract) {
                this.$initializing = true;
            }
            //>>includeEnd('checks');

            initialize.apply(this, arguments);

            //>>includeStart('checks', pragmas.checks);
            delete this.$initializing;
            //>>includeEnd('checks');
        };
    }

    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @returns {Function} The constructor
     */
    Classify = function (params) {

        //>>includeStart('checks', pragmas.checks);
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
        //>>includeEnd('checks');

        //>>excludeStart('checks', pragmas.checks);
        delete params.Name;
        //>>excludeEnd('checks');

        var classify,
            parent;


        if (hasOwn(params, 'Extends')) {
            //>>includeStart('checks', pragmas.checks);
            // Verify if parent is a valid class
            if (!isFunction(params.Extends) || !params.Extends.$class) {
                throw new TypeError('Specified parent class in Extends of "' + params.Name + '" is not a valid class.');
            }
            //>>includeEnd('checks');

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
        //>>includeStart('checks', pragmas.checks);
        classify.$class = true;
        //>>includeEnd('checks');

        // Grab static methods from the parent and itself
        grabStatics(classify);
        //>>excludeStart('checks', pragmas.checks);
        if (hasOwn(params, 'Statics')) {
            delete classify.prototype.Statics;  // If we got checks enabled, we can't delete the Statics yet (see bellow)
        }
        //>>excludeEnd('checks');

        // Grab all the defined mixins
        if (hasOwn(params, 'Borrows')) {
            borrows(params.Borrows, classify);
            delete classify.prototype.Borrows;
        }

        // Grab all the defined binds
        if (hasOwn(params, 'Binds')) {
            grabBinds(classify);
            delete classify.prototype.Binds;
        }

        //>>includeStart('checks', pragmas.checks);
        // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent.$abstract && !params.$abstract) {
            checkAbstract(parent, classify);
        }
        //>>includeEnd('checks');

        // If the class implement some interfaces and is not abstract then
        if (hasOwn(params, 'Implements')) {

            //>>includeStart('checks', pragmas.checks);
            if (!params.$abstract) {
                checkInterfaces(params.Implements, classify);
            }
            //>>includeEnd('checks');

            delete classify.prototype.Implements;
        }

        //>>includeStart('checks', pragmas.checks);
        if (hasOwn(params, 'Statics')) {
            delete classify.prototype.Statics;  // Delete statics now
        }
        //>>includeEnd('checks');

        return classify;
    };

    Classify.Abstract = Abstract;
    Classify.Interface = Interface;

    return Classify;
});
