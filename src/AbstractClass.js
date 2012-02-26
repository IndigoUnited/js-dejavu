/*jslint sloppy:true, nomen:true, newcap:true*/
/*global define*/

define([
//>>includeStart('strict', pragmas.strict);
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/lang/isArray',
    'Utils/lang/isString',
    'Utils/lang/toArray',
    'Utils/lang/bind',
    'Utils/object/mixIn',
    'Utils/object/forOwn',
    'Utils/array/combine',
    './common/functionMeta',
    './common/isFunctionEmpty',
    './common/isFunctionCompatible',
    './common/checkKeywords',
//>>includeEnd('strict');
    'Utils/object/hasOwn',
    './Class',
    'require'
], function (
//>>includeStart('strict', pragmas.strict);
    isObject,
    isFunction,
    isArray,
    isString,
    toArray,
    bind,
    mixIn,
    forOwn,
    combine,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible,
    checkKeywords,
//>>includeEnd('strict');
    hasOwn,
    Class,
    require
) {

//>>includeStart('strict', pragmas.strict);
    /**
     * Add an abstract method to an abstract class.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *
     * @param {String}   name        The method name
     * @param {Function} method      The method itself
     * @param {Object}   constructor The class constructor
     * @param {Object}   [opts="{}"] The options
     */
    function addMethod(name, method, constructor, opts) {

        var metadata,
            isStatic = opts && opts.isStatic,
            target;

        // Check if it is a private member
        if (name.substr(0, 2) === '__') {
            throw new Error('Abstract class "' + constructor.prototype.Name + '" contains an unallowed abstract ' + (isStatic ? 'static ' : '') + 'private method: "' + name + '".');
        }
        // Check if it contains implementation
        if (!isFunctionEmpty(method)) {
            throw new TypeError((isStatic ? 'Static method' : 'Method') + ' "' + name + '" must be anonymous and contain no implementation in abstract class "' + constructor.prototype.Name + '".');
        }

        target = isStatic ? constructor : constructor.prototype;

        // Check if function is ok
        metadata = functionMeta(method, name);
        if (metadata === null) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in abstract class "' + constructor.prototype.Name + '".');
        }

        target = isStatic ? constructor.$class.staticMethods : constructor.$class.methods;

        // Check if it is already implemented
        if (isObject(target[name])) {
            throw new Error('Abstract method "' + name + '" defined in abstract class "' + constructor.prototype.Name + "' seems to be already implemented and cannot be declared as abstract anymore.");
        }

        target = isStatic ? constructor.$abstract.staticMethods : constructor.$abstract.methods;

        // Check if the method already exists and if it's compatible
        if (isObject(target[name])) {
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in abstract class "' + constructor.prototype.Name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        target[name] = metadata;
    }

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

        var optsStatic = { isStatic: true };

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

                    addMethod(key, value, constructor, optsStatic);
                });

            } else {

                // Check if it is not a function
                if (!isFunction(value) || value.$interface || value.$class) {
                    throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.Name + '" is not a function.');
                }

                addMethod(key, value, constructor);
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

//>>includeEnd('strict');
    /**
     * Create an abstract class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function AbstractClass(params) {

        Class = require('./Class');

//>>includeStart('strict', pragmas.strict);
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

//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        var def;
//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);
        var def,
            $abstract = { methods: {}, staticMethods: {}, interfaces: [] },
            saved = {};

        // If we are extending an abstract class also, inherit the abstract methods
        if (isFunction(params.Extends)) {

            if (params.Extends.$abstract) {
                mixIn($abstract.methods, params.Extends.$abstract.methods);
                mixIn($abstract.staticMethods, params.Extends.$abstract.staticMethods);
                combine($abstract.interfaces, params.Extends.$abstract.interfaces);
            }
        }

//>>includeEnd('strict');

        // Handle abstract methods
        if (hasOwn(params, 'Abstracts')) {
//>>includeStart('strict', pragmas.strict);
            saved.Abstracts = params.Abstracts;     // Save them for later use
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            delete params.Abstracts;
//>>excludeEnd('strict');
        }

//>>includeStart('strict', pragmas.strict);
        // Handle interfaces
        if (hasOwn(params, 'Implements')) {
            saved.Interfaces = params.Implements;   // Save them for later use
        }

        // Create the class definition
        def = Class(params, true);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        // Create the class definition
        def = Class(params);
//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);

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
//>>includeEnd('strict');

        return def;
    }

    return AbstractClass;
});
