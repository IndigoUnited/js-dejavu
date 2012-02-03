/*jslint sloppy: true nomen: true evil: true, newcap:true*/
/*global define*/

define([
//>>includeStart('checks', pragmas.checks);
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/lang/isArray',
    'Utils/lang/toArray',
    'Utils/object/forOwn',
    'Utils/object/hasOwn',
    'Utils/array/forEach',
    'Utils/array/combine',
    'Utils/array/insert',
    'Utils/array/contains',
    './common/verifyReserved',
//>>includeEnd('checks');
    './Classify',
    'require'
], function (
//>>includeStart('checks', pragmas.checks);
    isObject,
    isFunction,
    isArray,
    toArray,
    forOwn,
    hasOwn,
    forEach,
    combine,
    insert,
    contains,
    verifyReserved,
//>>includeEnd('checks');
    Classify,
    require
) {
//>>includeStart('checks', pragmas.checks);
    /**
     * Grab the source abstract methods and appends them to the abstract object array.
     *
     * @param {Object}   source The object that contains the methods
     * @param {Function} target The target object
     */
    function grabAbstracts(source, target) {

        if (!isObject(source)) {
            throw new TypeError('Abstracts defined in abstract class "' + target.prototype.Name + "' must be an object.");
        }

        verifyReserved(source);

        forOwn(source, function (value, key) {

            if (key !== 'Statics') {

                if (!isFunction(value)) {
                    throw new TypeError('Value for "' + key + '" in abstracts of abstract class "' + target.prototype.Name + "' must be a function.");
                }

                if (target.prototype[key]) {
                    throw new Error('Abstract method "' + key + '" of abstract class "' + target.prototype.Name + "' is already implemented and cannot be declared as abstract anymore.");
                }

                insert(target.$abstract.normal, key);
            } else {

                if (!isObject(source.Statics)) {
                    throw new TypeError('Statics definition for abstract class of abstract class "' + target.prototype.Name + '" must be an object.');
                }

                verifyReserved(source.Statics, 'statics');

                forOwn(source.Statics, function (value, key) {

                    if (!isFunction(value)) {
                        throw new TypeError('Value for "' + key + '" in abstracts (statics) of abstract class "' + target.prototype.Name + "' must be a function.");
                    }

                    if (target.$statics && contains(target.$statics, key)) {
                        throw new Error('Abstract static method "' + key + '" of abstract class "' + target.prototype.Name + "' is already implemented and cannot be declared as abstract anymore.");
                    }

                    insert(target.$abstract.statics, key);
                });
            }
        });
    }

    /**
     * Grab the interfaces methods and appends them to the abstract object arrays.
     *
     * @param {Array}    interfaces  The interfaces
     * @param {Function} target      The target
     */
    function grabInterfaces(interfaces, target) {

        var interfs = toArray(interfaces),
            reserved = ['$constructor', '$initializing'];

        // Verify argument type
        if (!interfaces.length && !isArray(interfs)) {
            throw new TypeError('Implements of abstract class "' + target.prototype.Name + '" must be an interface or an array of interfaces.');
        }

        forEach(interfs, function (interf, x) {

            // Validate interfaces
            if (!isFunction(interf) || !interf.$interface) {
                throw new TypeError('Entry at index ' + x + ' in Implements of class "' + target.prototype.Name + '" is not a valid interface.');
            }

            verifyReserved(interf.prototype, 'normal', reserved);

            forOwn(interf.prototype, function (value, key) {

                if (!contains(reserved, key) && isFunction(value)) {

                    if (target.prototype[key] && !isFunction(target[key])) {
                        throw new Error('Abstract class "' + target.prototype.Name + '" does not implement interface "' + interf.prototype.Name + '" correctly, method "' + key + '()" was not found.');
                    }

                    insert(target.$abstract.normal, key);
                }
            });

            // Merge static methods of interface
            if (interf.$statics) {
                forEach(interf.$statics, function (value) {
                    if (!target.$statics || !contains(target.$statics, value)) {
                        insert(target.$abstract.statics, value);
                    }
                });
            }
        });
    }
//>>includeEnd('checks');

    // We need to return a closure in order to solve the requirejs circular dependency
    return function (params) {

        Classify = require('./Classify');

        var def;

//>>includeStart('checks', pragmas.checks);
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        params.Name = params.Name || 'Unnamed';

        /*jslint vars:true*/
        var originalInitialize = params.initialize,
            parent,
            saved = {},
            abstractMethods = { normal: [], statics: [] };
        /*jslint vars:false*/

        // If we are extending an abstract class also, merge the abstract methods
        if (isFunction(params.Extends)) {

            parent = params.Extends;

            if (params.Extends.$class) {
                originalInitialize = originalInitialize || function () { parent.prototype.initialize.apply(this, arguments); };
            }

            if (params.Extends.$abstract) {
                combine(abstractMethods.normal, params.Extends.$abstract.normal);
                combine(abstractMethods.statics, params.Extends.$abstract.statics);
            }
        } else {
            originalInitialize = originalInitialize || function () {};
        }

        // Override the constructor
        params.initialize = function () {
            if (!this.$initializing) {
                throw new Error('An abstract class cannot be instantiated.');
            }
            originalInitialize.apply(this, arguments);
        };

//>>includeEnd('checks');
        // Save abstract methods and delete them
        if (hasOwn(params, 'Abstracts')) {
//>>includeStart('checks', pragmas.checks);
            saved.Abstracts = params.Abstracts;
//>>includeEnd('checks');
//>>excludeStart('checks', pragmas.checks)
            delete params.Abstracts;
//>>excludeEnd('checks');
        }

//>>includeStart('checks', pragmas.checks);
        // Save interfaces and delete them
        if (hasOwn(params, 'Implements')) {
            saved.Implements = params.Implements;
            delete params.Implements;
        }

        params.$abstract = true;    // Mark the instance as abstract

//>>includeEnd('checks');
        // Create the class definition
        def = Classify(params);

//>>includeStart('checks', pragmas.checks);
        // Delete the abstract mark and add it to the constructor
        delete def.prototype.$abstract;
        def.$abstract = abstractMethods;

        // Process the saved abstract methods
        if (hasOwn(saved, 'Abstracts')) {
            grabAbstracts(saved.Abstracts, def);
            delete def.prototype.Abstracts;
        }

        // Process the saved interfaces
        if (hasOwn(saved, 'Implements')) {
            grabInterfaces(saved.Implements, def);
        }

//>>includeEnd('checks');
        return def;
    };
});