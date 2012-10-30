define([
    'amd-utils/lang/isObject',
    'amd-utils/lang/isFunction',
    'amd-utils/lang/isString',
    'amd-utils/lang/toArray',
    'amd-utils/function/bind',
    './common/functionMeta',
    './common/isFunctionEmpty',
    './common/isFunctionCompatible',
    './common/checkKeywords',
    './common/testKeywords',
    './common/checkObjectPrototype',
    './common/hasDefineProperty',
    './common/randomAccessor',
    './common/mixIn',
    'amd-utils/object/hasOwn',
    'amd-utils/array/insert',
    './Class'
], function AbstractClassWrapper(
    isObject,
    isFunction,
    isString,
    toArray,
    bind,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible,
    checkKeywords,
    testKeywords,
    checkObjectPrototype,
    hasDefineProperty,
    randomAccessor,
    mixIn,
    hasOwn,
    insert,
    Class
) {

    'use strict';

    var random = randomAccessor('AbstractClassWrapper'),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        $abstract = '$abstract_' + random,
        $bound = '$bound_' + random,
        AbstractClass = {};

    checkObjectPrototype();

    /**
     * Add an abstract method to an abstract class.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *
     * @param {String}   name        The method name
     * @param {Function} method      The method itself
     * @param {Object}   constructor The class constructor
     * @param {Object}   [opts]      The options, defaults to {}
     */
    function addMethod(name, method, constructor, opts) {
        var metadata,
            isStatic = opts && opts.isStatic,
            target;

        // Check if it is a private member
        if (name.substr(0, 2) === '__') {
            throw new Error('Abstract class "' + constructor.prototype.$name + '" contains an unallowed abstract ' + (isStatic ? 'static ' : '') + 'private method: "' + name + '".');
        }
        // Check if it contains implementation
        if (!isFunctionEmpty(method)) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" must be anonymous and contain no implementation in abstract class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor : constructor.prototype;

        // Check if function is ok
        metadata = functionMeta(method, name);
        if (metadata === null) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in abstract class "' + constructor.prototype.$name + '".');
        }

        // Check if a variable exists with the same name
        target = isStatic ? constructor[$class].staticProperties : constructor[$class].properties;
        if (isObject(target[name])) {
            throw new Error('Abstract method "' + name + '" defined in abstract class "' + constructor.prototype.$name + '" conflicts with an already defined property.');
        }


        target = isStatic ? constructor[$class].staticMethods : constructor[$class].methods;

        // Check if it is already implemented
        if (isObject(target[name])) {
            throw new Error('Abstract method "' + name + '" defined in abstract class "' + constructor.prototype.$name + '" seems to be already implemented and cannot be declared as abstract anymore.');
        }

        target = isStatic ? constructor[$abstract].staticMethods : constructor[$abstract].methods;

        // Check if the method already exists and if it's compatible
        if (isObject(target[name])) {
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in abstract class "' + constructor.prototype.$name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        if (!isStatic && method[$bound]) {
            insert(constructor[$class].binds, name);
        }

        metadata.checkCompatibility = true;

        target[name] = metadata;
    }

    /**
     * Checks if an abstract class is well implemented in a class.
     * In order to this function to work, it must be bound to an abstract class definition.
     *
     * @param {Function} target The class to be checked
     */
    function checkClass(target) {
        /*jshint validthis:true*/
        var key,
            value;

        // Check normal functions
        for (key in this[$abstract].methods) {

            value = this[$abstract].methods[key];

            if (!target[$class].methods[key]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement abstract class "' + this.prototype.$name + '" correctly, method "' + key + '" was not found.');
            }
            if (!isFunctionCompatible(target[$class].methods[key], value)) {
                throw new Error('Method "' + key + '(' + target[$class].methods[key].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in abstract class "' + this.prototype.$name + '": "' + key + '(' + value.signature + ').');
            }
        }

        // Check static functions
        for (key in this[$abstract].staticMethods) {

            value = this[$abstract].staticMethods[key];

            if (!target[$class].staticMethods[key]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement abstract class "' + this.prototype.$name + '" correctly, static method "' + key + '" was not found.');
            }
            if (!isFunctionCompatible(target[$class].staticMethods[key], value)) {
                throw new Error('Static method "' + key + '(' + target[$class].staticMethods[key].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in abstract class "' + this.prototype.$name + '": "' + key + '(' + value.signature + ').');
            }
        }
    }

    /**
     * Parse abstract methods.
     *
     * @param {Object}   abstracts   The object that contains the abstract methods
     * @param {Function} constructor The constructor
     */
    function parseAbstracts(abstracts, constructor) {
        var optsStatic = { isStatic: true },
            key,
            value,
            unallowed;

        // Check argument
        if (!isObject(abstracts)) {
            throw new Error('$abstracts defined in abstract class "' + constructor.prototype.$name + '" must be an object.');
        }

        // Check reserved keywords
        checkKeywords(abstracts);

        // Check unallowed keywords
        unallowed = testKeywords(abstracts, ['$statics']);
        if (unallowed) {
            throw new Error('$statics inside $abstracts of abstract class "' + constructor.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
        }

        if (hasOwn(abstracts, '$statics')) {
            // Check argument
            if (!isObject(abstracts.$statics)) {
                throw new Error('$statics definition in $abstracts of abstract class "' + constructor.prototype.$name + '" must be an object.');
            }

            // Check keywords
            checkKeywords(abstracts.$statics, 'statics');

            // Check unallowed keywords
            unallowed = testKeywords(abstracts.$statics);
            if (unallowed) {
                throw new Error('$statics inside $abstracts of abstract class "' + constructor.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
            }

            for (key in abstracts.$statics) {
                value = abstracts.$statics[key];

                // Check if it is not a function
                if (!isFunction(value) || value[$interface] || value[$class]) {
                    throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.$name + '" is not a function.');
                }

                addMethod(key, value, constructor, optsStatic);
            }

            delete abstracts.$statics;
        }

        for (key in abstracts) {
            value = abstracts[key];

            // Check if it is not a function
            if (!isFunction(value) || value[$interface] || value[$class]) {
                throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.$name + '" is not a function.');
            }

            addMethod(key, value, constructor);
        }
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
            key,
            value;

        for (x -= 1; x >= 0; x -= 1) {
            interf = interfs[x];

            // Grab methods
            for (key in interf[$interface].methods) {

                value = interf[$interface].methods[key];

                 // Check if method is already defined as abstract and is compatible
                if (constructor[$abstract].methods[key]) {
                    if (!isFunctionCompatible(constructor[$abstract].methods[key], value)) {
                        throw new Error('Method "' + key + '( ' + value.signature + ')" described in interface "' + interf.prototype.$name + '" is not compatible with the one already defined in "' + constructor.prototype.$name + '": "' + key + '(' + constructor[$abstract].methods[key].signature + ')".');
                    }
                } else {
                    constructor[$abstract].methods[key] = interf[$interface].methods[key];
                }
            }

            // Grab static methods
            for (key in interf[$interface].staticMethods) {

                value = interf[$interface].staticMethods[key];

                // Check if method is already defined as abstract and is compatible
                if (constructor[$abstract].staticMethods[key]) {
                    if (!isFunctionCompatible(constructor[$abstract].staticMethods[key], value)) {
                        throw new Error('Static method "' + key + '( ' + value.signature + ')" described in interface "' + interf.prototype.$name + '" is not compatible with the one already defined in "' + constructor.prototype.$name + '": "' + key + '(' + constructor[$abstract].staticMethods[key].signature + ')".');
                    }
                } else {
                    constructor[$abstract].staticMethods[key] = value;
                }
            }
        }
    }

    /**
     * Create an abstract class definition.
     *
     * @param {Object}      params        An object containing methods and properties
     * @param {Constructor} [constructor] Assume the passed constructor
     *
     * @return {Function} The constructor
     */
    function createAbstractClass(params, constructor) {
        if (!isObject(params)) {
            throw new Error('Expected abstract class definition to be an object with the abstract class members.');
        }
        // Validate class name
        if (hasOwn(params, '$name')) {
            if (!isString(params.$name)) {
                throw new Error('Abstract class name must be a string.');
            } else if (/\s+/.test(params.$name)) {
                throw new Error('Abstract class name cannot have spaces.');
            }
        } else {
            params.$name = 'Unnamed';
        }

        var def,
            abstractObj = { methods: {}, staticMethods: {}, unimplemented: 0 },
            saved = {},
            key;

        // If we are extending an abstract class also, inherit the abstract methods
        if (isFunction(params.$extends)) {
            if (params.$extends[$abstract]) {
                mixIn(abstractObj.methods, params.$extends[$abstract].methods);
                mixIn(abstractObj.staticMethods, params.$extends[$abstract].staticMethods);
            }
        }

        // Handle abstract methods
        if (hasOwn(params, '$abstracts')) {
            saved.$abstracts = params.$abstracts;     // Save them for later use
        }

        // Handle interfaces
        if (hasOwn(params, '$implements')) {
            saved.$interfaces = params.$implements;   // Save them for later use
        }

        // Create the class definition
        def = Class.$create(params, constructor, { isAbstract: true });

        abstractObj.check = bind(checkClass, def);

        if (hasDefineProperty) {
            Object.defineProperty(def, $abstract, {
                value: abstractObj,
                writable: false
            });
        } else {
            def[$abstract] = abstractObj;
        }

        // Parse the saved interfaces
        if (hasOwn(saved, '$interfaces')) {
            parseInterfaces(saved.$interfaces, def);
        }

        // Parse the abstract methods
        if (hasOwn(saved, '$abstracts')) {
            parseAbstracts(saved.$abstracts, def);
        }

        // Finally update the unimplemented count
        for (key in def[$abstract].methods) {
            if (!def[$class].methods[key]) {
                abstractObj.unimplemented += 1;
            }
        }
        for (key in def[$abstract].staticMethods) {
            if (!def[$class].staticMethods[key]) {
                abstractObj.unimplemented += 1;
            }
        }

        return def;
    }

    /**
     * Function to declare an abstract class.
     * This function can be called with various formats.
     * The first parameter can be a class to extend.
     * The second parameter must be an object containing the class members or a function to obtain it.
     *
     * @param {Function|Object} arg1 A class, an object or a function
     * @param {Function|Object} arg2 Object containing the class members or a function to obtain it.
     *
     * @return {Function} The constructor
     */
    AbstractClass.declare = function (arg1, arg2, $arg3) {
        return Class.declare.call(createAbstractClass, arg1, arg2, $arg3);
    };

    return AbstractClass;
});
