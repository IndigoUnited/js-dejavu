/*jslint browser:true, sloppy:true, forin:true, newcap:true, callee:true*/
/*global define,console*/

define([
//>>includeStart('strict', pragmas.strict);
    'Utils/lang/isString',
    'Utils/array/intersection',
    'Utils/array/unique',
    'Utils/array/compact',
    './common/functionMeta',
    './common/propertyMeta',
    './common/isFunctionCompatible',
    './common/checkKeywords',
    './common/obfuscateProperty',
    './common/hasDefineProperty',
    './common/checkObjectPrototype',
    './common/randomAccessor',
//>>includeEnd('strict');
    'Utils/lang/isFunction',
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/hasOwn',
    'Utils/array/combine',
//>>excludeStart('strict', pragmas.strict);
    'Utils/array/append',
    'Utils/array/insert',
//>>excludeEnd('strict');
    'Utils/lang/bind',
    'Utils/lang/toArray'
], function ClassWrapper(
//>>includeStart('strict', pragmas.strict);
    isString,
    intersection,
    unique,
    compact,
    functionMeta,
    propertyMeta,
    isFunctionCompatible,
    checkKeywords,
    obfuscateProperty,
    hasDefineProperty,
    checkObjectPrototype,
    randomAccessor,
//>>includeEnd('strict');
    isFunction,
    isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    hasOwn,
    combine,
//>>excludeStart('strict', pragmas.strict);
    append,
    insert,
//>>excludeEnd('strict');
    bind,
    toArray
) {

//>>includeStart('strict', pragmas.strict);
    checkObjectPrototype();

    var Class,
        random = randomAccessor(),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        $abstract = '$abstract_' + random,
        cacheKeyword = '$cache_' + random,
        inheriting,
        nextId = 0,
        defaultModifiers = { isStatic: false, isFinal: false, isConst: false };
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    var Class,
        nextId = 0,
        $class = '$class',
        $interface = '$interface';
//>>excludeEnd('strict');

    /**
     * Clones a property in order to make them unique for the instance.
     * This solves the shared properties for types like objects or arrays.
     *
     * @param {Mixed} prop The property
     *
     * @return {Mixed} The cloned property
     */
    function cloneProperty(prop) {

        if (isArray(prop)) {
            return [].concat(prop);
        }
        if (isObject(prop)) {
            return mixIn({}, prop);
        }
        return prop;
    }

//>>includeStart('strict', pragmas.strict);
    /**
     * Adds a method to a class.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *   - isFinal:  true|false Defaults to false
     *
     * @param {String}   name        The method name
     * @param {Function} method      The method itself
     * @param {Function} constructor The class constructor in which the method metadata will be saved
     * @param {Object}   [opts="{}"] The options
     */
    function addMethod(name, method, constructor, opts) {

        var metadata,
            isStatic = !!(opts && opts.isStatic),
            isFinal = !!(opts && opts.isFinal),
            target;

        // Check if function is already being used by another class or within the same class
        if (method.$name) {
            if (method.$name !== name) {
                throw new Error('Method "' + name + '" of class "' + constructor.prototype.$name + '" seems to be used by several times by the same or another class.');
            }
        } else {
            obfuscateProperty(method, '$name', name);
        }

        // If the initialize as inherited, clone the metadata
        if (!isStatic && name === 'initialize' && method.$inherited) {
            metadata = mixIn({}, constructor.$parent[$class].methods[name]);
        } else {
            // Grab function metadata and throw error if is not valid
            metadata = functionMeta(method, name);
            if (metadata === null) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in class "' + constructor.prototype.$name + '".');
            }
        }

        // Check if we we got a private method classified as final
        if (metadata.isPrivate && isFinal) {
            throw new Error('Private method "' + name + '" cannot be classified as final in class "' + constructor.prototype.$name + '".');
        }

        // Check if a property with the same name exists
        target = isStatic ? constructor[$class].staticProperties : constructor[$class].properties;
        if (isObject(target[name])) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" is overwriting a ' + (isStatic ? 'static ' : '') + 'property with the same name in class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor[$class].staticMethods : constructor[$class].methods;

        // Check if the method already exists
        if (isObject(target[name])) {
            // Are we overriding a private method?
            if (target[name].isPrivate) {
                throw new Error('Cannot override private ' + (isStatic ? 'static ' : '') + ' method "' + name + '" in class "' + constructor.prototype.$name + '".');
            }
            // Are we overriding a final method?
            if (target[name].isFinal) {
                throw new Error('Cannot override final method "' + name + '" in class "' + constructor.prototype.$name + '".');
            }
            // Are they compatible?
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in abstract class "' + constructor.prototype.$name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        target[name] = metadata;

        // If the function is protected/private we delete it from the target because they will be protected later
        if (!metadata.isPublic && hasDefineProperty) {

            if (!isStatic) {
                delete constructor.prototype[name];
            } else {
                delete constructor[name];
            }

            metadata.implementation = method;
        } else {
            target = isStatic ? constructor : constructor.prototype;
            target[name] = method;
        }

        if (isFinal) {
            metadata.isFinal = isFinal;
        }

        // Store a reference to the prototype/constructor
        if (!isStatic) {
            obfuscateProperty(method, '$prototype_' + constructor[$class].id, constructor.prototype);
        } else {
            obfuscateProperty(method, '$constructor_' + constructor[$class].id, constructor);
        }
    }

    /**
     * Adds a property to the class methods metadata.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *   - isFinal:  true|false Defaults to false
     *   - isConst:  true|false Defaults to false
     *
     * @param {String}   name        The property name
     * @param {Function} value       The property itself
     * @param {Function} constructor The class constructor in which the method metadata will be saved
     * @param {Object}   [opts="{}"] The options
     */
    function addProperty(name, value, constructor, opts) {

        var metadata = propertyMeta(value, name),
            isStatic = !!(opts && opts.isStatic),
            isFinal = !!(opts && opts.isFinal),
            target;

        // If the property is protected/private we delete it from the target because they will be protected later
        if (!metadata.isPublic && hasDefineProperty) {
            if (!isStatic) {
                delete constructor.prototype[name];
            } else {
                delete constructor[name];
            }
        } else if (isStatic) {
            constructor[name] = cloneProperty(value);
        } else {
            constructor.prototype[name] = value;
        }

        // Check if we we got a private property classified as final
        if (metadata.isPrivate && isFinal) {
            throw new Error('Private property "' + name + '" cannot be classified as final in class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor[$class].staticMethods : constructor[$class].methods;

        // Check if a method with the same name exists
        if (isObject(target[name])) {
            throw new Error((isStatic ? 'Static property' : 'Property') + ' "' + name + '" is overwriting a ' + (isStatic ? 'static ' : '') + 'method with the same name in class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor[$class].staticProperties : constructor[$class].properties;

        if (isObject(target[name])) {
            // Are we overriding a private property?
            if (target[name].isPrivate) {
                throw new Error('Cannot override private ' + (isStatic ? 'static ' : '') + ' property "' + name + ' in class "' + constructor.prototype.$name + '".');
            }
            // Are we overriding a final property?
            if (target[name].isFinal) {
                throw new Error('Cannot override final property "' + name + '" in class "' + constructor.prototype.$name + '".');
            }
        }

        target[name] = metadata;

        if (isFinal) {
            metadata.isFinal = isFinal;
        }

        // Store a reference to the prototype/constructor
        if (!isStatic) {
            metadata['$prototype_' + constructor[$class].id] = constructor.prototype;
        } else {
            metadata['$constructor_' + constructor[$class].id] = constructor;
        }
    }

//>>includeEnd('strict');
    /**
     * Parse borrows (mixins).
     *
     * @param {Function} constructor The constructor
     */
    function parseBorrows(constructor) {

        if (hasOwn(constructor.prototype, '$borrows')) {

//>>includeStart('strict', pragmas.strict);
            var current,
                mixins = toArray(constructor.prototype.$borrows),
                i = mixins.length,
                key,
                value,
                optsStatic = { isStatic: true };
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            var current,
                k,
                key,
                value,
                mixins = toArray(constructor.prototype.$borrows),
                i = mixins.length;
//>>excludeEnd('strict');

//>>includeStart('strict', pragmas.strict);
            // Verify argument type
            if (!i && !isArray(constructor.prototype.$borrows)) {
                throw new TypeError('$borrows of "' + constructor.prototype.$name + '" must be a class/object or an array of classes/objects.');
            }
            // Verify duplicate entries
            if (i !== unique(mixins).length && compact(mixins).length === i) {
                throw new Error('There are duplicate entries defined in $borrows of "' + constructor.prototype.$name + '".');
            }

//>>includeEnd('strict');
            for (i -= 1; i >= 0; i -= 1) {

//>>includeStart('strict', pragmas.strict);
                // Verify each mixin
                if ((!isFunction(mixins[i]) || !mixins[i][$class] || mixins[i][$abstract]) && (!isObject(mixins[i]) || mixins[i].$constructor)) {
                    throw new TypeError('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is not a valid class/object (abstract classes and instances of classes are not supported).');
                }

                if (isObject(mixins[i])) {
                    try {
                        current = Class(mixIn({}, mixins[i])).prototype;
                    } catch (e) {
                        // When an object is being used, throw a more friend message if an error occurs
                        throw new Error('Unable to define object as class at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" (' + e.message + ').');
                    }
                } else {
                    current = mixins[i].prototype;
                }

                // Verify if it has parent
                if (current.$constructor.$parent) {
                    throw new TypeError('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is an inherited class (only root classes not supported).');
                }

//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
                current = isObject(mixins[i]) ? Class(mixIn({}, mixins[i])).prototype : mixins[i].prototype;

                // Grab mixin members
                for (key in current) {

                    value = current[key];

                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        constructor.prototype[key] = value;
                        if (isFunction(value) && !value[$class] && !value[$interface]) {
                            value['$prototype_' + constructor[$class].id] = constructor.prototype;
                            value.$name = key;
                        }
                    }
                }

//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);
                // Grab mixin members
                for (key in current.$constructor[$class].methods) {
                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        addMethod(key, current.$constructor[$class].methods[key].implementation || current[key], constructor);
                    }
                }

                for (key in current.$constructor[$class].properties) {
                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        addProperty(key, current.$constructor[$class].properties[key].value, constructor);
                    }
                }

                // Grab mixin static members
                for (key in current.$constructor[$class].staticMethods) {
                    if (isUndefined(constructor[key])) {              // Already defined members are not overwritten
                        addMethod(key, current.$constructor[$class].staticMethods[key].implementation || current.$constructor[key], constructor, optsStatic);
                    }
                }

                for (key in current.$constructor[$class].staticProperties) {
                    if (isUndefined(constructor[key])) {              // Already defined members are not overwritten
                        addProperty(key, current.$constructor[$class].staticProperties[key].value, constructor, optsStatic);
                    }
                }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
                // Grab mixin static methods
                for (k = current.$constructor[$class].staticMethods.length - 1; k >= 0; k -= 1) {

                    key = current.$constructor[$class].staticMethods[k];

                    if (isUndefined(constructor[key])) {    // Already defined members are not overwritten
                        insert(constructor[$class].staticMethods, key);
                        constructor[key] = current.$constructor[key];
                        constructor[key]['$constructor_' + constructor[$class].id] = constructor;
                        constructor[key].$name = key;
                    }
                }

                // Grab mixin static properties
                for (key in current.$constructor[$class].staticProperties) {

                    value = current.$constructor[$class].staticProperties[key];

                    if (isUndefined(constructor[key])) {              // Already defined members are not overwritten
                        constructor[$class].staticProperties[key] = value;
                        constructor[key] = cloneProperty(value);
                    }
                }
//>>excludeEnd('strict');

                // Merge the binds
                combine(constructor[$class].binds, current.$constructor[$class].binds);
            }

            delete constructor.prototype.$borrows;
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
            throw new TypeError('$implements of class "' + target.prototype.$name + '" must be an interface or an array of interfaces.');
        }
        // Verify duplicate interfaces
        if (x !== unique(interfaces).length && compact(interfaces).length === x) {
            throw new Error('There are duplicate entries in $implements of "' + target.prototype.$name + '".');
        }

        for (x -= 1; x >= 0; x -= 1) {

            // Verify if it's a valid interface
            if (!isFunction(interfaces[x]) || !interfaces[x][$interface]) {
                throw new TypeError('Entry at index ' + x + ' in $implements of class "' + target.prototype.$name + '" is not a valid interface.');
            }

            if (!target[$abstract]) {
                interfaces[x][$interface].check(target);
            }
            target[$class].interfaces.push(interfaces[x]);
        }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        for (x -= 1; x >= 0; x -= 1) {
            target[$class].interfaces.push(interfaces[x]);
        }
//>>excludeEnd('strict');
    }

    /**
     * Parse binds.
     *
     * @param {Function} constructor The constructor
     */
    function parseBinds(constructor) {

        if (hasOwn(constructor.prototype, '$binds')) {
//>>includeStart('strict', pragmas.strict);
            var binds = toArray(constructor.prototype.$binds),
                x = binds.length,
                common;
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            var binds = toArray(constructor.prototype.$binds);
//>>excludeEnd('strict');

//>>includeStart('strict', pragmas.strict);
            // Verify arguments type
            if (!x && !isArray(constructor.prototype.$binds)) {
                throw new TypeError('$binds of "' + constructor.prototype.$name + '" must be a string or an array of strings.');
            }
            // Verify duplicate binds
            if (x !== unique(binds).length && compact(binds).length === x) {
                throw new Error('There are duplicate entries in $binds of "' + constructor.prototype.$name + '".');
            }
            // Verify duplicate binds already provided in mixins
            common = intersection(constructor[$class].binds, binds);
            if (common.length > 0) {
                throw new Error('There are binds in "' + constructor.prototype.$name + '" that are already being bound by the parent class and/or mixin: ' + common.join(', '));
            }

            // Verify if all binds are strings reference existent methods
            for (x -= 1; x >= 0; x -= 1) {
                if (!isString(binds[x])) {
                    throw new TypeError('Entry at index ' + x + ' in $borrows of class "' + constructor.prototype.$name + '" is not a string.');
                }
                if (!constructor[$class].methods[binds[x]] && (!constructor.prototype.$abstracts || !constructor.prototype.$abstracts[binds[x]])) {
                    throw new ReferenceError('Method "' + binds[x] + '" referenced in "' + constructor.prototype.$name + '" binds does not exist.');
                }
            }

//>>includeEnd('strict');
            combine(constructor[$class].binds, binds);
            delete constructor.prototype.$binds;
        }
    }

    /**
     * Parse an object members.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     * @param {Boolean}  isFinal     Parse the members as finals
     */
    function parseMembers(params, constructor, isFinal) {

//>>excludeStart('strict', pragmas.strict);
        var key,
            value;
//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);
        var opts = { isFinal: !!isFinal },
            key,
            value;
        // Add each method metadata, verifying its signature
//>>includeEnd('strict');

        // TODO: use hasOwn here?
        // TODO: parse statics outside the if
        for (key in params) {

            if (key === '$statics') {

//>>includeStart('strict', pragmas.strict);
                if (!isObject(params.$statics)) {
                    throw new TypeError('$statics definition of class "' + params.$name + '" must be an object.');
                }

                checkKeywords(params.$statics, 'statics');
                opts.isStatic = true;

//>>includeEnd('strict');
                for (key in params.$statics) {

                    value = params.$statics[key];

//>>includeStart('strict', pragmas.strict);
                    if (isFunction(value) && !value[$class] && !value[$interface]) {
                        addMethod(key, value, constructor, opts);
                    } else {
                        addProperty(key, value, constructor, opts);
                    }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
                    if (isFunction(value) && !value[$class] && !value[$interface]) {
                        insert(constructor[$class].staticMethods, key);
                        value['$constructor_' + constructor[$class].id] = constructor;
                        value.$name = key;
                    } else {
                        constructor[$class].staticProperties[key] = value;
                    }

                    constructor[key] = value;
//>>excludeEnd('strict');
                }

//>>includeStart('strict', pragmas.strict);
                delete opts.isStatic;
//>>includeEnd('strict');
                delete params.$statics;
            } else {

                value = params[key];

//>>includeStart('strict', pragmas.strict);
                if (key.charAt(0) !== '$' || (key !== '$name' && key !== '$binds' && key !== '$borrows' && key !== '$implements' && key !== '$abstracts')) {

                    if (isFunction(value) && !value[$class] && !value[$interface]) {
                        addMethod(key, value, constructor, opts);
                    } else {
                        addProperty(key, value, constructor, opts);
                    }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
                if (key.charAt(0) !== '$' || (key !== '$binds' && key !== '$borrows' && key !== '$implements' && key !== '$abstracts')) {

                    if (isFunction(value) && !value[$class] && !value[$interface]) {
                        value['$prototype_' + constructor[$class].id] = constructor.prototype;
                        value.$name = key;
                    }

                    if (isFinal) {
                        constructor.prototype[key] = value;
                    }
//>>excludeEnd('strict');
                }
            }
        }
    }

    /**
     * Parse all the class members, including finals, static and constants.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     * @param {Boolean}  isFinal     Parse the members as finals
     */
    function parseClass(params, constructor) {

//>>includeStart('strict', pragmas.strict);
        var opts = { },
            key,
            value,
            saved = {},
            has = {};
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        var key,
            value,
            saved = {},
            has = {};

//>>excludeEnd('strict');

         // Save constants & finals to parse later
         if (hasOwn(params, '$constants')) {
//>>includeStart('strict', pragmas.strict);

             if (!isObject(params.$constants)) {
                throw new TypeError('$constants of class "' + constructor.prototype.$name + '" must be an object.');
             }

//>>includeEnd('strict');
             saved.$constants = params.$constants;
             has.$constants = true;
             delete params.$constants;
         }

         if (hasOwn(params, '$finals')) {
//>>includeStart('strict', pragmas.strict);

             if (!isObject(params.$finals)) {
                throw new TypeError('$finals of class "' + constructor.prototype.$name + '" must be an object.');
             }

//>>includeEnd('strict');
             saved.$finals = params.$finals;
             has.$finals = true;
             delete params.$finals;
         }

        // Parse members
        parseMembers(params, constructor);

        // Parse constants
        if (has.$constants) {

//>>includeStart('strict', pragmas.strict);
            opts.isConst = true;

//>>includeEnd('strict');
            for (key in params.$constants) {

                value = params.$constants[key];

//>>includeStart('strict', pragmas.strict);
                if (!isNumber(value) && !isString(value) && !isRegExp(value)) {
                    throw new Error('Value for constant "' + key + '" defined in class "' + params.$name + '" must be a number, a string or a regular expression.');
                }

                addProperty(key, value, constructor, opts);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
                constructor[$class].staticProperties[key] = value;
                constructor[key] = value;
//>>excludeEnd('strict');
            }

//>>includeStart('strict', pragmas.strict);
            delete opts.isConst;
//>>includeEnd('strict');
        }

        // Parse finals
        if (has.$finals) {
            parseMembers(saved.$finals, constructor, true);
        }
    }

    /**
     * Applies the context of given methods in the target.
     *
     * @param {Array}  fns      The array of functions to be bound
     * @param {Object} instance The target instance
     */
    function applyBinds(fns, instance) {

        var i,
            current;

        for (i = fns.length - 1; i >= 0; i -= 1) {
            current = instance[fns[i]];
            instance[fns[i]] = bind(current, instance);
            instance[fns[i]]['$prototype_' + instance.$constructor[$class].id] = current['$prototype_' + instance.$constructor[$class].id];
            instance[fns[i]].$name = current.$name;
        }
    }

//>>includeStart('strict', pragmas.strict);
    /**
     * Protects a method according to its visibility.
     *
     * @param {String} name     The method name
     * @param {Object} meta     The function meta
     * @param {Object} instance The instance that will have the method
     */
    function protectMethod(name, meta, instance) {

        if (meta.isPrivate) {

            instance[cacheKeyword].methods[name] = meta.implementation;

            Object.defineProperty(instance, name, {
                get: function get() {

                    var method = this[cacheKeyword].methods[name],
                        caller = get.caller || arguments.callee.caller || arguments.caller;

                    if (this.$initializing || method['$prototype_' + this.$constructor[$class].id] === caller['$prototype_' + this.$constructor[$class].id]) {
                        return method;
                    }

                    throw new Error('Cannot access private method "' + name + '" of class "' + this.$name + '".');
                },
                set: function set(newVal) {

                    if (this.$initializing) {
                        this[cacheKeyword].methods[name] = newVal;
                    } else {
                        throw new Error('Cannot set private method "' + name + '" of class "' + this.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {

            instance[cacheKeyword].methods[name] = meta.implementation;

            Object.defineProperty(instance, name, {
                get: function get() {

                    var method = this[cacheKeyword].methods[name],
                        caller = get.caller || arguments.callee.caller || arguments.caller;

                    if (this.$initializing ||
                            caller['$prototype_' + this.$constructor[$class].id] === method['$prototype_' + this.$constructor[$class].id] ||
                            caller['$prototype_' + this.$constructor[$class].id] instanceof method['$prototype_' + this.$constructor[$class].id].$constructor ||
                            (caller['$prototype_' + this.$constructor[$class].id] && method['$prototype_' + this.$constructor[$class].id] instanceof caller['$prototype_' + this.$constructor[$class].id].$constructor)) {
                        return method;
                    }

                    throw new Error('Cannot access protected method "' + name + '" of class "' + this.$name + '".');
                },
                set: function set(newVal) {

                    if (this.$initializing) {
                        this[cacheKeyword].methods[name] = newVal;
                    } else {
                        throw new Error('Cannot set protected method "' + name + '" of class "' + this.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        }
    }

    /**
     * Protects a static method according to its visibility.
     *
     * @param {String}   name        The method name
     * @param {Object}   meta        The function meta
     * @param {Function} constructor The constructor that will have the method
     */
    function protectStaticMethod(name, meta, constructor) {

        if (meta.isPrivate) {

            constructor[cacheKeyword].methods[name] = meta.implementation;

            Object.defineProperty(constructor, name, {
                get: function get() {

                    var method = this[cacheKeyword].methods[name],
                        caller = get.caller || arguments.callee.caller || arguments.caller;

                    if (method['$constructor_' + this[$class].id] === caller['$constructor_' + this[$class].id] ||
                            method['$constructor_' + this[$class].id].prototype === caller['$prototype_' + this[$class].id]) {
                        return method;
                    }

                    throw new Error('Cannot access private static method "' + name + '" of class "' + this.prototype.$name + '".');
                },
                set: function set() {
                    throw new Error('Cannot set private static method "' + name + '" of class "' + this.prototype.$name + '".');
                },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {

            constructor[cacheKeyword].methods[name] = meta.implementation;

            Object.defineProperty(constructor, name, {
                get: function get() {

                    var method = this[cacheKeyword].methods[name],
                        caller = get.caller || arguments.callee.caller || arguments.caller;

                    if (inheriting ||
                            (caller['$constructor_' + this[$class].id] && (
                                method['$constructor_' + this[$class].id] === caller['$constructor_' + this[$class].id] ||
                                method['$constructor_' + this[$class].id].prototype instanceof caller['$constructor_' + this[$class].id] ||
                                caller['$constructor_' + this[$class].id].prototype instanceof method['$constructor_' + this[$class].id]
                            )) ||
                            (caller['$prototype_' + this[$class].id] && (
                                method['$constructor_' + this[$class].id] === caller['$prototype_' + this[$class].id].$constructor ||
                                method['$constructor_' + this[$class].id].prototype instanceof caller['$prototype_' + this[$class].id].$constructor ||
                                caller['$prototype_' + this[$class].id] instanceof method['$constructor_' + this[$class].id]
                            ))) {
                        return method;
                    }

                    throw new Error('Cannot access protected static method "' + name + '" of class "' + this.prototype.$name + '".');
                },
                set: function set() {
                    throw new Error('Cannot set protected static method "' + name + '" of class "' + this.prototype.$name + '".');
                },
                configurable: false,
                enumerable: false
            });
        }
    }

    /**
     * Protects a property according to its visibility.
     *
     * @param {String} name     The property name
     * @param {Object} meta     The property meta
     * @param {Object} instance The instance that will have the property
     */
    function protectProperty(name, meta, instance) {

        if (meta.isPrivate) {

            instance[cacheKeyword].properties[name] = cloneProperty(meta.value);

            Object.defineProperty(instance, name, {
                get: function get() {

                    var caller = get.caller || arguments.callee.caller || arguments.caller;

                    if (this.$initializing || meta['$prototype_' + this.$constructor[$class].id] === caller['$prototype_' + this.$constructor[$class].id]) {
                        return this[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access private property "' + name + '" of class "' + this.$name + '".');
                },
                set: function set(newValue) {

                    var caller = set.caller || arguments.callee.caller || arguments.caller;

                    if (this.$initializing || meta['$prototype_' + this.$constructor[$class].id] === caller['$prototype_' + this.$constructor[$class].id]) {
                        this[cacheKeyword].properties[name] = newValue;
                    } else {
                        throw new Error('Cannot set private property "' + name + '" of class "' + this.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {

            instance[cacheKeyword].properties[name] = cloneProperty(meta.value);

            Object.defineProperty(instance, name, {
                get: function get() {

                    var caller = get.caller || arguments.callee.caller || arguments.caller;

                    if (this.$initializing ||
                            caller['$prototype_' + this.$constructor[$class].id] === meta['$prototype_' + this.$constructor[$class].id] ||
                            caller['$prototype_' + this.$constructor[$class].id] instanceof meta['$prototype_' + this.$constructor[$class].id].$constructor ||
                            (caller['$prototype_' + this.$constructor[$class].id] && meta['$prototype_' + this.$constructor[$class].id] instanceof caller['$prototype_' + this.$constructor[$class].id].$constructor)) {
                        return this[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access protected property "' + name + '" of class "' + this.$name + '".');
                },
                set: function set(newValue) {

                    var caller = set.caller || arguments.callee.caller || arguments.caller;

                    if (this.$initializing ||
                            caller['$prototype_' + this.$constructor[$class].id] === meta['$prototype_' + this.$constructor[$class].id] ||
                            caller['$prototype_' + this.$constructor[$class].id] instanceof meta['$prototype_' + this.$constructor[$class].id].$constructor ||
                            (caller['$prototype_' + this.$constructor[$class].id] && meta['$prototype_' + this.$constructor[$class].id] instanceof caller['$prototype_' + this.$constructor[$class].id].$constructor)) {
                        this[cacheKeyword].properties[name] = newValue;
                    } else {
                        throw new Error('Cannot set protected property "' + name + '" of class "' + this.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else {
            instance[name] = cloneProperty(meta.value);
        }
    }

    /**
     * Protects a static property according to its visibility.
     *
     * @param {String}   name        The property name
     * @param {Object}   meta        The property meta
     * @param {Function} constructor The constructor that will have the property
     */
    function protectStaticProperty(name, meta, constructor) {

        if (meta.isPrivate) {

            constructor[cacheKeyword].properties[name] = cloneProperty(meta.value);

            Object.defineProperty(constructor, name, {
                get: function get() {

                    var caller = get.caller || arguments.callee.caller || arguments.caller;

                    if (meta['$constructor_' + this[$class].id] === caller['$constructor_' + this[$class].id] ||
                            meta['$constructor_' + this[$class].id].prototype === caller['$prototype_' + this[$class].id]
                            ) {
                        return this[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access private static property "' + name + '" of class "' + this.prototype.$name + '".');
                },
                set: function set(newValue) {

                    var caller = set.caller || arguments.callee.caller || arguments.caller;

                    if (meta['$constructor_' + this[$class].id] === caller['$constructor_' + this[$class].id] ||
                            meta['$constructor_' + this[$class].id].prototype === caller['$prototype_' + constructor[$class].id]
                            ) {
                        this[cacheKeyword].properties[name] = newValue;
                    } else {
                        throw new Error('Cannot set private property "' + name + '" of class "' + this.prototype.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {

            constructor[cacheKeyword].properties[name] = cloneProperty(meta.value);

            Object.defineProperty(constructor, name, {
                get: function get() {

                    var method = this[cacheKeyword].properties[name],
                        caller = get.caller || arguments.callee.caller || arguments.caller;

                    if (inheriting ||
                            (caller['$constructor_' + this[$class].id] && (
                                meta['$constructor_' + this[$class].id] === caller['$constructor_' + this[$class].id] ||
                                meta['$constructor_' + this[$class].id].prototype instanceof caller['$constructor_' + this[$class].id] ||
                                caller['$constructor_' + this[$class].id].prototype instanceof meta['$constructor_' + this[$class].id]
                            )) ||
                            (caller['$prototype_' + this[$class].id] && (
                                meta['$constructor_' + this[$class].id] === caller['$prototype_' + this[$class].id].$constructor ||
                                meta['$constructor_' + this[$class].id].prototype instanceof caller['$prototype_' + this[$class].id].$constructor ||
                                caller['$prototype_' + this[$class].id] instanceof meta['$constructor_' + this[$class].id]
                            ))) {
                        return method;
                    }

                    throw new Error('Cannot access protected static method "' + name + '" of class "' + this.prototype.$name + '".');
                },
                set: function set(newValue) {

                    var caller = set.caller || arguments.callee.caller || arguments.caller;

                    if (inheriting ||
                            meta['$constructor_' + this[$class].id] === caller['$constructor_' + this[$class].id] ||
                            (caller['$constructor_' + this[$class].id] && (
                                meta['$constructor_' + this[$class].id].prototype instanceof caller['$constructor_' + this[$class].id] ||
                                caller['$constructor_' + this[$class].id].prototype instanceof meta['$constructor_' + this[$class].id]
                            )) ||
                            (caller['$prototype_' + this[$class].id] && (
                                meta['$constructor_' + this[$class].id] === caller['$prototype_' + this[$class].id].$constructor ||
                                meta['$constructor_' + this[$class].id].prototype instanceof caller['$prototype_' + this[$class].id].$constructor ||
                                caller['$prototype_' + this[$class].id] instanceof meta['$constructor_' + this[$class].id]
                            ))) {
                        this[cacheKeyword].properties[name] = newValue;
                    } else {
                        throw new Error('Cannot set protected property "' + name + '" of class "' + this.prototype.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        }
    }

    /**
     * Protects an instance.
     *
     * All its methods and properties will be secured according to their visibility.
     *
     * @param {Object} instance The instance to be protected
     */
    function protectInstance(instance) {

        var key;

        obfuscateProperty(instance, cacheKeyword, { properties: {}, methods: {} });

        for (key in instance.$constructor[$class].methods) {
            protectMethod(key, instance.$constructor[$class].methods[key], instance);
        }

        for (key in instance.$constructor[$class].properties) {
            protectProperty(key, instance.$constructor[$class].properties[key], instance);
        }
    }

    /**
     * Protects a constructor.
     *
     * All its methods and properties will be secured according to their visibility.
     *
     * @param {Function} constructor The constructor to be protected
     */
    function protectConstructor(constructor) {

        var key;

        obfuscateProperty(constructor, cacheKeyword, { properties: {}, methods: {} });

        for (key in constructor[$class].staticMethods) {
            protectStaticMethod(key, constructor[$class].staticMethods[key], constructor);
        }

        for (key in constructor[$class].staticProperties) {
            protectStaticProperty(key, constructor[$class].staticProperties[key], constructor);
        }

        // Prevent any properties/methods to be added and deleted
        if (isFunction(Object.seal)) {
            Object.seal(constructor);
            Object.seal(constructor.prototype);
        }
    }

    /**
     * Builds the constructor function that calls the initialize and do
     * more things internally.
     *
     * @param {Function} initialize The initialize function
     * @param {Boolean}  isAbstract Treat this class as abstract
     *
     * @return {Function} The constructor function
     */
    function createConstructor(initialize, isAbstract) {
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    /**
     * Builds the constructor function that calls the initialize and do
     * more things internally.
     *
     * @param {Function} initialize The initialize function
     *
     * @return {Function} The constructor function
     */
    function createConstructor(initialize) {
//>>excludeEnd('strict');

        var Instance = function () {

            var key;

//>>includeStart('strict', pragmas.strict);
            // If it's abstract, it canot be instantiated
            if (isAbstract) {
                throw new Error('An abstract class cannot be instantiated.');
            }

            this.$initializing = true;    // Mark it in order to let abstract classes run their initialize

            // Apply private/protected members
            if (hasDefineProperty) {
                protectInstance(this);
            } else {
                // Reset some types of the object in order for each instance to have their variables
                for (key in this) {
                    this[key] = cloneProperty(this[key]);
                }
            }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            // Reset some types of the object in order for each instance to have their variables
            for (key in this) {
                this[key] = cloneProperty(this[key]);
            }
//>>excludeEnd('strict');

            // Apply binds
            applyBinds(this.$constructor[$class].binds, this, this);

//>>includeStart('strict', pragmas.strict);
            delete this.$initializing;

            // Prevent any properties/methods to be added and deleted
            if (isFunction(Object.seal)) {
                Object.seal(this);
            }

//>>includeEnd('strict');
            // Call initialize
            initialize.apply(this, arguments);
        };

//>>includeStart('strict', pragmas.strict);
        obfuscateProperty(Instance, $class, { methods: {}, properties: {}, staticMethods: {}, staticProperties: {}, interfaces: [], binds: [] });
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
        Instance[$class] = { staticMethods: [], staticProperties: {}, interfaces: [], binds: [] };
//>>excludeEnd('strict');

        return Instance;
    }

    /**
     * Inherits aditional data from the parent, such as metadata, binds and static members.
     *
     * @param {Function} constructor The constructor
     * @param {Function} parent      The parent
     */
    function inheritParent(constructor, parent) {

        var x,
            binds = parent[$class].binds,
            key,
            value;

        // Inherit binds
        for (x = binds.length - 1; x >= 0; x -= 1) {
            if (binds[x].substr(0, 2) !== '__') {
                constructor[$class].binds.push(binds[x]);
            }
        }

        // Inherit static methods and properties
//>>excludeStart('strict', pragmas.strict);
        append(constructor[$class].staticMethods, parent[$class].staticMethods);

        for (x =  parent[$class].staticMethods.length - 1; x >= 0; x -= 1) {
            if (parent[$class].staticMethods[x].substr(0, 2) !== '__') {
                constructor[parent[$class].staticMethods[x]] = parent[parent[$class].staticMethods[x]];
            }
        }

        for (key in parent[$class].staticProperties) {

            value = parent[$class].staticProperties[key];

            if (key.substr(0, 2) !== '__') {
                constructor[$class].staticProperties[key] = value;
                constructor[key] = cloneProperty(value);
            }
        }
//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);
        inheriting = true;

        // Grab methods and properties definitions
        for (key in parent[$class].methods) {
            constructor[$class].methods[key] = parent[$class].methods[key];
        }

        for (key in parent[$class].properties) {
            constructor[$class].properties[key] = parent[$class].properties[key];
        }

        // Inherit static methods and properties
        for (key in parent[$class].staticMethods) {

            value = parent[$class].staticMethods[key];

            if (!value.isPrivate) {
                constructor[$class].staticMethods[key] = value;
                constructor[key] = parent[key];
            }
        }

        for (key in parent[$class].staticProperties) {

            value = parent[$class].staticProperties[key];

            if (!value.isPrivate) {
                constructor[$class].staticProperties[key] = value;
                constructor[key] = cloneProperty(value.value);
            }
        }

        inheriting = false;
//>>includeEnd('strict');
    }

    /**
     * Creates a function that will be used to call a parent method.
     *
     * @param {String} classId The unique class id
     *
     * @return {Function} The function
     */
    function superAlias(classId) {

        return function parent() {

//>>includeStart('strict', pragmas.strict);
            var caller = parent.caller || arguments.callee.caller || arguments.caller,
                meta,
                alias;

            if (!caller.$name || !caller['$prototype_' + classId]) {
                throw new Error('Calling parent method within an unknown function.');
            }
            if (!caller['$prototype_' + classId].$constructor.$parent) {
                throw new Error('Cannot call parent method "' + (caller.$name || 'N/A') + '" in class "' + this.$name + '".');
            }

            meta = caller['$prototype_' + classId].$constructor[$class].methods[caller.$name];

            if (meta.isPrivate) {
                throw new Error('Cannot call $super() within private methods in class "' + this.$name + '".');
            }

            if (meta.isPublic || !hasDefineProperty) {

                alias = caller['$prototype_' + classId].$constructor.$parent.prototype[caller.$name];

                if (!alias) {
                    throw new Error('Cannot call parent method "' + (caller.$name || 'N/A') + '" in class "' + this.$name + '".');
                }

                return alias.apply(this, arguments);

            }

            alias = caller['$prototype_' + classId].$constructor.$parent[$class].methods[caller.$name];

            if (!alias) {
                throw new Error('Cannot call parent method "' + (caller.$name || 'N/A') + '" in class "' + this.$name + '".');
            }

            return alias.implementation.apply(this, arguments);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            var caller = parent.caller || arguments.callee.caller || arguments.caller;

            return caller['$prototype_' + classId].$constructor.$parent.prototype[caller.$name].apply(this, arguments);
//>>excludeEnd('strict');
        };
    }

    /**
     * Creates a function that will be used to access the static members of itself.
     *
     * @param {String} classId The unique class id
     *
     * @return {Function} The function
     */
    function selfAlias(classId) {

        return function self() {

            var caller = self.caller || arguments.callee.caller || arguments.caller;

//>>includeStart('strict', pragmas.strict);
            if (!caller['$prototype_' + classId]) {
                throw new Error('Cannot retrieve self alias within an unknown function.');
            }

//>>includeEnd('strict');
            return caller['$prototype_' + classId].$constructor;
        };
    }

    /**
     * Creates a function that will be used to access the static methods of itself (with late binding).
     *
     * @return {Function} The function
     */
    function staticAlias() {
        return this.$constructor;
    }

    /**
     * Creates a function that will be used to call a parent static method.
     *
     * @param {String} classId The unique class id
     *
     * @return {Function} The function
     */
    function superStaticAlias(classId) {

        return function parent() {

//>>includeStart('strict', pragmas.strict);
            var caller = parent.caller || arguments.callee.caller || arguments.caller,
                meta,
                alias;

            if (!caller.$name || !caller['$constructor_' + classId]) {
                throw new Error('Calling parent static method within an unknown function.');
            }

            if (!caller['$constructor_' + classId].$parent) {
                throw new Error('Cannot call parent static method "' + caller.$name || 'N/A' + '" in class "' + this.$name + '".');
            }

            meta = caller['$constructor_' + classId][$class].staticMethods[caller.$name];

            if (meta.isPrivate) {
                throw new Error('Cannot call $super() within private static methods in class "' + this.$name + '".');
            }

            if (meta.isPublic || !hasDefineProperty) {

                alias = caller['$constructor_' + classId].$parent[caller.$name];

                if (!alias) {
                    throw new Error('Cannot call parent static method "' + caller.$name || 'N/A' + '" in class "' + this.$name + '".');
                }

                return alias.apply(this, arguments);
            }

            alias = caller['$constructor_' + classId].$parent[$class].staticMethods[caller.$name];

            if (!alias) {
                throw new Error('Cannot call parent static method "' + caller.$name || 'N/A' + '" in class "' + this.$name + '".');
            }

            return alias.implementation.apply(this, arguments);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            var caller = parent.caller || arguments.callee.caller || arguments.caller;

            return caller['$constructor_' + classId].$parent[caller.$name].apply(this, arguments);
//>>excludeEnd('strict');
        };
    }

//>>includeStart('strict', pragmas.strict);
    /**
     * Method that will print a readable string describing an instance.
     *
     * @return {String} The readable string
     */
    function toStringInstance() {
        return '[instance #' + this.$name + ']';
    }

    /**
     * Method that will print a readable string describing an instance.
     *
     * @return {String} The readable string
     */
    function toStringConstructor() {
        return '[constructor #' + this.prototype.$name + ']';
    }

//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    Class = function Class(params) {

        delete params.$name;
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

        // Validate params as an object
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }
        // Validate class name
        if (hasOwn(params, '$name')) {
            if (!isString(params.$name)) {
                throw new TypeError('Class name must be a string.');
            } else if (/\s+/.test(params.$name)) {
                throw new TypeError('Class name cannot have spaces.');
            }
        } else {
            params.$name = 'Unnamed';
        }

        // Verify if the class has abstract methods but is not defined as abstract
        if (hasOwn(params, '$abstracts') && !isAbstract) {
            throw new Error('Class "' + params.$name + '" has abstract methods, therefore it must be defined as abstract.');
        }

        // Verify if initialize is a method
        if (hasOwn(params, 'initialize')) {
            if (!isFunction(params.initialize)) {
                throw new Error('The "initialize" member of class "' + params.$name + '" must be a function.');
            }
        }

        // Verify reserved words
        checkKeywords(params);
//>>includeEnd('strict');

        var classify,
            parent;

        if (hasOwn(params, '$extends')) {
//>>includeStart('strict', pragmas.strict);
            // Verify if parent is a valid class
            if (!isFunction(params.$extends) || !params.$extends[$class]) {
                throw new TypeError('Specified parent class in $extends of "' + params.$name + '" is not a valid class.');
            }

//>>includeEnd('strict');
            parent = params.$extends;
            delete params.$extends;

//>>includeStart('strict', pragmas.strict);
            if (!hasOwn(params, 'initialize')) {
                params.initialize = function () { parent.prototype.initialize.apply(this, arguments); };
                obfuscateProperty(params.initialize, '$inherited', true);
            }

            classify = createConstructor(params.initialize, isAbstract);
            obfuscateProperty(classify, '$parent', parent);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            params.initialize = params.initialize || function () { parent.prototype.initialize.apply(this, arguments); };
            classify = createConstructor(params.initialize);
            classify.$parent = parent;
//>>excludeEnd('strict');
            classify[$class].id = parent[$class].id;
            classify.prototype = createObject(parent.prototype, params);

            inheritParent(classify, parent);
        } else {
            params.initialize = params.initialize || function () {};
//>>includeStart('strict', pragmas.strict);
            classify = createConstructor(params.initialize, isAbstract);
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
            classify = createConstructor(params.initialize);
//>>excludeEnd('strict');
            classify[$class].id = nextId += 1;
            classify.prototype = params;

            // Assign aliases
//>>excludeStart('strict', pragmas.strict);
            classify.prototype.$super = superAlias(classify[$class].id);
            classify.prototype.$self = selfAlias(classify[$class].id);
            classify.prototype.$static = staticAlias;
//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);
            obfuscateProperty(classify.prototype, '$super', superAlias(classify[$class].id));
            obfuscateProperty(classify.prototype, '$self', selfAlias(classify[$class].id));
            obfuscateProperty(classify.prototype, '$static', staticAlias);
//>>includeEnd('strict');
        }

//>>includeStart('strict', pragmas.strict);
        if (isAbstract) {
            obfuscateProperty(classify, '$abstract_' + random, true, true); // Signal it has abstract
        }
//>>includeEnd('strict');

        // Parse class members
        parseClass(params, classify);

        // Assign constructor & static parent alias
//>>excludeStart('strict', pragmas.strict);
        classify.prototype.$constructor = classify;
        classify.$super = superStaticAlias(classify[$class].id);
//>>excludeEnd('strict');
//>>includeStart('strict', pragmas.strict);
        obfuscateProperty(classify.prototype, '$constructor', classify);
        obfuscateProperty(classify, '$super', superStaticAlias(classify[$class].id));
//>>includeEnd('strict');

        // Parse mixins
        parseBorrows(classify);

        // Parse binds
        parseBinds(classify);

//>>includeStart('strict', pragmas.strict);
        // Add toString() if not defined yet
        if (params.toString === Object.prototype.toString) {
            obfuscateProperty(classify.prototype, 'toString', toStringInstance, true);
        }
        if (classify.toString === Function.prototype.toString) {
            obfuscateProperty(classify, 'toString', toStringConstructor, true);
        }

        // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent[$abstract] && !isAbstract) {
            parent[$abstract].check(classify);
        }
//>>includeEnd('strict');

        // Handle interfaces
        if (hasOwn(params, '$implements')) {
            handleInterfaces(params.$implements, classify);
            delete classify.prototype.$implements;
        }

        // Remove abstracts reference
        if (hasOwn(params, '$abstracts')) {
            delete params.$abstracts;
        }
//>>includeStart('strict', pragmas.strict);

        // Prevent any properties/methods to be added and deleted
        if (hasDefineProperty) {
            protectConstructor(classify);
        }

//>>includeEnd('strict');

        return classify;
    };

    return Class;
});
