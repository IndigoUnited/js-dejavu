/*jslint sloppy:true nomen:true newcap:true*/
/*global define*/

define([
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/lang/isArray',
    'Utils/lang/isString',
    'Utils/lang/toArray',
    'Utils/lang/bind',
    'Utils/object/mixIn',
    'Utils/object/forOwn',
    'Utils/array/combine',
    './common/addMethod',
    './common/checkKeywords',
    './common/isFunctionCompatible',
    'Utils/object/hasOwn',
    './Class',
    'require'
], function (
    isObject,
    isFunction,
    isArray,
    isString,
    toArray,
    bind,
    mixIn,
    forOwn,
    combine,
    addMethod,
    checkKeywords,
    isFunctionCompatible,
    hasOwn,
    Class,
    require
) {

    /**
     * Checks if an abstract class is well implemented in a class.
     * In order to this function to work, it must be bound to an abstract class definition.
     *
     * @param {Function} target The class to be checked
     */
    function checkClass(target) {

        // Check normal functions
        forOwn(this.$abstract.methods, function (value, k) {
            if (!target.$class.methods[k]) {
                throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + this.prototype.Name + '" correctly, method "' + k + '" was not found.');
            }
            if (!isFunctionCompatible(target.$class.methods[k], value)) {
                throw new Error('Method "' + k + '(' + target.$class.methods[k].signature + ')" defined in class "' + target.prototype.Name + '" is not compatible with the one found in abstract class "' + this.prototype.Name + '": "' + k + '(' + value.signature + ').');
            }
        }, this);

        // Check static functions
        forOwn(this.$abstract.staticMethods, function (value, k) {
            if (!target.$class.staticMethods[k]) {
                throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + this.prototype.Name + '" correctly, static method "' + k + '" was not found.');
            }
            if (!isFunctionCompatible(target.$class.staticMethods[k], value)) {
                throw new Error('Static method "' + k + '(' + target.$class.staticMethods[k].signature + ')" defined in class "' + target.prototype.Name + '" is not compatible with the one found in abstract class "' + this.prototype.Name + '": "' + k + '(' + value.signature + ').');
            }
        }, this);
    }

    /**
     * Parse abstract methods.
     *
     * @param {Object}   abstracts   The object that contains the abstract methods
     * @param {Function} constructor The constructor
     */
    function parseAbstracts(abstracts, constructor) {

        if (!isObject(abstracts)) {
            throw new TypeError('Abstracts defined in abstract class "' + constructor.prototype.Name + "' must be an object.");
        }

        checkKeywords(abstracts);

        var opts = { type: 'normal', defType: 'abstract class', defName: constructor.prototype.Name, defConstructor: constructor, isAbstract: true },
            optsStatic = { type: 'static', defType: opts.defType, defName: opts.defName, defConstructor: constructor, isAbstract: true };

        forOwn(abstracts, function (value, key) {

            if (key === 'Statics') {

                if (!isObject(abstracts.Statics)) {
                    throw new TypeError('Statics definition in Abstracts of abstract class "' + constructor.prototype.Name + '" must be an object.');
                }

                checkKeywords(abstracts.Statics, 'statics');

                forOwn(abstracts.Statics, function (value, key) {

                    // Check if it is not a function
                    if (!isFunction(value) || value.$interface || value.$class) {
                        throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.Name + '" is not a function.');
                    }

                    addMethod(key, value, constructor.$abstract.staticMethods, optsStatic);
                });

            } else {

                // Check if it is not a function
                if (!isFunction(value) || value.$interface || value.$class) {
                    throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.Name + '" is not a function.');
                }

                addMethod(key, value, constructor.$abstract.methods, opts);
            }
        });
    }

    /**
     * Parse interfaces.
     *
     * @param {Array}    interfaces  The interfaces
     * @param {Function} constructor The constructor
     */
    function parseInterfaces(interfaces, constructor) {

        var interfs = toArray(interfaces),
            x = interfs.length,
            interf,
            grabMethods = function (value, key) {

                // Check if method is already defined as abstract and is compatible
                if (constructor.$abstract.methods[key]) {
                    if (!isFunctionCompatible(constructor.$abstract.methods[key], value)) {
                        throw new Error('Method "' + key + '( ' + value.signature + ')" described in interface "' + interf.prototype.Name + '" is not compatible with the one already defined in "' + constructor.prototype.Name + '": "' + key + '(' + constructor.$abstract.methods[key].signature + ')".');
                    }
                } else {
                    constructor.$abstract.methods[key] = interf.$interface.methods[key];
                }
            },
            grabStaticMethods = function (value, key) {

                // Check if method is already defined as abstract and is compatible
                if (constructor.$abstract.staticMethods[key]) {
                    if (!isFunctionCompatible(constructor.$abstract.staticMethods[key], value)) {
                        throw new Error('Static method "' + key + '( ' + value.signature + ')" described in interface "' + interf.prototype.Name + '" is not compatible with the one already defined in "' + constructor.prototype.Name + '": "' + key + '(' + constructor.$abstract.staticMethods[key].signature + ')".');
                    }
                } else {
                    constructor.$abstract.staticMethods[key] = value;
                }
            };

        // Verify argument type
        if (!x && !isArray(interfs)) {
            throw new TypeError('Implements of abstract class "' + constructor.prototype.Name + '" must be an interface or an array of interfaces.');
        }

        for (x -= 1; x >= 0; x -= 1) {

            interf = interfs[x];

            // Validate interfaces
            if (!isFunction(interf) || !interf.$interface) {
                throw new TypeError('Entry at index ' + x + ' in Implements of class "' + constructor.prototype.Name + '" is not a valid interface.');
            }

            // Grab methods
            forOwn(interf.$interface.methods, grabMethods);

            // Grab static methods
            forOwn(interf.$interface.staticMethods, grabStaticMethods);

            // Add it to the interfaces array
            constructor.$class.interfaces.push(interf);
        }
    }

    /**
     * Create an abstract class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function AbstractClass(params) {

        Class = require('./Class');

        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }
        // Validate class name
        if (hasOwn(params, 'Name')) {
            if (!isString(params.Name)) {
                throw new TypeError('Abstract class name must be a string.');
            }
        } else {
            params.Name = 'Unnamed';
        }

        var def,
            originalInitialize = params.initialize,
            parent,
            $abstract = { methods: {}, staticMethods: {}, interfaces: [] },
            saved = {};

        // If we are extending an abstract class also, inherit the abstract methods
        if (isFunction(params.Extends)) {

            parent = params.Extends;

            if (params.Extends.$class) {
                originalInitialize = originalInitialize || function () { parent.prototype.initialize.apply(this, arguments); };
            }

            if (params.Extends.$abstract) {
                mixIn($abstract.methods, params.Extends.$abstract.methods);
                mixIn($abstract.staticMethods, params.Extends.$abstract.staticMethods);
                combine($abstract.interfaces, params.Extends.$abstract.interfaces);
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

        // Handle abstract methods
        if (hasOwn(params, 'Abstracts')) {
            saved.Abstracts = params.Abstracts;
        }

        // Handle interfaces
        if (hasOwn(params, 'Implements')) {
            // Save them for later use
            saved.Interfaces = params.Implements;
        }

        // Create the class definition
        def = Class(params, true);

        $abstract.check = bind(checkClass, def);
        def.$abstract = $abstract;

        // Parse the saved interfaces
        if (hasOwn(saved, 'Interfaces')) {
            parseInterfaces(saved.Interfaces, def);
        }

        // Parse the abstract methods
        if (hasOwn(saved, 'Abstracts')) {
            parseAbstracts(saved.Abstracts, def);
            delete def.prototype.Abstracts;
        }

        return def;
    }

    return AbstractClass;
});
