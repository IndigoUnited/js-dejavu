/*jslint sloppy:true forin:true newcap:true*/
/*global define*/

define([
//>>includeStart('strict', pragmas.strict);
    'Utils/lang/isString',
    'Utils/array/intersection',
    'Utils/array/unique',
    './common/checkKeywords',
    './common/addMethod',
//>>includeEnd('strict');
    'Utils/lang/isFunction',
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/hasOwn',
    'Utils/object/forOwn',
    'Utils/array/combine',
    'Utils/array/append',
    'Utils/array/insert',
    'Utils/array/compact',
    'Utils/lang/bind',
    'Utils/lang/toArray'
], function (
//>>includeStart('strict', pragmas.strict);
    isString,
    intersection,
    unique,
    checkKeywords,
    addMethod,
//>>includeEnd('strict');
    isFunction,
    isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    hasOwn,
    forOwn,
    combine,
    append,
    insert,
    compact,
    bind,
    toArray
) {

    var Class;

    /**
     * Parse borrows (mixins).
     *
     * @param {Function} constructor The constructor
     */
    function parseBorrows(constructor) {

        if (hasOwn(constructor.prototype, 'Borrows')) {

//>>includeStart('strict', pragmas.strict);
            var current,
                key,
                k,
                mixins = toArray(constructor.prototype.Borrows),
                i = mixins.length,
                opts = { type: 'normal', defType: 'class', defName: constructor.prototype.Name },
                optsStatic = { type: 'static', defType: opts.defType, defName: opts.defName },
                grabMethods = function (value, key) {
                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        if (isFunction(value) && !value.$class && !value.$interface) {
                            addMethod(key, value, constructor.$class.methods, opts);
                        }
                        constructor.prototype[key] = value;
                    }
                },
                grabStaticMethods = function (value, key) {
                    if (isUndefined(constructor[key])) {    // Already defined members are not overwritten
                        addMethod(key, current.$constructor[key], constructor.$class.staticMethods, optsStatic);
                        constructor[key] = current.$constructor[key];
                    }
                };
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            var current,
                k,
                key,
                mixins = toArray(constructor.prototype.Borrows),
                i = mixins.length,
                grabMethods = function (value, key) {
                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        constructor.prototype[key] = value;
                    }
                };
//>>excludeEnd('strict');

//>>includeStart('strict', pragmas.strict);
            // Verify argument type
            if (!i && !isArray(constructor.prototype.Borrows)) {
                throw new TypeError('Borrows of "' + constructor.prototype.Name + '" must be a class/object or an array of classes/objects.');
            }
            // Verify duplicate entries
            if (i !== unique(mixins).length && compact(mixins).length === i) {
                throw new Error('There are duplicate entries defined in Borrows of "' + constructor.prototype.Name + '".');
            }

//>>includeEnd('strict');
            for (i -= 1; i >= 0; i -= 1) {

//>>includeStart('strict', pragmas.strict);
                // Verify each mixin
                if ((!isFunction(mixins[i]) || !mixins[i].$class || mixins[i].$abstract) && (!isObject(mixins[i]) || mixins[i].$constructor)) {
                    throw new TypeError('Entry at index ' + i + ' in Borrows of class "' + constructor.prototype.Name + '" is not a valid class/object (abstract classes and instances of classes are not supported).');
                }

                if (isObject(mixins[i])) {
                    try {
                        current = Class(mixIn({}, mixins[i])).prototype;
                    } catch (e) {
                        // When an object is being used, throw a more friend message if an error occurs
                        throw new Error('Unable to define object as class at index ' + i + ' in Borrows of class "' + constructor.prototype.Name + '" (' + e.message + ').');
                    }
                } else {
                    current = mixins[i].prototype;
                }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
                current = isObject(mixins[i]) ? Class(mixIn({}, mixins[i])).prototype : mixins[i].prototype;
//>>excludeEnd('strict');

                // Grab mixin methods
                forOwn(current, grabMethods);

                // Grab mixin static methods
//>>includeStart('strict', pragmas.strict);
                forOwn(current.$constructor.$class.staticMethods, grabStaticMethods);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
                for (k = current.$constructor.$class.staticMethods.length - 1; k >= 0; k -= 1) {
                    key = current.$constructor.$class.staticMethods[k];
                    if (isUndefined(constructor[key])) {    // Already defined members are not overwritten
                        insert(constructor.$class.staticMethods, key);
                        constructor[key] = current.$constructor[key];
                    }
                }
//>>excludeEnd('strict');

                // Grab mixin static properties
                for (k = current.$constructor.$class.staticProperties.length - 1; k >= 0; k -= 1) {
                    key = current.$constructor.$class.staticProperties[k];
                    if (isUndefined(constructor[key])) {    // Already defined members are not overwritten
                        insert(constructor.$class.staticProperties, key);
                        constructor[key] = current.$constructor[key];
                    }
                }

                // Merge the binds
                combine(constructor.$class.binds, current.$constructor.$class.binds);
            }

            delete constructor.prototype.Borrows;
        }
    }

    /**
     * Applies the context of given methods in the target.
     *
     * @param {Array}  fns     The array of functions to be bound
     * @param {Object} context The context that will be bound
     * @param {Object} target  The target class that will have these methods
     */
    function applyBinds(fns, context, target) {

        var i;

        for (i = fns.length - 1; i >= 0; i -= 1) {
            target[fns[i]] = bind(target[fns[i]], context);
        }
    }

    /**
     * Handle class interfaces.
     *
     * @param {Array}  interfs The array of interfaces
     * @param {Object} target  The target that will be checked
     */
    function handleInterfaces(interfs, target) {

        var interfaces = toArray(interfs),
            x = interfaces.length;

//>>includeStart('strict', pragmas.strict);
        // Verify argument type
        if (!x && !isArray(interfs)) {
            throw new TypeError('Implements of class "' + target.prototype.Name + '" must be an interface or an array of interfaces.');
        }
        // Verify duplicate interfaces
        if (x !== unique(interfaces).length && compact(interfaces).length === x) {
            throw new Error('There are duplicate entries in Implements of "' + target.prototype.Name + '".');
        }

        for (x -= 1; x >= 0; x -= 1) {

            // Verify if it's a valid interface
            if (!isFunction(interfaces[x]) || !interfaces[x].$interface) {
                throw new TypeError('Entry at index ' + x + ' in Implements of class "' + target.prototype.Name + '" is not a valid interface.');
            }

            if (!target.$abstract) {
                interfaces[x].$interface.check(target);
            }
            target.$class.interfaces.push(interfaces[x]);
        }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        for (x -= 1; x >= 0; x -= 1) {
            target.$class.interfaces.push(interfaces[x]);
        }
//>>excludeEnd('strict');
    }

    /**
     * Parse binds.
     *
     * @param {Function} constructor The constructor
     */
    function parseBinds(constructor) {

        if (hasOwn(constructor.prototype, 'Binds')) {
//>>includeStart('strict', pragmas.strict);
            var binds = toArray(constructor.prototype.Binds),
                x = binds.length,
                common;
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            var binds = toArray(constructor.prototype.Binds);
//>>excludeEnd('strict');

//>>includeStart('strict', pragmas.strict);
            // Verify arguments type
            if (!x && !isArray(constructor.prototype.Binds)) {
                throw new TypeError('Binds of "' + constructor.prototype.Name + '" must be a string or an array of strings.');
            }
            // Verify duplicate binds
            if (x !== unique(binds).length && compact(binds).length === x) {
                throw new Error('There are duplicate entries in Binds of "' + constructor.prototype.Name + '".');
            }
            // Verify duplicate binds already provided in mixins
            common = intersection(constructor.$class.binds, binds);
            if (common.length > 0) {
                throw new Error('There are binds in "' + constructor.prototype.Name + '" that are already being bound by the parent class and/or mixin: ' + common.join(', '));
            }

            // Verify if all binds are strings reference existent methods
            for (x -= 1; x >= 0; x -= 1) {
                if (!isString(binds[x])) {
                    throw new TypeError('Entry at index ' + x + ' in Borrows of class "' + constructor.prototype.Name + '" is not a string.');
                }
                if (!isFunction(constructor.prototype[binds[x]]) && (!constructor.prototype.Abstracts || !constructor.prototype.Abstracts[binds[x]])) {
                    throw new ReferenceError('Method "' + binds[x] + '" referenced in "' + constructor.prototype.Name + '" binds does not exist.');
                }
            }

//>>includeEnd('strict');
            combine(constructor.$class.binds, binds);
            delete constructor.prototype.Binds;
        }
    }

    /**
     * Parse all the methods, including static ones.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function parseMethods(params, constructor) {

//>>includeStart('strict', pragmas.strict);
        var opts = { type: 'normal', defType: 'class', defName: params.Name },
            optsStatic = { type: 'static', defType: opts.defType, defName: params.Name };

        // Add each method metadata, verifying its signature
        forOwn(params, function (value, key) {

            if (key === 'Statics') {

                if (!isObject(params.Statics)) {
                    throw new TypeError('Statics definition of class "' + params.Name + '" must be an object.');
                }

                checkKeywords(params.Statics, 'statics');

                forOwn(params.Statics, function (value, key) {

                    if (isFunction(value) && !value.$class && !value.$interface) {
                        addMethod(key, value, constructor.$class.staticMethods, optsStatic);
                    } else {
                        insert(constructor.$class.staticProperties, key);
                    }

                    constructor[key] = value;
                });

                delete constructor.prototype.Statics;

            } else if (isFunction(value) && !value.$class && !value.$interface) {
                addMethod(key, value, constructor.$class.methods, opts);
            }
        });
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        // Parse static methods
        if (hasOwn(params, 'Statics')) {

            forOwn(params.Statics, function (value, key) {
                insert(isFunction(value) && !value.$class && !value.$interface ? constructor.$class.staticMethods : constructor.$class.staticProperties, key);
                constructor[key] = value;
            });

            delete constructor.prototype.Statics;
        }
//>>excludeEnd('strict');
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
     * @param {Function} initialize The initialize function
     *
     * @return {Function} The constructor function
     */
    function createConstructor(initialize) {

        var Instance = function () {

            // Reset some types of the object in order for each instance to have their variables
            reset(this);

            // Apply binds
            if (this.$constructor.$class.binds) {
                applyBinds(this.$constructor.$class.binds, this, this);
            }

//>>includeStart('strict', pragmas.strict);
            if (!this.$constructor.$abstract) {
                this.$initializing = true;    // Mark it in order to let abstract classes run their initialize
            }

//>>includeEnd('strict');
            // Call initialize
            initialize.apply(this, arguments);
//>>includeStart('strict', pragmas.strict);

            if (!this.$constructor.$abstract) {
                delete this.$initializing;    // Remove previous mark
            }
//>>includeEnd('strict');
        };

        return Instance;
    }

