define([
    'mout/lang/isBoolean',
    'mout/array/intersection',
    'mout/array/unique',
    'mout/array/compact',
    'mout/array/remove',
    'mout/object/keys',
    'mout/object/size',
    './lib/functionMeta',
    './lib/propertyMeta',
    './lib/isFunctionCompatible',
    './lib/checkKeywords',
    './lib/testKeywords',
    './lib/hasDefineProperty',
    './lib/checkObjectPrototype',
    './lib/randomAccessor',
    './options',
    './lib/inspect',
    './lib/printWarning',
    './lib/obfuscateProperty',
    './lib/isImmutable',
    'mout/lang/isString',
    'mout/lang/isFunction',
    'mout/lang/isObject',
    'mout/lang/isArray',
    'mout/lang/isDate',
    'mout/lang/isRegExp',
    'mout/lang/createObject',
    'mout/object/hasOwn',
    'mout/array/combine',
    'mout/array/contains',
    'mout/lang/deepClone',
    './lib/mixIn',
    'mout/function/bind',
    'mout/lang/toArray',
    'mout/array/insert'
], function ClassWrapper(
    isBoolean,
    intersection,
    unique,
    compact,
    remove,
    keys,
    size,
    functionMeta,
    propertyMeta,
    isFunctionCompatible,
    checkKeywords,
    testKeywords,
    hasDefineProperty,
    checkObjectPrototype,
    randomAccessor,
    options,
    inspect,
    printWarning,
    obfuscateProperty,
    isImmutable,
    isString,
    isFunction,
    isObject,
    isArray,
    isDate,
    isRegExp,
    createObject,
    hasOwn,
    combine,
    contains,
    deepClone,
    mixIn,
    bind,
    toArray,
    insert
) {

    'use strict';

    checkObjectPrototype();

    var createClass,
        Class = {},
        random = randomAccessor('ClassWrapper'),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        $abstract = '$abstract_' + random,
        $bound = '$bound_' + random,
        $name = '$name_' + random,
        $anonymous = '$anonymous_' + random,
        $wrapped = '$wrapped_' + random,
        cacheKeyword = '$cache_' + random,
        redefinedCacheKeyword = '$redefined_cache_' + random,
        nextId = 0,
        caller = null,
        toStringInstance,
        toStringConstructor,
        glob = typeof window !== 'undefined' && window.navigator && window.document ? window : global;

    /**
     * Function that does exactly the same as the mout counterpart,
     * but is faster in firefox due to a bug:
     * https://bugzilla.mozilla.org/show_bug.cgi?id=816439
     */
    function inheritPrototype(A, B) {
        var F = function () {};
        F.prototype = B.prototype;
        A.prototype = new F();
        A.prototype.constructor = A;
    }

    /**
     * Wraps a method.
     * Makes some aliases, such as $super and $self, work correctly.
     *
     * @param {String}   name        The method name
     * @param {Function} method      The method to wrap
     * @param {Function} constructor The constructor
     *
     * @return {Function} The wrapper
     */
    function wrapMethod(name, method, constructor, isStatic) {
        if (method[$wrapped]) {
            method = method[$wrapped];
        }

        var parentClass = constructor.$parent,
            parentSource = parentClass && (isStatic ? parentClass : parentClass.prototype),
            parentMeta = parentClass && parentClass[$class][isStatic ? 'staticMethods' : 'methods'][name],
            parentLocked = parentClass && parentClass[$class].locked && !parentClass[$class].forceUnlocked,
            parentMethod,
            wrapper;

        if (parentMeta) {
            if (!isStatic && parentMeta.isPrivate && name === 'initialize') {
                parentMethod = callingPrivateConstructor;
                parentSource = null;
            } else {
                parentMethod = parentMeta.implementation;
            }
        } else {
            parentMethod = defaultSuper;
        }

        wrapper = function () {
            var that = this == null || this === glob ? {} : this,
                _super = that.$super,
                _self = that.$self,
                prevCaller,
                ret,
                parent;

            // Use the real source of the method if available, fallbacking to the
            // cached one because private/protected are not on the parent prototype
            // See: https://github.com/IndigoUnited/dejavu/issues/49
            parent = parentLocked || !parentSource ? parentMethod : parentSource[name];

            prevCaller = caller;
            caller = {
                method: method,
                constructor: constructor,
                constructorId: constructor[$class].id
            };
            that.$super = parent;
            that.$self = constructor;

            try {
                ret = method.apply(this, arguments);
            } finally {
                that.$super = _super;
                that.$self = _self;
                caller = prevCaller;
            }

            return ret;
        };

        obfuscateProperty(wrapper, $wrapped, method);

        if (method[$name]) {
            obfuscateProperty(wrapper, $name, method[$name]);
        }

        return wrapper;
    }

    /**
     * Default function to execute when a class atempts to call its parent private constructor.
     */
    function callingPrivateConstructor() {
        /*jshint validthis:true*/
        throw new Error('Cannot call parent constructor in class "' + this.$name + '" because it\'s declared as private.');
    }

    /**
     * Adds a method to a class.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *   - isFinal:  true|false Defaults to false
     *   - isConst:  true|false Defaults to false
     *
     * @param {String}   name        The method name
     * @param {Function} method      The method itself
     * @param {Function} constructor The class constructor in which the method metadata will be saved
     * @param {Object}   [opts]      The options, defaults to {}
     */
    function addMethod(name, method, constructor, opts) {
        opts = opts || {};

        var metadata,
            isStatic = !!opts.isStatic,
            forcePublic = !!(opts.forcePublic || constructor[$class].isVanilla),
            isFinal,
            target,
            tmp,
            originalMethod,
            inherited;

        // Unwrap method if already wrapped
        if (method[$wrapped]) {
            method = method[$wrapped];
        }

        // Check if function is already being used by another class or within the same class
        if (method[$name]) {
            if (method[$name] !== name) {
                tmp = method;
                method = function () {
                    return tmp.apply(this, arguments);
                };
                obfuscateProperty(method, $name, name);
            }
        } else {
            obfuscateProperty(method, $name, name);
        }

        // If the initialize is inherited, copy the metadata
        if (!isStatic && name === 'initialize' && method.$inherited) {
            metadata = mixIn({}, constructor.$parent[$class].methods[name]);
            inherited = true;
            delete method.$inherited;
        } else if (opts.metadata) {
            metadata = opts.metadata;
            isFinal = metadata.isFinal;
        } else {
            // Grab function metadata and throw error if is not valid (it's invalid if the arguments are invalid)
            if (method[$wrapped]) {
                throw new Error('Cannot grab metadata from wrapped method.');
            }
            metadata = functionMeta(method, name);
            if (!metadata) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in class "' + constructor.prototype.$name + '".');
            }

            metadata.isFinal = isFinal = !!opts.isFinal;

            if (isStatic) {
                if (constructor[$class].staticMethods[name]) {
                    metadata.allowed = constructor[$class].staticMethods[name].allowed;
                }
            } else {
                if (constructor[$class].methods[name]) {
                    metadata.allowed = constructor[$class].methods[name].allowed;
                }
            }
        }

        // Force public if told so
        if (forcePublic) {
            forcePublicMetadata(metadata);
        }

        // Take care of $prefix if the method is initialize
        if (name === 'initialize' && method.$prefix != null) {
            if (method.$prefix === '_') {
                metadata.isProtected = true;
            } else if (method.$prefix === '__') {
                metadata.isPrivate = true;
            }

            delete method.$prefix;
        }

        // Check if it's a private method classified as final
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
            if (target[name].forcedPublic) {
                forcePublicMetadata(metadata);
            } else {
                // Are we overriding a private method?
                if (target[name].isPrivate && name !== 'initialize') {
                    throw new Error('Cannot override private ' + (isStatic ? 'static ' : '') + ' method "' + name + '" in class "' + constructor.prototype.$name + '".');
                }
            }

            // Are we overriding a final method?
            if (target[name].isFinal) {
                throw new Error('Cannot override final method "' + name + '" in class "' + constructor.prototype.$name + '".');
            }
            // Are they compatible?
            if (metadata.checkCompatibility && !isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in abstract class "' + constructor.prototype.$name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        target[name] = metadata;

        if (!isStatic) {
            constructor[$class].ownMembers[name] = true;
        }

        originalMethod = method;
        method = wrapMethod(name, method, constructor, isStatic);

        obfuscateProperty(method, $name, name);
        metadata.implementation = method;

        // Add it to the constructor or the prototype only if public
        if (metadata.isPublic || !hasDefineProperty) {
            target = isStatic ? constructor : constructor.prototype;
            target[name] = method;
        }

        // If the function is specified to be bound, add it to the binds
        if (originalMethod[$bound]) {
            if (!isStatic) {
                insert(constructor[$class].binds, name);
            }
            delete originalMethod[$bound];
        }

        if (metadata.isProtected) {
            if (metadata.allowed) {
                insert(metadata.allowed, constructor[$class].id);
            } else {
                metadata.allowed = [constructor[$class].id];
            }
        } else if (metadata.isPrivate) {
            metadata.allowed = constructor[$class].id;
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
     * @param {Object}   [opts]      The options (defaults to {})
     */
    function addProperty(name, value, constructor, opts) {
        opts = opts || {};

        var metadata,
            isStatic,
            isFinal,
            isConst,
            forcePublic = !!(opts.forcePublic || constructor[$class].isVanilla),
            target;

        if (opts.metadata) {
            metadata = opts.metadata;
            isFinal = metadata.isFinal;
            isConst = metadata.isConst;
            isStatic = !!opts.isStatic || isConst;
        } else {
            metadata = propertyMeta(value, name);
            if (!metadata) {
                throw new Error('Value of property "' + name + '"  in class "' + constructor.prototype.$name + '" cannot be parsed (undefined values are not allowed).');
            }
            metadata.isFinal = isFinal = !!opts.isFinal;
            metadata.isConst = isConst = !!opts.isConst;
            isStatic = !!opts.isStatic || isConst;

            if (isStatic) {
                if (constructor[$class].staticProperties[name]) {
                    metadata.allowed = constructor[$class].staticProperties[name].allowed;
                }
            } else {
                if (constructor[$class].properties[name]) {
                    metadata.allowed = constructor[$class].properties[name].allowed;
                }
            }
        }

        // Force public if told so
        if (forcePublic) {
            forcePublicMetadata(metadata);
        }

        // Check if the metadata was fine (if not then the property is undefined)
        if (!metadata) {
            throw new Error('Value of ' + (isConst ? 'constant ' : (isStatic ? 'static ' : '')) + ' property "' + name + '" defined in class "' + constructor.prototype.$name + '" can\'t be undefined (use null instead).');
        }
        // Check if its a constant and its value is immutable
        if (isConst && !metadata.isImmutable) {
            throw new Error('Value for constant "' + name + '" defined in class "' + constructor.prototype.$name + '" must be a primitive type (immutable).');
        }
        // Check if it's a private property classified as final
        if (metadata.isPrivate && isFinal) {
            throw new Error((isStatic ? 'Static property' : 'Property') + ' "' + name + '" cannot be classified as final in class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor[$class].staticMethods : constructor[$class].methods;

        // Check if a method with the same name exists
        if (isObject(target[name])) {
            throw new Error((isConst ? 'Constant property' : (isStatic ? 'Static property' : 'Property')) + ' "' + name + '" is overwriting a ' + (isStatic ? 'static ' : '') + 'method with the same name in class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor[$class].staticProperties : constructor[$class].properties;

        if (isObject(target[name])) {
            // Force public if told so
            if (target[name].forcedPublic) {
                forcePublicMetadata(metadata);
            } else {
                // Are we overriding a private property?
                if (target[name].isPrivate) {
                    throw new Error('Cannot override private ' + (isConst ? 'constant ' : (isStatic ? 'static ' : '')) + ' property "' + name + ' in class "' + constructor.prototype.$name + '".');
                }
            }
            // Are we overriding a constant?
            if (target[name].isConst) {
                throw new Error('Cannot override constant property "' + name + '" in class "' + constructor.prototype.$name + '".');
            }
            // Are we overriding a final property?
            if (target[name].isFinal) {
                throw new Error('Cannot override final property "' + name + '" in class "' + constructor.prototype.$name + '".');
            }
        }

        target[name] = metadata;
        metadata.value = value;
        if (!isStatic) {
            constructor[$class].ownMembers[name] = true;
        }

        // Add it to the constructor or the prototype only if public
        if (metadata.isPublic || !hasDefineProperty) {
            target = isStatic ? constructor : constructor.prototype;
            target[name] = value;
        }

        if (isFinal) {
            metadata.isFinal = isFinal;
        } else if (isConst) {
            metadata.isConst = isConst;
        }

        if (metadata.isProtected) {
            if (metadata.allowed) {
                insert(metadata.allowed, constructor[$class].id);
            } else {
                metadata.allowed = [constructor[$class].id];
            }
        } else if (metadata.isPrivate) {
            metadata.allowed = constructor[$class].id;
        }
    }

    /**
     * Forces the property/function visibility to public
     *
     * @param  {Object} metadata The member metadata object
     */
    function forcePublicMetadata(metadata) {
        delete metadata.isProtected;
        delete metadata.isPrivate;
        metadata.isPublic = metadata.forcedPublic = true;
    }

    /**
     * Borrows members from a vanilla object definition.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function borrowFromVanilla(params, constructor) {
        // The members borrowed must be interpreted as public
        // This is because they do not use the $binds and maybe calling protected/private members
        // from anonymous functions

        var key,
            value,
            opts = { forcePublic: true };

        // Grab mixin members
        for (key in params) {
            // Ignore the constructor
            if (/^(_){0,2}initialize$/.test(key)) {
                continue;
            }

            value = params[key];

            if (!hasOwn(constructor.prototype, key)) {    // Already defined members are not overwritten
                if (isFunction(value) && !value[$class] && !value[$interface]) {
                    addMethod(key, value, constructor, opts);
                } else {
                    addProperty(key, value, constructor, opts);
                }
            }
        }

        constructor[$class].forceUnlocked = true;
    }

    /**
     * Parse borrows (mixins).
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function parseBorrows(params, constructor) {
        if (hasOwn(params, '$borrows')) {
            var current,
                mixins = toArray(params.$borrows),
                i = mixins.length,
                key,
                opts = {};

            // Verify argument type
            if (!i && !isArray(params.$borrows)) {
                throw new Error('$borrows of class "' + constructor.prototype.$name + '" must be a class/object or an array of classes/objects.');
            }
            // Verify duplicate entries
            if (i !== unique(mixins).length && compact(mixins).length === i) {
                throw new Error('There are duplicate entries defined in $borrows of class "' + constructor.prototype.$name + '".');
            }

            for (i -= 1; i >= 0; i -= 1) {
                current = mixins[i];

                // If is a vanilla object
                if (isObject(current)) {
                    if (current.$static) {
                        throw new Error('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is not a valid class/object.');
                    }
                    borrowFromVanilla(current, constructor);
                    continue;
                }
                // If is a vanilla class
                if (isFunction(current) && !current[$interface]) {
                    if (!current[$class]) {
                        borrowFromVanilla(current.prototype, constructor);
                        continue;
                    }
                } else {
                    throw new Error('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is not a valid class/object.');
                }

                current = current.prototype;

                // Verify if is an abstract class with unimplemented members
                if (current.$static[$abstract] && current.$static[$abstract].unimplemented) {
                    throw new Error('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is an abstract class with abstract members, which are not allowed.');
                }

                // Verify if it has parent
                if (current.$static.$parent) {
                    throw new Error('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is an inherited class (only root classes are supported).');
                }

                delete opts.isStatic;

                // Grab mixin members
                for (key in current.$static[$class].methods) {
                    if (!hasOwn(constructor.prototype, key)) {    // Already defined members are not overwritten
                        // We need to clone the metadata and delete the allowed because otherwise multiple classes borrowing from the same would have access
                        // Same applies to the things bellow
                        opts.metadata = mixIn({}, current.$static[$class].methods[key]);
                        delete opts.metadata.allowed;
                        addMethod(key, opts.metadata.implementation || current[key], constructor, opts);
                    }
                }

                for (key in current.$static[$class].properties) {
                    if (!hasOwn(constructor.prototype, key)) {    // Already defined members are not overwritten
                        opts.metadata = mixIn({}, current.$static[$class].properties[key]);
                        delete opts.metadata.allowed;
                        addProperty(key, opts.metadata.value || current[key], constructor, opts);
                    }
                }

                opts.isStatic = true;

                // Grab mixin static members
                for (key in current.$static[$class].staticMethods) {
                    opts.metadata = mixIn({}, current.$static[$class].staticMethods[key]);
                    delete opts.metadata.allowed;
                    addMethod(key, opts.metadata.implementation || current.$static[key], constructor, opts);
                }

                for (key in current.$static[$class].staticProperties) {
                    opts.metadata = mixIn({}, current.$static[$class].staticProperties[key]);
                    delete opts.metadata.allowed;
                    addProperty(key, opts.metadata.value || current.$static[key], constructor, opts);
                }

                if (current.$static[$class].isVanilla) {
                    constructor[$class].forceUnlocked = true;
                }

                // Merge the binds
                combine(constructor[$class].binds, current.$static[$class].binds);
            }

            delete params.$borrows;
        }
    }

    /**
     * Handle class interfaces.
     *
     * @param {Array}  interfs The array of interfaces
     * @param {Object} target  The target that has the interfaces
     */
    function handleInterfaces(interfs, target) {
        var interfaces = toArray(interfs),
            interf,
            x = interfaces.length,
            k,
            opts = { isConst: true };

        // Verify argument type
        if (!x && !isArray(interfs)) {
            throw new Error('$implements of class "' + target.prototype.$name + '" must be an interface or an array of interfaces.');
        }
        // Verify duplicate interfaces
        if (x !== unique(interfaces).length && compact(interfaces).length === x) {
            throw new Error('There are duplicate entries in $implements of class "' + target.prototype.$name + '".');
        }

        for (x -= 1; x >= 0; x -= 1) {
            interf = interfaces[x];

            // Verify if it's a valid interface
            if (!isFunction(interf) || !interf[$interface]) {
                throw new Error('Entry at index ' + x + ' in $implements of class "' + target.prototype.$name + '" is not a valid interface.');
            }

            // Inherit constants and add interface to the interfaces array
            if (!contains(target[$class].interfaces, interf)) {
                // Inherit constants
                for (k in interf[$interface].constants) {
                    addProperty(k, interf[k], target, opts);
                }

                // Add to interfaces array
                target[$class].interfaces.push(interf);
            }

            if (!target[$abstract]) {
                interfaces[x][$interface].check(target);
            }
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
        var opts = { isFinal: !!isFinal },
            key,
            value,
            cache = {},
            unallowed;

        // Add each method metadata, verifying its signature
        if (hasOwn(params, '$statics')) {
            // Check if is an object
            if (!isObject(params.$statics)) {
                throw new Error('$statics definition of class "' + params.$name + '" must be an object.');
            }

            // Check reserved keywords
            checkKeywords(params.$statics, 'statics');

            // Check unallowed keywords
            unallowed = testKeywords(params.$statics);
            if (unallowed) {
                throw new Error('$statics ' + (isFinal ? 'inside $finals ' : '') + ' of class "' + constructor.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
            }

            opts.isStatic = true;

            for (key in params.$statics) {
                value = params.$statics[key];

                if (isFunction(value) && !value[$class] && !value[$interface]) {
                    addMethod(key, value, constructor, opts);
                } else {
                    addProperty(key, value, constructor, opts);
                }
            }

            delete opts.isStatic;
            delete params.$statics;
        }

        // Save certain keywords in the cache for the loop bellow to work faster
        if (hasOwn(params, '$implements')) {
            cache.$implements = params.$implements;
            delete params.$implements;
        }

        if (hasOwn(params, '$abstracts')) {
            cache.$abstracts = params.$abstracts;
            delete params.$abstracts;
        }

        for (key in params) {
            value = params[key];

            if (isFunction(value) && !value[$class] && !value[$interface]) {
                addMethod(key, value, constructor, opts);
            } else {
                addProperty(key, value, constructor, opts);
            }
        }

        // Restore from cache
        mixIn(params, cache);
    }

    /**
     * Parse all the class members, including finals, static and constants.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function parseClass(params, constructor) {
        var opts = {},
            key,
            value,
            saved = {},
            unallowed,
            ambiguous;

        // Check and save constants to parse later
        if (hasOwn(params, '$constants')) {
            // Check argument
            if (!isObject(params.$constants)) {
                throw new Error('$constants of class "' + constructor.prototype.$name + '" must be an object.');
            }

            // Check reserved keywords
            checkKeywords(params.$constants, 'statics');

            // Check unallowed keywords
            unallowed = testKeywords(params.$constants);
            if (unallowed) {
                throw new Error('$constants of class "' + constructor.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
            }

            // Check ambiguity
            if (isObject(params.$statics)) {
                ambiguous = intersection(keys(params.$constants), keys(params.$statics));
                if (ambiguous.length) {
                    throw new Error('There are members defined in class "' + constructor.prototype.$name + '" with the same name but with different modifiers: "' + ambiguous.join('", ') + '".');
                }
            }

            saved.$constants = params.$constants;
            delete params.$constants;
        }

        // Check and save finals to parse later
        if (hasOwn(params, '$finals')) {
            // Check argument
            if (!isObject(params.$finals)) {
                throw new Error('$finals of class "' + constructor.prototype.$name + '" must be an object.');
            }

            // Check reserved keywords
            checkKeywords(params.$finals);

            // Check unallowed keywords
            unallowed = testKeywords(params.$finals, ['$statics']);
            if (unallowed) {
                throw new Error('$finals of class "' + constructor.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
            }

            // Check ambiguity
            if (isObject(params.$finals.$statics)) {
                if (isObject(params.$statics)) {
                    ambiguous = intersection(keys(params.$finals.$statics), keys(params.$statics));
                    if (ambiguous.length) {
                        throw new Error('There are members defined in class "' + constructor.prototype.$name + '" with the same name but with different modifiers: "' + ambiguous.join('", ') + '".');
                    }
                }
                if (saved.$constants) {
                    ambiguous = intersection(keys(params.$finals.$statics), keys(saved.$constants));
                    if (ambiguous.length) {
                        throw new Error('There are members defined in class "' + constructor.prototype.$name + '" with the same name but with different modifiers: "' + ambiguous.join('", ') + '".');
                    }
                }
            }
            ambiguous = intersection(keys(params), keys(params.$finals));
            if (ambiguous.length) {
                remove(ambiguous, '$statics');
                if (ambiguous.length) {
                    throw new Error('There are members defined in class "' + constructor.prototype.$name + '" with the same name but with different modifiers: "' + ambiguous.join('", ') + '".');
                }
            }

            saved.$finals = params.$finals;
            delete params.$finals;
        }

        // Check and save locked to parse later
        if (hasOwn(params, '$locked')) {
            if (!isBoolean(params.$locked)) {
                throw new Error('$locked of class "' + constructor.prototype.name + '" must be a boolean.');
            }

            saved.$locked = params.$locked;
            delete params.$locked;
        }

        // Parse members
        parseMembers(params, constructor);

        // Parse constants
        if (saved.$constants) {
            opts.isConst = true;

            for (key in saved.$constants) {
                value = saved.$constants[key];

                addProperty(key, value, constructor, opts);
            }

            delete opts.isConst;
        }

        // Parse finals
        if (saved.$finals) {
            parseMembers(saved.$finals, constructor, true);
        }

        // Parse locked
        if (hasOwn(saved, '$locked')) {
            if (constructor[$class].forceUnlocked && saved.$locked) {
                throw new Error('Class "' + constructor.prototype.$name + '" cannot be locked because it borrows or extends from a vanilla class.');
            }
            if (constructor[$class].locked === false && saved.$locked) {
                throw new Error('Class "' + constructor.prototype.$name + '" inherits from an unlocked class, therefore its subclasses cannot be locked.');
            }
            constructor[$class].locked = !!saved.$locked;
            delete constructor.prototype.$locked;
        } else if (!hasOwn(constructor[$class], 'locked')) {
            constructor[$class].locked = !!options.locked;
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
            instance[fns[i]][$name] = current.$name;
        }
    }

    /**
     * Protects a method according to its visibility.
     *
     * @param {String} name     The method name
     * @param {Object} meta     The function meta
     * @param {Object} instance The instance that will have the method
     */
    function protectMethod(name, meta, instance) {
        instance[cacheKeyword].methods[name] = meta.implementation;

        if (meta.isPrivate) {
            Object.defineProperty(instance, name, {
                get: function get() {
                    var method = instance[cacheKeyword].methods[name],
                        isConstructor = name === 'initialize',
                        currCaller;

                    currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && meta.allowed === currCaller.constructorId)) {
                        return method;
                    }

                    if (!isConstructor) {
                        throw new Error('Cannot access private method "' + name + '" of class "' + instance.$name + '".');
                    } else {
                        throw new Error('Constructor of class "' + instance.$name + '" is private.');
                    }
                },
                set: function set(newVal) {
                    if (instance.$initializing || !instance.$static[$class].locked || instance.$static[$class].forceUnlocked) {
                        instance[cacheKeyword].methods[name] = newVal;
                        instance[redefinedCacheKeyword].methods[name] = true; // This is just for the inspect
                    } else {
                        throw new Error('Cannot set private method "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: true
            });
        } else if (meta.isProtected) {
            Object.defineProperty(instance, name, {
                get: function get() {
                    var method = instance[cacheKeyword].methods[name],
                        isConstructor = name === 'initialize',
                        currCaller;

                    currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && (contains(meta.allowed, currCaller.constructorId) || instance instanceof currCaller.constructor))) {
                        return method;
                    }

                    if (!isConstructor) {
                        throw new Error('Cannot access protected method "' + name + '" of class "' + instance.$name + '".');
                    } else {
                        throw new Error('Constructor of class "' + instance.$name + '" is protected.');
                    }
                },
                set: function set(newVal) {
                    if (instance.$initializing || !instance.$static[$class].locked || instance.$static[$class].forceUnlocked) {
                        instance[cacheKeyword].methods[name] = newVal;
                        instance[redefinedCacheKeyword].methods[name] = true; // This is just for the inspect
                    } else {
                        throw new Error('Cannot set protected method "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: true
            });
        } else {
            Object.defineProperty(instance, name, {
                get: function get() {
                    return instance[cacheKeyword].methods[name];
                },
                set: function set(newVal) {
                    if (instance.$initializing || !instance.$static[$class].locked || instance.$static[$class].forceUnlocked) {
                        instance[cacheKeyword].methods[name] = newVal;
                        instance[redefinedCacheKeyword].methods[name] = true;
                    } else {
                        throw new Error('Cannot set public method "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: true
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
        constructor[cacheKeyword].methods[name] = meta.implementation;

        if (meta.isPrivate) {
            Object.defineProperty(constructor, name, {
                get: function get() {
                    var method = constructor[cacheKeyword].methods[name],
                        currCaller;

                    currCaller = caller;

                    if (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && meta.allowed === currCaller.constructorId) {
                        return method;
                    }

                    throw new Error('Cannot access private static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                set: function set(newVal) {
                    if (!constructor[$class].locked || constructor[$class].forceUnlocked) {
                        constructor[cacheKeyword].methods[name] = newVal;
                    } else {
                        throw new Error('Cannot set private static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                    }
                },
                configurable: false,
                enumerable: true
            });
        } else if (meta.isProtected) {
            Object.defineProperty(constructor, name, {
                get: function get() {
                    var method = constructor[cacheKeyword].methods[name],
                        currCaller;

                    currCaller = caller;

                    if (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && (contains(meta.allowed, currCaller.constructorId) || constructor.prototype instanceof currCaller.constructor)) {
                        return method;
                    }

                    throw new Error('Cannot access protected static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                set: function set(newVal) {
                    if (!constructor[$class].locked || constructor[$class].forceUnlocked) {
                        constructor[cacheKeyword].methods[name] = newVal;
                    } else {
                        throw new Error('Cannot set protected static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                    }
                },
                configurable: false,
                enumerable: true
            });
        } else {
            Object.defineProperty(constructor, name, {
                get: function get() {
                    return constructor[cacheKeyword].methods[name];
                },
                set: function set(newVal) {
                    if (!constructor[$class].locked || constructor[$class].forceUnlocked) {
                        constructor[cacheKeyword].methods[name] = newVal;
                    } else {
                        throw new Error('Cannot set public static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                    }
                },
                configurable: false,
                enumerable: true
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
            if (!meta.isImmutable) {
                instance[cacheKeyword].properties[name] = deepClone(meta.value);
                instance[redefinedCacheKeyword].properties[name] = true; // This is just for the inspect
            } else {
                instance[cacheKeyword].properties[name] = meta.value;
            }

            Object.defineProperty(instance, name, {
                get: function get() {
                    var currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && meta.allowed === currCaller.constructorId)) {
                        return instance[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access private property "' + name + '" of class "' + instance.$name + '".');
                },
                set: function set(newVal) {
                    var currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && meta.allowed === currCaller.constructorId)) {
                        instance[cacheKeyword].properties[name] = newVal;
                        instance[redefinedCacheKeyword].properties[name] = true;
                    } else {
                        throw new Error('Cannot set private property "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: true
            });
        } else if (meta.isProtected) {
            if (!meta.isImmutable) {
                instance[cacheKeyword].properties[name] = deepClone(meta.value);
                instance[redefinedCacheKeyword].properties[name] = true; // This is just for the inspect
            } else {
                instance[cacheKeyword].properties[name] = meta.value;
            }

            Object.defineProperty(instance, name, {
                get: function get() {
                    var currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && (contains(meta.allowed, currCaller.constructorId) || instance instanceof currCaller.constructor))) {
                        return instance[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access protected property "' + name + '" of class "' + instance.$name + '".');
                },
                set: function set(newVal) {
                    var currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && (contains(meta.allowed, currCaller.constructorId) || instance instanceof currCaller.constructor))) {
                        instance[cacheKeyword].properties[name] = newVal;
                        instance[redefinedCacheKeyword].properties[name] = true;
                    } else {
                        throw new Error('Cannot set protected property "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: true
            });
        } else if (!meta.isImmutable) {
            instance[name] = deepClone(instance[name]);
            instance[redefinedCacheKeyword].properties[name] = true; // This is just for the inspect
        } else {
            instance[name] = meta.value;
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
        constructor[cacheKeyword].properties[name] = meta.value;

        if (meta.isPrivate) {
            Object.defineProperty(constructor, name, {
                get: function get() {
                    var currCaller = caller;

                    if (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && meta.allowed === currCaller.constructorId) {
                        return constructor[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access private static property "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                set: meta.isConst ?
                        function () {
                            throw new Error('Cannot change value of constant property "' + name + '" of class "' + constructor.prototype.$name + '".');
                        } :
                        function set(newVal) {
                            var currCaller = caller;

                            if (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && meta.allowed === currCaller.constructorId) {
                                constructor[cacheKeyword].properties[name] = newVal;
                            } else {
                                throw new Error('Cannot set private property "' + name + '" of class "' + constructor.prototype.$name + '".');
                            }
                        },
                configurable: false,
                enumerable: true
            });
        } else if (meta.isProtected) {
            Object.defineProperty(constructor, name, {
                get: function get() {
                    var currCaller = caller;

                    if (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && (contains(meta.allowed, currCaller.constructorId) || constructor.prototype instanceof currCaller.constructor)) {
                        return constructor[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access protected static property "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                set: meta.isConst ?
                        function () {
                            throw new Error('Cannot change value of constant property "' + name + '" of class "' + constructor.prototype.$name + '".');
                        } :
                        function set(newVal) {
                            var currCaller = caller;

                            if (currCaller && (currCaller.method[$name] || currCaller.method[$anonymous]) && (contains(meta.allowed, currCaller.constructorId) || constructor.prototype instanceof currCaller.constructor)) {
                                constructor[cacheKeyword].properties[name] = newVal;
                            } else {
                                throw new Error('Cannot set protected static property "' + name + '" of class "' + constructor.prototype.$name + '".');
                            }
                        },
                configurable: false,
                enumerable: true
            });
        } else if (meta.isConst) {
            Object.defineProperty(constructor, name, {
                get: function () {
                    return constructor[cacheKeyword].properties[name];
                },
                set: function () {
                    throw new Error('Cannot change value of constant property "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                configurable: false,
                enumerable: true
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
        obfuscateProperty(instance, redefinedCacheKeyword, { properties: {}, methods: {} }); // This is for the inspect

        for (key in instance.$static[$class].methods) {
            protectMethod(key, instance.$static[$class].methods[key], instance);
        }

        for (key in instance.$static[$class].properties) {
            protectProperty(key, instance.$static[$class].properties[key], instance);
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
        var key,
            target,
            meta,
            prototype = constructor.prototype;

        obfuscateProperty(constructor, cacheKeyword, { properties: {}, methods: {} });

        for (key in constructor[$class].staticMethods) {
            protectStaticMethod(key, constructor[$class].staticMethods[key], constructor);
        }

        for (key in constructor[$class].staticProperties) {
            protectStaticProperty(key, constructor[$class].staticProperties[key], constructor);
        }

        // Prevent any properties/methods from being added and deleted to the constructor/prototype
        if (isFunction(Object.seal) && constructor[$class].locked && !constructor[$class].forceUnlocked) {
            Object.seal(constructor);
            Object.seal(prototype);
        }
    }

    /**
     * Builds the constructor function that calls the initialize and do
     * more things internally.
     *
     * @param {Function} constructor The constructor function to assume and fill
     * @param {Boolean}  isAbstract  Treat this class as abstract
     *
     * @return {Function} The constructor function
     */
    function createConstructor(constructor, isAbstract) {
        var Instance = constructor || function Instance() {
            var x,
                tmp;

            // Check if the user forgot the new keyword
            if (!(this instanceof Instance)) {
                throw new Error('Constructor called as a function, use the new keyword instead.');
            }

            // If it's abstract, it cannot be instantiated
            if (isAbstract) {
                throw new Error('An abstract class cannot be instantiated.');
            }

            obfuscateProperty(this, '$initializing', true, true, true);  // Mark it in order to let abstract classes run their initialize
            obfuscateProperty(this, '$super', null, true);               // Add the super to the instance object to speed lookup of the wrapper function
            obfuscateProperty(this, '$self', null, true);                // Add the self to the instance object to speed lookup of the wrapper function

            tmp = this.$static[$class];

            // Apply private/protected members
            if (hasDefineProperty) {
                protectInstance(this);
            } else {
                // Reset some types of the object in order for each instance to have their variables
                for (x in tmp.properties) {
                    if (!tmp.properties[x].isImmutable) {
                        this[x] = deepClone(this[x]);
                    }
                }
            }

            // Apply binds
            if (tmp.binds.length) {
                applyBinds(tmp.binds, this, this);
            }

            delete this.$initializing;

            // Prevent any properties/methods to be added and deleted
            if (!tmp.forceUnlocked && tmp.locked && isFunction(Object.seal)) {
                Object.seal(this);
            }

            // Call initialize
            this.initialize.apply(this, arguments);
        };

        if (!Instance[$class]) {
            obfuscateProperty(Instance, $class, { methods: {}, properties: {}, staticMethods: {}, staticProperties: {}, ownMembers: {}, interfaces: [], binds: [] });
            if (hasDefineProperty) {
                Instance[$class].simpleConstructor = function () {};
                obfuscateProperty(Instance[$class].simpleConstructor, '$constructor', Instance);
            }
        }

        return Instance;
    }

    /**
     * Marks a function as part of the class.
     *
     * @param {Function} func The function
     */
    function doMember(func) {
        /*jshint validthis:true*/
        func = func || this;

        // Check if it is a named func already
        if (func[$name]) {
            return func;
        }

        // Check if outside the instance/class
        if (!caller) {
            throw new Error('Attempting to mark a function as a member outside an instance/class.');
        }

        // Check if already marked as anonymous
        if (func[$anonymous]) {
            throw new Error('Function is already marked as an member.');
        }

        func[$anonymous] = true;
        func = wrapMethod(null, func, caller.constructor);
        func[$anonymous] = true;

        return func;
    }

    /**
     * Default implementation of the super function.
     */
    function defaultSuper() {
        throw new Error('Trying to call $super when there is no parent function.');
    }

    /**
     * Bind.
     * Works for anonymous functions also.
     *
     * @param {Function} func   The function to be bound
     * @param {...mixed} [args] The arguments to also be bound
     *
     * @return {Function} The bound function
     */
    function doBind(func) {
        /*jshint validthis:true*/
        var args = toArray(arguments),
            bound,
            isAnonymous;

        if (this && !func[$wrapped] && this.$static && this.$static[$class]) {
            func[$anonymous] = true;
            func = wrapMethod(null, func, this.$self || this.$static);
            args[0] = func;
            isAnonymous = true;
        }

        args.splice(1, 0, this);
        bound = bind.apply(func, args);
        if (isAnonymous) {
            bound[$anonymous] = func[$anonymous] = true;
        }

        return bound;
    }

    /**
     * Static bind.
     * Works for anonymous functions also.
     *
     * @param {Function} func   The function to be bound
     * @param {...mixed} [args] The arguments to also be bound
     *
     * @return {Function} The bound function
     */
    function doBindStatic(func) {
        /*jshint validthis:true*/
        var args = toArray(arguments),
            bound,
            isAnonymous;

        if (this && !func[$wrapped] && this.$static && this.$static[$class]) {
            func[$anonymous] = true;
            func = wrapMethod(null, func, this.$self || this.$static, true);
            args[0] = func;
            isAnonymous = true;
        }

        args.splice(1, 0, this);
        bound = bind.apply(func, args);
        if (isAnonymous) {
            bound[$anonymous] = func[$anonymous] = true;
        }

        return bound;
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
            value,
            classId = constructor[$class].id;

        // Inherit binds
        for (x = binds.length - 1; x >= 0; x -= 1) {
            if (binds[x].substr(0, 2) !== '__') {
                constructor[$class].binds.push(binds[x]);
            }
        }

        // Inherit methods and properties
        for (key in parent[$class].methods) {
            value = parent[$class].methods[key];
            constructor[$class].methods[key] = value;

            if (value.isProtected) {
                value.allowed.push(classId);
            }
        }

        for (key in parent[$class].properties) {
            value = parent[$class].properties[key];
            constructor[$class].properties[key] = value;

            if (value.isProtected) {
                value.allowed.push(classId);
            }
        }

        // Inherit static methods and properties
        for (key in parent[$class].staticMethods) {
            value = parent[$class].staticMethods[key];

            if (!value.isPrivate) {
                constructor[$class].staticMethods[key] = value;
                constructor[key] = value.implementation;

                if (value.isProtected) {
                    value.allowed.push(classId);
                }
            }
        }

        for (key in parent[$class].staticProperties) {
            value = parent[$class].staticProperties[key];

            if (!value.isPrivate) {
                constructor[$class].staticProperties[key] = value;
                constructor[key] = value.value;
                if (value.isProtected) {
                    value.allowed.push(classId);
                }

            }
        }

        // Make inheritance also for the simple constructor (for the inspect)
        if (hasDefineProperty) {
            inheritPrototype(constructor[$class].simpleConstructor, parent[$class].simpleConstructor);
        }

        // Inherit locked and forceUnlocked
        if (hasOwn(parent[$class], 'locked')) {
            constructor[$class].locked = parent[$class].locked;
        }
        if (hasOwn(parent[$class], 'forceUnlocked')) {
            constructor[$class].forceUnlocked = parent[$class].forceUnlocked;
        }

        obfuscateProperty(constructor, '$parent', parent);

        // Inherit implemented interfaces
        constructor[$class].interfaces = [].concat(parent[$class].interfaces);
    }

    /**
     * Function to easily extend another class.
     *
     * @param {Object|Function} params An object containing methods and properties or a function that returns it
     *
     * @return {Function} The new class constructor
     */
    function extend(params, $arg) {
        /*jshint validthis:true*/
        return Class.declare(this, params, $arg);
    }

    /**
     * Method that will print a readable string describing an instance.
     *
     * @return {String} The readable string
     */
    toStringInstance = function () {
        return '[instance #' + this.$name + ']';
    };

    /**
     * Method that will print a readable string describing an instance.
     *
     * @return {String} The readable string
     */
    toStringConstructor = function () {
        return '[constructor #' + this.prototype.$name + ']';
    };

    /**
     * Create a class definition.
     *
     * @param {Object}      params        An object containing methods and properties
     * @param {Constructor} [constructor] Assume the passed constructor
     * @param {Object}      [opts]        Options
     *
     * @return {Function} The constructor
     */
    createClass = function (params, constructor, opts) {
        opts = opts || {};

        var dejavu,
            parent,
            tmp,
            key,
            x,
            found;

        // Validate class name
        if (hasOwn(params, '$name')) {
            if (!isString(params.$name)) {
                throw new Error('Class name must be a string.');
            } else if (/\s+/.test(params.$name)) {
                throw new Error('Class name cannot have spaces.');
            }
        } else {
            params.$name = 'Unnamed';
        }

        // Verify if the class has abstract methods but is not defined as abstract
        if (hasOwn(params, '$abstracts') && !opts.isAbstract) {
            throw new Error('Class "' + params.$name + '" has abstract methods, therefore it must be defined as abstract.');
        }

        // Verify if initialize is a method (only for non vanilla classes)
        if (!opts.isVanilla) {
            tmp = ['__', '_', ''];
            found = false;
            for (x = tmp.length - 1; x >= 0; x -= 1) {
                key = tmp[x] + 'initialize';
                if (hasOwn(params, key)) {
                    if (!isFunction(params[key])) {
                        throw new Error('The "' + key + '" member of class "' + params.$name + '" must be a function.');
                    }
                    if (found) {
                        throw new Error('Several constructors with different visibility where found in class "' + params.$name + '".');
                    }
                    found = true;

                    // Mark the initialize method with its real prefix to be used later to protect the method
                    params[key].$prefix = tmp[x];
                }
            }
        }

        // Verify reserved words
        checkKeywords(params, 'normal');

        if (hasOwn(params, '$extends')) {
            parent = params.$extends;
            delete params.$extends;

            // Verify if parent is a valid class
            if (isFunction(parent) && !parent[$interface]) {
                // If its a vanilla class create a dejavu class based on it
                if (!parent[$class]) {
                    parent = createClass(parent.prototype, parent, { isVanilla: true });
                }

                // Verify if we are inheriting a final class
                if (parent[$class].finalClass) {
                    throw new Error('Class "' + params.$name + '" cannot inherit from final class "' + parent.prototype.$name + '".');
                }
            } else {
                throw new Error('Specified parent class in $extends of "' + params.$name + '" is not a valid class.');
            }

            dejavu = createConstructor(constructor, opts.isAbstract);
            dejavu[$class].id = nextId += 1;

            if (opts.isVanilla) {
                params.initialize = function () { dejavu.apply(this, arguments); };
                dejavu[$class].forceUnlocked = true;
                dejavu[$class].isVanilla = true;
            } else if (!params.initialize && !params._initialize && !params.__initialize) {
                params.initialize = function () { parent.prototype.initialize.apply(this, arguments); };
                params.initialize.$inherited = true;
            } else {
                params.initialize = params.initialize || params._initialize || params.__initialize;
            }
            inheritPrototype(dejavu, parent);
            inheritParent(dejavu, parent);
        } else {
            dejavu = createConstructor(constructor, opts.isAbstract);
            dejavu[$class].id = nextId += 1;

            if (opts.isVanilla) {
                params.initialize = function () { dejavu.apply(this, arguments); };
                dejavu[$class].forceUnlocked = true;
                dejavu[$class].isVanilla = true;
            } else {
                params.initialize = params.initialize || params._initialize || params.__initialize || function () {};
            }
        }

        if (!opts.isVanilla) {
            delete params._initialize;
            delete params.__initialize;
        }

        if (opts.isAbstract) {
            obfuscateProperty(dejavu, $abstract, true, true); // Signal it has abstract
        }

        dejavu.prototype.$name = params.$name;
        delete params.$name;

        // Parse mixins
        parseBorrows(params, dejavu);

        // Parse class members
        parseClass(params, dejavu);

        // Assign aliases
        obfuscateProperty(dejavu.prototype, '$static', dejavu);
        obfuscateProperty(dejavu, '$static', dejavu);
        obfuscateProperty(dejavu, '$self', null, true);
        obfuscateProperty(dejavu, '$super', null, true);
        obfuscateProperty(dejavu, '$member', doMember);
        obfuscateProperty(dejavu, '$bind', doBindStatic);
        if (!dejavu.$parent) {
            obfuscateProperty(dejavu.prototype, '$bind', doBind);
            obfuscateProperty(dejavu.prototype, '$member', doMember);
        }

        // Add toString() if not defined yet
        if (params.toString === Object.prototype.toString) {
            obfuscateProperty(dejavu.prototype, 'toString', toStringInstance, true);
        }
        if (dejavu.toString === Function.prototype.toString) {
            obfuscateProperty(dejavu, 'toString', toStringConstructor, true);
        }

        // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent[$abstract] && !opts.isAbstract) {
            parent[$abstract].check(dejavu);
        }

        // Handle interfaces
        if (hasOwn(params, '$implements')) {
            handleInterfaces(params.$implements, dejavu);
            delete dejavu.prototype.$implements;
        }

        // Remove abstracts reference
        if (hasOwn(params, '$abstracts')) {
            delete params.$abstracts;
        }

        // Supply .extend() to easily extend a class
        dejavu.extend = extend;

        // Prevent any properties/methods to be added and deleted
        if (hasDefineProperty) {
            protectConstructor(dejavu);
        }

        return dejavu;
    };

    /**
     * Function to declare a class.
     * This function can be called with various formats.
     *
     * @param {Function|Object} arg1 A class to extend or an object/function to obtain the members
     * @param {Function|Object} arg2 Object/function to obtain the members
     *
     * @return {Function} The constructor
     */
    Class.declare = function (arg1, arg2, $arg3) {
        var params,
            callable = isFunction(this) ? this : createClass,
            tmp,
            constructor;

        if (arg1 && arg2 && arg2 !== true) {
            if (!isFunction(arg1) || !arg1[$class]) {
                throw new Error('Expected first argument to be a class.');
            }

            // create(parentClass, func | props, true | false)
            if ((tmp = isFunction(arg2)) || $arg3) {
                constructor = createConstructor();
                params = tmp ? arg2(arg1.prototype, arg1, constructor) : arg2;
            // create(parentClass, props, false)
            } else {
                params = arg2;
            }

            if (params.$extends) {
                throw new Error('Object cannot contain an $extends property.');
            }

            params.$extends = arg1;
        // create(func | props, true | false)
        } else if ((tmp = isFunction(arg1)) || arg2) {
            constructor = createConstructor();
            params = tmp ? arg1(constructor) : arg1;
        // create (props)
        } else {
            params = arg1;
        }

        // Validate params as an object
        if (!isObject(params)) {
            throw new Error('Expected class definition to be an object with the class members.');
        }

        return callable(params, constructor);
    };

    // Add a reference to the createFunction method to be used by other files
    obfuscateProperty(Class, '$create', createClass);

    // Add custom bound function to supply binds
    if (!Function.prototype.$bound || !Function.prototype.$bound.dejavu) {
        try {
            obfuscateProperty(Function.prototype, '$bound', function () {
                this[$bound] = true;

                return this;
            });
            Function.prototype.$bound.dejavu = true;
        } catch (e) {
            printWarning('Could not set Function.prototype.$bound.');
        }
    }

    // Add custom bind function to supply binds
    if (!Function.prototype.$bind || !Function.prototype.$bind.dejavu) {
        try {
            obfuscateProperty(Function.prototype, '$bind', function (context) {
                var args = toArray(arguments);
                args.splice(0, 1, this);

                if (isFunction(context)) {
                    return doBindStatic.apply(context, args);
                }

                return doBind.apply(context, args);
            });
            Function.prototype.$bind.dejavu = true;
        } catch (e) {
            printWarning('Could not set Function.prototype.$bind.');
        }
    }

    // Add custom member function to supply marking a function as part of the class
    if (!Function.prototype.$member || !Function.prototype.$member.dejavu) {
        try {
            obfuscateProperty(Function.prototype, '$member', function () {
                return doMember(this);
            });
            Function.prototype.$member.dejavu = true;
        } catch (e) {
            printWarning('Could not set Function.prototype.$member.');
        }
    }

    return Class;
});
