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
    './common/addMethod',
    './common/isFunctionCompatible',
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
    addMethod,
    isFunctionCompatible,
    hasOwn,
    toArray
) {

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
        if (hasOwn(params, 'Name')) {
            if (!isString(params.Name)) {
                throw new TypeError('Abstract class name must be a string.');
            }
        } else {
            params.Name = 'Unnamed';
        }

        checkKeywords(params);

        var parents,
            current,
            k,
            i,
            duplicate,
            opts,
            optsStatic,
            interf = function () {
                throw new Error('Interfaces cannot be instantiated.');
            };

        interf.$interface = { parents: [], methods: {}, staticMethods: {}, check: bind(checkClass, interf) };

        if (hasOwn(params, 'Extends')) {

            parents = toArray(params.Extends);
            k = parents.length;

            // Verify argument type
            if (!k && !isArray(params.Extends)) {
                throw new TypeError('Extends of "' + params.Name + '" seems to point to an nonexistent interface.');
            }
            // Verify duplicate entries
            if (k !== unique(parents).length && compact(parents).length === k) {
                throw new Error('There are duplicate entries defined in Extends of "' + params.Name + '".');
            }

            for (k -= 1; k >= 0; k -= 1) {

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
                        if (!isFunctionCompatible(interf.$interface.methods[duplicate[i]], current.$interface.methods[duplicate[i]])
                                && !isFunctionCompatible(current.$interface.methods[duplicate[i]], interf.$interface.methods[duplicate[i]])) {
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
                        if (!isFunctionCompatible(interf.$interface.staticMethods[duplicate[i]], current.$interface.staticMethods[duplicate[i]])
                                && !isFunctionCompatible(current.$interface.staticMethods[duplicate[i]], interf.$interface.staticMethods[duplicate[i]])) {
                            throw new Error('Interface "' + params.Name + '" is inheriting static method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }

                mixIn(interf.$interface.staticMethods, current.$interface.staticMethods);

                // Add interface to the parents
                interf.$interface.parents.push(current);
            }

            delete params.Extends;
        }

        opts = { type: 'normal', defType: 'interface', defName: params.Name, isInterface: true };
        optsStatic = { type: 'static', defType: opts.defType, defName: params.Name, isInterface: true };

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

                    addMethod(k, value, interf.$interface.staticMethods, optsStatic);
                });

            } else if (k !== 'Name') {

                // Check if it is not a function
                if (!isFunction(value) || value.$interface || value.$class) {
                    throw new Error('Member "' + k + '" found in interface "' + params.Name + '" is not a function.');
                }

                addMethod(k, value, interf.$interface.methods, opts);
            }
        });

        interf.prototype.Name = params.Name;


        return interf;
    }

    return Interface;
});