//>>excludeStart('strict', pragmas.strict);
    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    Class = function Class(params) {

        var classify,
            parent,
            $class = { staticMethods: [], staticProperties: [], interfaces: [], binds: [] },
            k;
//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);
    /**
     * Create a class definition.
     *
     * @param {Object}  params     An object containing methods and properties
     * @param {Boolean} isAbstract Treat this class as abstract
     *
     * @return {Function} The constructor
     */
    Class = function Class(params, isAbstract) {

        var classify,
            parent,
            $class = { methods: {}, staticMethods: {}, staticProperties: [], interfaces: [], binds: [] },
            k;

        // Validate params as an object
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }
        // Validate class name
        if (hasOwn(params, 'Name')) {
            if (!isString(params.Name)) {
                throw new TypeError('Class name must be a string.');
            }
        } else {
            params.Name = 'Unnamed';
        }

        // Verify if the class has abstract methods but is not defined as abstract
        if (hasOwn(params, 'Abstracts') && !isAbstract) {
            throw new Error('Class "' + params.Name + '" has abstract methods, therefore it must be defined as abstract.');
        }

        // Verify reserved words
        checkKeywords(params);
//>>includeEnd('strict');

        if (hasOwn(params, 'Extends')) {
//>>includeStart('strict', pragmas.strict);
            // Verify if parent is a valid class
            if (!isFunction(params.Extends) || !params.Extends.$class) {
                throw new TypeError('Specified parent class in Extends of "' + params.Name + '" is not a valid class.');
            }

//>>includeEnd('strict');
            parent = params.Extends;
            delete params.Extends;

            params.initialize = params.initialize || function () { parent.prototype.initialize.apply(this, arguments); };
            classify = createConstructor(params.initialize, params.Name);
            classify.Super = parent.prototype;
            classify.prototype = createObject(parent.prototype, params);

            // Grab all the methods, static methods, static properties, binds and interfaces metadata from the parent
//>>excludeStart('strict', pragmas.strict);
            append($class.staticMethods, parent.$class.staticMethods);
//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);
            mixIn($class.staticMethods, parent.$class.staticMethods);
//>>includeEnd('strict');
            append($class.staticProperties, parent.$class.staticProperties);
            append($class.binds, parent.$class.binds);
            append($class.interfaces, parent.$class.interfaces);

            // Inherit static methods
//>>includeStart('strict', pragmas.strict);
            forOwn(parent.$class.staticMethods, function (value, k) {
                classify[k] = parent[k];
            });
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            for (k =  parent.$class.staticMethods.length - 1; k >= 0; k -= 1) {
                classify[parent.$class.staticMethods[k]] = parent[parent.$class.staticMethods[k]];
            }
//>>excludeEnd('strict');
        } else {
            params.initialize = params.initialize || function () {};
            classify = createConstructor(params.initialize, params.Name);
            classify.prototype = params;
        }

//>>excludeStart('strict', pragmas.strict);
        delete classify.prototype.Name;

//>>excludeEnd('strict');
        classify.prototype.$constructor = classify;
        classify.$class = $class;
//>>includeStart('strict', pragmas.strict);
        if (isAbstract) {
            classify.$abstract = true;  // Signal it has abstract
        }
//>>includeEnd('strict');

        // Parse methods
        parseMethods(params, classify);

        // Parse mixins
        parseBorrows(classify);

        // Parse binds
        parseBinds(classify);

//>>includeStart('strict', pragmas.strict);
        // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent.$abstract && !isAbstract) {
            parent.$abstract.check(classify);
        }

//>>includeEnd('strict');
        // Handle interfaces
        if (hasOwn(params, 'Implements')) {
            handleInterfaces(params.Implements, classify);
            delete classify.prototype.Implements;
        }

        return classify;
    };

    return Class;
});
