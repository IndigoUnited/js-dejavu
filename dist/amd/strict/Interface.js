/*jslint sloppy:true*/
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
    'Utils/object/forOwn',
    './common/checkKeywords',
    './common/functionMeta',
    './common/isFunctionEmpty',
    './common/isFunctionCompatible',
    './common/checkObjectPrototype',
    'Utils/object/hasOwn',
    'Utils/lang/toArray'
], function (
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
    forOwn,
    checkKeywords,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible,
    checkObjectPrototype,
    hasOwn,
    toArray
) {

    checkObjectPrototype();
    
    /**
     * Checks if an interface is well implemented in a class.
     * In order to this function to work, it must be bound to an interface definition.
     *
     * @param {Function} target The class to be checked
     */
    function checkClass(target) {

        // Check normal functions
        forOwn(this.$interface.methods, function (value, k) {
            if (!target.$class.methods[k]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement interface "' + this.prototype.$name + '" correctly, method "' + k + '" was not found.');
            }
            if (!isFunctionCompatible(target.$class.methods[k], value)) {
                throw new Error('Method "' + k + '(' + target.$class.methods[k].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in interface "' + this.prototype.$name + '": "' + k + '(' + value.signature + ').');
            }
        }, this);

        // Check static functions
        forOwn(this.$interface.staticMethods, function (value, k) {
            if (!target.$class.staticMethods[k]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement interface "' + this.prototype.$name + '" correctly, static method "' + k + '" was not found.');
            }
            if (!isFunctionCompatible(target.$class.staticMethods[k], value)) {
                throw new Error('Static method "' + k + '(' + target.$class.staticMethods[k].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in interface "' + this.prototype.$name + '": "' + k + '(' + value.signature + ').');
            }
        }, this);
    }

    /**
     * Add a method to an interface.
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

        target = isStatic ? interf.$interface.staticMethods : interf.$interface.methods;

        // Check if the method already exists and it's compatible
        if (isObject(target[name])) {
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in interface "' + interf.prototype.$name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        target[name] = metadata;
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
            throw new TypeError('Argument "params" must be an object.');
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
            duplicate,
            optsStatic,
            interf = function () {
                throw new Error('Interfaces cannot be instantiated.');
            };

        interf.$interface = { parents: [], methods: {}, staticMethods: {}, check: bind(checkClass, interf) };
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
                if (!isFunction(current) || !current.$interface) {
                    throw new TypeError('Specified interface in $extends at index ' +  k + ' of "' + params.$name + '" is not a valid interface.');
                }

                // Merge methods
                duplicate = intersection(keys(interf.$interface.methods), keys(current.$interface.methods));
                i = duplicate.length;
                if (i > 0) {
                    for (i -= 1; i >= 0; i -= 1) {
                        if (!isFunctionCompatible(interf.$interface.methods[duplicate[i]], current.$interface.methods[duplicate[i]]) &&
                                !isFunctionCompatible(current.$interface.methods[duplicate[i]], interf.$interface.methods[duplicate[i]])) {
                            throw new Error('Interface "' + params.$name + '" is inheriting method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }
                mixIn(interf.$interface.methods, current.$interface.methods);

                // Merge static methods
                duplicate = intersection(keys(interf.$interface.staticMethods), keys(current.$interface.staticMethods));
                i = duplicate.length;
                if (i > 0) {
                    for (i -= 1; i >= 0; i -= 1) {
                        if (!isFunctionCompatible(interf.$interface.staticMethods[duplicate[i]], current.$interface.staticMethods[duplicate[i]]) &&
                                !isFunctionCompatible(current.$interface.staticMethods[duplicate[i]], interf.$interface.staticMethods[duplicate[i]])) {
                            throw new Error('Interface "' + params.$name + '" is inheriting static method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }

                mixIn(interf.$interface.staticMethods, current.$interface.staticMethods);

                // Add interface to the parents
                interf.$interface.parents.push(current);
            }

            delete params.$extends;
        }

        optsStatic = { isStatic: true };

        // Check if the interface defines the initialize function
        if (hasOwn(params, 'initialize')) {
            throw new Error('Interface "' + params.$name + '" can\'t define the initialize method.');
        }

        forOwn(params, function (value, k) {

            if (k === 'Statics') {

                if (!isObject(params.Statics)) {
                    throw new TypeError('Statics definition of interface "' + params.$name + '" must be an object.');
                }

                checkKeywords(params.Statics, 'statics');

                forOwn(params.Statics, function (value, k) {

                    // Check if it is not a function
                    if (!isFunction(value) || value.$interface || value.$class) {
                        throw new Error('Static member "' + k + '" found in interface "' + params.$name + '" is not a function.');
                    }

                    addMethod(k, value, interf, optsStatic);
                });

            } else if (k !== '$name') {

                // Check if it is not a function
                if (!isFunction(value) || value.$interface || value.$class) {
                    throw new Error('Member "' + k + '" found in interface "' + params.$name + '" is not a function.');
                }

                addMethod(k, value, interf);
            }
        });


        return interf;
    }

    return Interface;
});
