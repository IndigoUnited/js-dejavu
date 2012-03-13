/*jslint sloppy:true, forin:true*/
/*global define*/

define([
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/lang/isArray',
    'Utils/lang/isString',
    'Utils/lang/bind',
    'Utils/array/intersection',
    'Utils/array/unique',
    'Utils/array/compact',
    'Utils/object/mixIn',
    'Utils/object/keys',
    './common/checkKeywords',
    './common/functionMeta',
    './common/isFunctionEmpty',
    './common/isFunctionCompatible',
    './common/checkObjectPrototype',
    './common/obfuscateProperty',
    './common/randomAccessor',
    './common/isPrimitiveType',
    './common/hasDefineProperty',
    'Utils/object/hasOwn',
    'Utils/lang/toArray'
], function InterfaceWrapper(
    isObject,
    isFunction,
    isArray,
    isString,
    bind,
    intersection,
    unique,
    compact,
    mixIn,
    keys,
    checkKeywords,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible,
    checkObjectPrototype,
    obfuscateProperty,
    randomAccessor,
    isPrimitiveType,
    hasDefineProperty,
    hasOwn,
    toArray
) {

    var random = randomAccessor(),
        $class = '$class_' + random,
        $interface = '$interface_' + random;

    checkObjectPrototype();

    /**
     * Checks if an interface is well implemented in a class.
     * In order to this function to work, it must be bound to an interface definition.
     *
     * @param {Function} target The class to be checked
     */
    function checkClass(target) {

        var key,
            value;

        // Check normal functions
        for (key in this[$interface].methods) {

            value = this[$interface].methods[key];

            if (!target[$class].methods[key]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement interface "' + this.prototype.$name + '" correctly, method "' + key + '" was not found.');
            }
            if (!isFunctionCompatible(target[$class].methods[key], value)) {
                throw new Error('Method "' + key + '(' + target[$class].methods[key].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in interface "' + this.prototype.$name + '": "' + key + '(' + value.signature + ').');
            }
        }

        // Check static functions
        for (key in this[$interface].staticMethods) {

            value = this[$interface].staticMethods[key];

            if (!target[$class].staticMethods[key]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement interface "' + this.prototype.$name + '" correctly, static method "' + key + '" was not found.');
            }
            if (!isFunctionCompatible(target[$class].staticMethods[key], value)) {
                throw new Error('Static method "' + key + '(' + target[$class].staticMethods[key].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in interface "' + this.prototype.$name + '": "' + key + '(' + value.signature + ').');
            }
        }
    }

    /**
     * Adds a method to an interface.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *
     * @param {String}   name        The method name
     * @param {Function} method      The method itself
     * @param {Function} interf      The interface in which the method metadata will be saved
     * @param {Object}   [opts="{}"] The options
     */
    function addMethod(name, method, interf, opts) {

        var metadata,
            isStatic = opts && opts.isStatic,
            target;

        // Check if it is not a function
        if (!isFunction(method) || method[$interface] || method[$class]) {
            throw new Error('Member "' + name + '" found in interface "' + interf.prototype.$name + '" is not a function.');
        }
        // Check if it is public
        if (name.charAt(0) === '_') {
            throw new Error('Interface "' + interf.prototype.$name + '" contains an unallowed non public method: "' + name + '".');
        }
        // Check if it contains no implementation
        if (!isFunctionEmpty(method)) {
            throw new TypeError((isStatic ? 'Static method' : 'Method') + ' "' + name + '" must be anonymous and contain no implementation in interface "' + interf.prototype.$name + '".');
        }
        // Check if function is ok
        metadata = functionMeta(method, name);
        if (metadata === null) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in interface "' + interf.prototype.$name + '".');
        }

        target = isStatic ? interf[$interface].staticMethods : interf[$interface].methods;

        // Check if the method already exists and it's compatible
        if (isObject(target[name])) {
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in interface "' + interf.prototype.$name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        target[name] = metadata;
    }

    /**
     * Assigns a constant to the interface.
     * This method will protect the constant from being changed.
     *
     * @param {String}   name        The constant name
     * @param {Function} value       The constant value
     * @param {Function} interf      The interface in which the constant will be saved
     */
    function assignConstant(name, value, interf) {

        if (hasDefineProperty) {
            Object.defineProperty(interf, name, {
                get: function () {
                    return value;
                },
                set: function () {
                    throw new Error('Cannot change value of constant property "' + name + '" of interface "' + this.prototype.$name + '".');
                },
                configurable: false,
                enumerable: true
            });
        } else {
            interf[name] = value;
        }
    }

    /**
     * Adds a constant to an interface.
     * This method will throw an error if something is not right.
     *
     * @param {String}   name        The constant name
     * @param {Function} value       The constant value
     * @param {Function} interf      The interface in which the constant will be saved
     */
    function addConstant(name, value, interf) {

        var target;

        // Check if it is a primitive type
        if (!isPrimitiveType(value)) {
            throw new Error('Value for constant "' + name + '" defined in class "' + interf.prototype.$name + '" must be a primitive type.');
        }

        // Check if it is public
        if (name.charAt(0) === '_') {
            throw new Error('Interface "' + interf.prototype.$name + '" contains an unallowed non public method: "' + name + '".');
        }
        // Check if it is a primitive value
        if (!isPrimitiveType(value)) {
            throw new Error('Value for constant property "' + name + '" defined in interface "' + interf.prototype.$name + '" must be a primitive type.');
        }

        target = interf[$interface].constants;

        // Check if the constant already exists
        if (target[name]) {
            throw new Error('Cannot override constant property "' + name + '" in interface "' + interf.prototype.$name + '".');
        }

        target[name] = true;
        assignConstant(name, value, interf);
    }

    /**
     * Create an interface definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function Interface(params) {

        // Validate params as an object
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object while defining an interface.');
        }
        // Validate class name
        if (hasOwn(params, '$name')) {
            if (!isString(params.$name)) {
                throw new TypeError('Interface name must be a string.');
            } else if (/\s+/.test(params.$name)) {
                throw new TypeError('Interface name cannot have spaces.');
            }
        } else {
            params.$name = 'Unnamed';
        }

        checkKeywords(params);

        var parents,
            current,
            k,
            i,
            value,
            duplicate,
            opts = {},
            name,
            ambiguous,
            interf = function () {
                throw new Error('Interfaces cannot be instantiated.');
            };

        obfuscateProperty(interf, $interface, { parents: [], methods: {}, staticMethods: {}, constants: {}, check: bind(checkClass, interf) });
        interf.prototype.$name = params.$name;

        if (hasOwn(params, '$extends')) {

            parents = toArray(params.$extends);
            k = parents.length;

            // Verify argument type
            if (!k && !isArray(params.$extends)) {
                throw new TypeError('$extends of "' + params.$name + '" seems to point to an nonexistent interface.');
            }
            // Verify duplicate entries
            if (k !== unique(parents).length && compact(parents).length === k) {
                throw new Error('There are duplicate entries defined in $extends of "' + params.$name + '".');
            }

            for (k -= 1; k >= 0; k -= 1) {

                current = parents[k];

                // Check if it is a valid interface
                if (!isFunction(current) || !current[$interface]) {
                    throw new TypeError('Specified interface in $extends at index ' +  k + ' of "' + params.$name + '" is not a valid interface.');
                }

                // Merge methods
                duplicate = intersection(keys(interf[$interface].methods), keys(current[$interface].methods));
                i = duplicate.length;
                if (i) {
                    for (i -= 1; i >= 0; i -= 1) {
                        if (!isFunctionCompatible(interf[$interface].methods[duplicate[i]], current[$interface].methods[duplicate[i]]) &&
                                !isFunctionCompatible(current[$interface].methods[duplicate[i]], interf[$interface].methods[duplicate[i]])) {
                            throw new Error('Interface "' + params.$name + '" is inheriting method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }
                mixIn(interf[$interface].methods, current[$interface].methods);

                // Merge static methods
                duplicate = intersection(keys(interf[$interface].staticMethods), keys(current[$interface].staticMethods));
                i = duplicate.length;
                if (i) {
                    for (i -= 1; i >= 0; i -= 1) {
                        if (!isFunctionCompatible(interf[$interface].staticMethods[duplicate[i]], current[$interface].staticMethods[duplicate[i]]) &&
                                !isFunctionCompatible(current[$interface].staticMethods[duplicate[i]], interf[$interface].staticMethods[duplicate[i]])) {
                            throw new Error('Interface "' + params.$name + '" is inheriting static method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }
                mixIn(interf[$interface].staticMethods, current[$interface].staticMethods);

                // Add interface constants
                for (i in current[$interface].constants) {
                    if (interf[$interface].constants[i]) {
                        if (interf[i] !== current[i]) {
                            throw new Error('Interface "' + params.$name + '" is inheriting constant property "' + i + '" from different parents with different values.');
                        }
                    } else {
                        interf[$interface].constants[i] = current[$interface].constants[i];
                        assignConstant(i, current[i], interf);
                    }
                }

                // Add interface to the parents
                interf[$interface].parents.push(current);
            }

            delete params.$extends;
        }

        // Check if the interface defines the initialize function
        if (hasOwn(params, 'initialize')) {
            throw new Error('Interface "' + params.$name + '" can\'t define the initialize method.');
        }

        // Parse constants
        if (hasOwn(params, '$constants')) {

            // Check argument
            if (!isObject(params.$constants)) {
                throw new TypeError('$constants definition of interface "' + params.$name + '" must be an object.');
            }

            checkKeywords(params.$constants, 'statics');

            // Check ambiguity
            if (hasOwn(params, '$statics')) {
                ambiguous = intersection(keys(params.$constants), keys(params.$statics));
                if (ambiguous.length) {
                    throw new Error('There are members defined in interface "' + params.$name + '" with the same name but with different modifiers: "' + ambiguous.join('", ') + '".');
                }
            }

            for (k in params.$constants) {
                addConstant(k, params.$constants[k], interf);
            }

            delete params.$constants;
        }

        // Parse statics
        if (hasOwn(params, '$statics')) {

            if (!isObject(params.$statics)) {
                throw new TypeError('$statics definition of interface "' + params.$name + '" must be an object.');
            }

            checkKeywords(params.$statics, 'statics');
            opts.isStatic = true;

            for (k in params.$statics) {

                value = params.$statics[k];

                // Check if it is not a function
                if (!isFunction(value) || value[$interface] || value[$class]) {
                    throw new Error('Static member "' + k + '" found in interface "' + params.$name + '" is not a function.');
                }

                addMethod(k, value, interf, opts);
            }

            delete opts.isStatic;
            delete params.$statics;
        }

        name = params.$name;
        delete params.$name;

        for (k in params) {
            addMethod(k, params[k], interf);
        }

        params.$name = name;

        return interf;
    }

    return Interface;
});
