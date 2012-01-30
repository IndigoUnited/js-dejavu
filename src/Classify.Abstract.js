/*jslint sloppy: true nomen: true evil: true, newcap:true*/
/*global define*/

define([
    //>>includeStart('checks', pragmas.checks);
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/object/forOwn',
    'Utils/array/forEach',
    'Utils/lang/toArray',
    'Utils/array/union',
    'Utils/array/insert',
    //>>includeEnd('checks');
    'Trinity/Classify',
    'require'
], function (
    //>>includeStart('checks', pragmas.checks);
    isObject,
    isFunction,
    forOwn,
    forEach,
    toArray,
    union,
    insert,
    //>>includeEnd('checks');
    Classify,
    require
) {

    // We need to return a closure in order to solve the requirejs circular dependency
    return function (params) {

        Classify = require('Trinity/Classify');

        var def;

        //>>includeStart('checks', pragmas.checks);
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        params.Name = params.Name || 'Unnamed';

        /*jslint vars:true*/
        var originalInitialize = params.initialize,
            parent,
            abstractMethods = { normal: [], statics: [] };
        /*jslint vars:false*/

        /**
         * Grab the source abstrac methods and append them to the target arrays
         *
         * @param {Object} source The source
         * @param {Object} target An object container normal and statics array
         * @param {String} name   The name of the class
         */
        function grabAbstracts(source, target, name) {

            forOwn(source, function (value, key) {

                if (key !== 'Statics') {
                    insert(target.normal, key);
                } else {

                    if (!isObject(source.Statics)) {
                        throw new TypeError('Statics definition for abstract class "' + name + '" must be an object.');
                    }

                    forOwn(source.Statics, function (value, key) {

                        if (isFunction(value)) {
                            insert(target.statics, key);
                        }
                    });
                }
            });
        }
        //>>includeEnd('checks');

        // Grab all the abstract methods
        if (params.Abstracts) {

            //>>includeStart('checks', pragmas.checks);
            if (!isObject(params.Abstracts)) {
                throw new TypeError('Abstracts defined in abstract class "' + params.Name + "' must be an object.");
            }

            grabAbstracts(params.Abstracts, abstractMethods, params.Name);
            //>>includeEnd('checks');

            delete params.Abstracts;
        }

        //>>includeStart('checks', pragmas.checks);
        // Automatically grab not implemented interface methods
        if (params.Implements) {


            forEach(toArray(params.Implements), function (value, x) {

                if (!isFunction(value) || !value.$interface) {
                    throw new TypeError('Unexpected class at index ' + x + ' for abstract class "' + value.prototype.Name + "'.");
                }

                grabAbstracts(value.prototype, abstractMethods, params.Name);
            });

            delete params.Implements;
        }

        // If we are extending an abstract class also, merge the abstract methods
        if (params.Extends && isFunction(params.Extends)) {

            parent = params.Extends;

            if (params.Extends.$class) {
                originalInitialize = originalInitialize || function () { parent.prototype.initialize.apply(this, arguments); };
            }

            if (params.Extends.$abstract) {
                abstractMethods.normal = union(abstractMethods.normal, params.Extends.$abstract.normal);
                abstractMethods.statics = union(abstractMethods.statics, params.Extends.$abstract.statics);
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

        params.$abstract = true;    // Mark the instance as abstract
        //>>includeEnd('checks');

        // Create the class definition
        def = Classify(params);

        //>>includeStart('checks', pragmas.checks);
        delete def.prototype.$abstract;    // Delete the mark and add it to the constructor
        def.$abstract = abstractMethods;
        //>>includeEnd('checks');

        return def;
    };
});