/*jslint sloppy:true*/
/*global define*/

define([
//>>includeStart('strict', pragmas.strict);
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
//>>includeEnd('strict');
    'Utils/object/hasOwn',
    'Utils/lang/toArray'
], function (
//>>includeStart('strict', pragmas.strict);
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
//>>includeEnd('strict');
    hasOwn,
    toArray
) {

//>>includeStart('strict', pragmas.strict);
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
                throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + this.prototype.Name + '" correctly, method "' + k + '" was not found.');
            }
            if (!isFunctionCompatible(target.$class.methods[k], value)) {
                throw new Error('Method "' + k + '(' + target.$class.methods[k].signature + ')" defined in class "' + target.prototype.Name + '" is not compatible with the one found in interface "' + this.prototype.Name + '": "' + k + '(' + value.signature + ').');
            }
        }, this);

        // Check static functions
        forOwn(this.$interface.staticMethods, function (value, k) {
            if (!target.$class.staticMethods[k]) {
                throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + this.prototype.Name + '" correctly, static method "' + k + '" was not found.');
            }
            if (!isFunctionCompatible(target.$class.staticMethods[k], value)) {
                throw new Error('Static method "' + k + '(' + target.$class.staticMethods[k].signature + ')" defined in class "' + target.prototype.Name + '" is not compatible with the one found in interface "' + this.prototype.Name + '": "' + k + '(' + value.signature + ').');
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
            throw new Error('Interface "' + interf.prototype.Name + '" contains an unallowed non public method: "' + name + '".');
        }
        // Check if it contains no implementation
        if (!isFunctionEmpty(method)) {
            throw new TypeError((isStatic ? 'Static method' : 'Method') + ' "' + name + '" must be anonymous and contain no implementation in interface "' + interf.prototype.Name + '".');
        }
        // Check if function is ok
        metadata = functionMeta(method, name);
        if (metadata === null) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in interface "' + interf.prototype.Name + '".');
        }

        target = isStatic ? interf.$interface.staticMethods : interf.$interface.methods;

        // Check if the method already exists and it's compatible
        if (isObject(target[name])) {
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in interface "' + interf.prototype.Name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        target[name] = metadata;
    }

//>>includeEnd('strict');
    /**
     * Create an interface definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function Interface(params) {

//>>includeStart('strict', pragmas.strict);
        // Validate params as an object
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }
        // Validate class name
        if (hasOwn(params, 'Name')) {
            if (!isString(params.Name)) {
                throw new TypeError('Abstract class name must be a string.');
            } else if (/\s+/.test(params.Name)) {
                throw new TypeError('Class name cannot have spaces.');
            }
        } else {
            params.Name = 'Unnamed';
        }

        checkKeywords(params);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        delete params.Name;
//>>excludeEnd('strict');

//>>includeStart('strict', pragmas.strict);
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
        interf.prototype.Name = params.Name;
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        var parents,
            k,
            interf = function () {};

        interf.$interface = { parents: [] };
//>>excludeEnd('strict');

        if (hasOwn(params, 'Extends')) {

            parents = toArray(params.Extends);
            k = parents.length;

//>>includeStart('strict', pragmas.strict);
            // Verify argument type
            if (!k && !isArray(params.Extends)) {
                throw new TypeError('Extends of "' + params.Name + '" seems to point to an nonexistent interface.');
            }
            // Verify duplicate entries
            if (k !== unique(parents).length && compact(parents).length === k) {
                throw new Error('There are duplicate entries defined in Extends of "' + params.Name + '".');
            }

//>>includeEnd('strict');
            for (k -= 1; k >= 0; k -= 1) {
//>>includeStart('strict', pragmas.strict);

                current = parents[k];

                // Check if it is a valid interface
                if (!isFunction(current) || !current.$interface) {
                    throw new TypeError('Specified interface in Extends at index ' +  k + ' of "' + params.Name + '" is not a valid interface.');
                }

                // Merge methods
                duplicate = intersection(keys(interf.$interface.methods), keys(current.$interface.methods));
                i = duplicate.length;
                if (i > 0) {
                    for (i -= 1; i >= 0; i -= 1) {
                        if (!isFunctionCompatible(interf.$interface.methods[duplicate[i]], current.$interface.methods[duplicate[i]]) &&
                                !isFunctionCompatible(current.$interface.methods[duplicate[i]], interf.$interface.methods[duplicate[i]])) {
                            throw new Error('Interface "' + params.Name + '" is inheriting method "' + duplicate[i] + '" from different parents with incompatible signatures.');
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
                            throw new Error('Interface "' + params.Name + '" is inheriting static method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }

                mixIn(interf.$interface.staticMethods, current.$interface.staticMethods);

                // Add interface to the parents
                interf.$interface.parents.push(current);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
                // Add interface to the parents
                interf.$interface.parents.push(parents[k]);
//>>excludeEnd('strict');
            }

            delete params.Extends;
        }

//>>includeStart('strict', pragmas.strict);
        optsStatic = { isStatic: true };

        // Check if the interface defines the initialize function
        if (hasOwn(params, 'initialize')) {
            throw new Error('Interface "' + params.Name + '" can\'t define the initialize method.');
        }

        forOwn(params, function (value, k) {

            if (k === 'Statics') {

                if (!isObject(params.Statics)) {
                    throw new TypeError('Statics definition of interface "' + params.Name + '" must be an object.');
                }

                checkKeywords(params.Statics, 'statics');

                forOwn(params.Statics, function (value, k) {

                    // Check if it is not a function
                    if (!isFunction(value) || value.$interface || value.$class) {
                        throw new Error('Static member "' + k + '" found in interface "' + params.Name + '" is not a function.');
                    }

                    addMethod(k, value, interf, optsStatic);
                });

            } else if (k !== 'Name') {

                // Check if it is not a function
                if (!isFunction(value) || value.$interface || value.$class) {
                    throw new Error('Member "' + k + '" found in interface "' + params.Name + '" is not a function.');
                }

                addMethod(k, value, interf);
            }
        });

//>>includeEnd('strict');

        return interf;
    }

    return Interface;
});
