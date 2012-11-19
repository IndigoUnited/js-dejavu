if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

/*jshint strict:false, noarg:false, expr:true*/

define([
    'amd-utils/lang/isString',
    'amd-utils/array/intersection',
    'amd-utils/array/unique',
    'amd-utils/array/compact',
    'amd-utils/array/remove',
    'amd-utils/object/keys',
    'amd-utils/object/size',
    './common/functionMeta',
    './common/propertyMeta',
    './common/isFunctionCompatible',
    './common/checkKeywords',
    './common/testKeywords',
    './common/hasDefineProperty',
    './common/checkObjectPrototype',
    './common/randomAccessor',
    './common/hasFreezeBug',
    './options',
    './common/printWarning',
    './common/obfuscateProperty',
    './common/isImmutable',
    './common/isPlainObject',
    'amd-utils/lang/isFunction',
    'amd-utils/lang/isObject',
    'amd-utils/lang/isArray',
    'amd-utils/lang/isDate',
    'amd-utils/lang/isRegExp',
    'amd-utils/lang/createObject',
    'amd-utils/object/hasOwn',
    'amd-utils/array/combine',
    'amd-utils/array/contains',
    './common/mixIn',
    'amd-utils/function/bind',
    'amd-utils/lang/toArray',
    'amd-utils/lang/clone',
    'amd-utils/array/insert'
], function ClassWrapper(
    isString,
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
    hasFreezeBug,
    options,
    printWarning,
    obfuscateProperty,
    isImmutable,
    isPlainObject,
    isFunction,
    isObject,
    isArray,
    isDate,
    isRegExp,
    createObject,
    hasOwn,
    combine,
    contains,
    mixIn,
    bind,
    toArray,
    clone,
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
        inheriting,
        descriptor,
        tmp,
        nextId = 0,
        caller,
        callerClass,
        callerClassId,
        toStringInstance,
        toStringConstructor;

    /**
     * Clones a property in order to make them unique for the instance.
     * This solves the shared properties for types like objects or arrays.
     *
     * @param {Mixed} prop The property
     *
     * @return {Mixed} The cloned property
     */
    function cloneProperty(prop) {
        // We treat object differently than amd-utils
        // If is a plain object, we use our built-in mixIn to be faster
        // Otherwise we do a createObject
        if (isObject(prop)) {
            if (isPlainObject(prop)) {
                return mixIn({}, prop);
            }

            return createObject(prop);
        }

        return clone(prop);
    }

    /**
     * Wraps a method.
     * This is to make some alias such as $super and $self to work correctly.
     *
     * @param {Function} method      The method to wrap
     * @param {Function} constructor The constructor
     * @param {Object}   parentMeta  The parent method metada
     *
     * @return {Function} The wrapper
     */
    function wrapMethod(method, constructor, parentMeta) {
        if (method[$wrapped]) {
            method = method[$wrapped];
        }

        var parent,
            classId = constructor[$class].id,
            wrapper;

        if (parentMeta) {
            parent = parentMeta.isPrivate && method[$name] === 'initialize' ? callingPrivateConstructor : parentMeta.implementation;
        } else {
            parent = defaultSuper;
        }

        wrapper = function () {
            if (this == null) {
                throw new Error('Method "' + (wrapper[$name] || 'anonymous') + '" was called with a null context (did you forget to bind?).');
            }

            var _super = this.$super,
                _self = this.$self,
                prevCaller = caller,
                prevCallerClass = callerClass,
                prevCallerClassId = callerClassId,
                ret;

            caller = method;
            callerClassId = classId;
            this.$super = parent;
            this.$self = callerClass = constructor;

            try {
                ret = method.apply(this, arguments);
            } finally {
                caller = prevCaller;
                callerClassId = prevCallerClassId;
                this.$super = _super;
                this.$self = _self;
                callerClass = prevCallerClass;
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
     * Wraps a static method.
     * This is to make some alias such as $super and $self to work correctly.
     *
     * @param {Function} method      The method to wrap
     * @param {Function} constructor The constructor
     * @param {Object}   parentMeta  The parent method metadata
     *
     * @return {Function} The wrapper
     */
    function wrapStaticMethod(method, constructor, parentMeta) {
        if (method[$wrapped]) {
            method = method[$wrapped];
        }

        var parent = parentMeta ? parentMeta.implementation : parentMeta,
            classId = constructor[$class].id,
            wrapper;

        wrapper = function () {
            if (this == null) {
                throw new Error('Static method "' + (wrapper[$name] || 'anonymous') + '" was called with a null context (did you forget to bind?).');
            }

            var _super = this.$super,
                _self = this.$self,
                prevCaller = caller,
                prevCallerClassId = callerClassId,
                prevCallerClass = callerClass,
                ret;

            caller = method;
            callerClassId = classId;
            this.$super = parent;
            this.$self = callerClass = constructor;

            try {
                ret = method.apply(this, arguments);
            } finally {
                caller = prevCaller;
                callerClassId = prevCallerClassId;
                this.$super = _super;
                this.$self = _self;
                callerClass = prevCallerClass;
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
        } else if (!opts.metadata) {
            // Grab function metadata and throw error if is not valid (it's invalid if the arguments are invalid)
            if (method[$wrapped]) {
                throw new Error('Cannot grab metadata from wrapped method.');
            }
            metadata = functionMeta(method, name);
            if (!metadata) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in class "' + constructor.prototype.$name + '".');
            }

            metadata.isFinal = !!opts.isFinal;

            if (isStatic) {
                if (constructor[$class].staticMethods[name]) {
                    metadata.allowed = constructor[$class].staticMethods[name].allowed;
                }
            } else {
                if (constructor[$class].methods[name]) {
                    metadata.allowed = constructor[$class].methods[name].allowed;
                }
            }
        } else {
            metadata = opts.metadata;
            opts.isFinal = metadata.isFinal;
        }

        // Force public if told so
        if (forcePublic) {
            forcePublicMetadata(metadata);
        }

        // Take care of $prefix if the method is initialize
        if (name === 'initialize' && method.$prefix) {
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

        originalMethod = method;
        method = !isStatic ?
                  wrapMethod(method, constructor, constructor.$parent ? constructor.$parent[$class].methods[name] : null) :
                  wrapStaticMethod(method, constructor, constructor.$parent ? constructor.$parent[$class].staticMethods[name] : null);

        obfuscateProperty(method, $name, name);

        // If the function is protected/private we delete it from the target because they will be protected later
        if (!metadata.isPublic && hasDefineProperty) {
            if (!isStatic) {
                delete constructor.prototype[name];
            } else {
                delete constructor[name];
            }
        } else {
            target = isStatic ? constructor : constructor.prototype;
            target[name] = method;
        }

        metadata.implementation = method;

        if (isFinal) {
            metadata.isFinal = isFinal;
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
            isFinal = !!opts.isFinal;
            isConst = !!opts.isConst;
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

        // If the property is protected/private we delete it from the target because they will be protected later
        if (!metadata.isPublic && hasDefineProperty) {
            if (!isStatic) {
                delete constructor.prototype[name];
            } else {
                delete constructor[name];
            }

            metadata.value = value;
        } else if (isStatic) {
            if (!isConst) {
                constructor[name] = cloneProperty(value);
            } else {
                constructor[name] = value;
            }
            metadata.value = value;
        } else {
            constructor.prototype[name] = value;
            metadata.isImmutable = isImmutable(value);
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
            value = params[key];

            if (constructor.prototype[key] === undefined) {    // Already defined members are not overwritten
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
                    if (constructor.prototype[key] === undefined) {    // Already defined members are not overwritten
                        // We need to clone the metadata and delete the allowed because otherwise multiple classes borrowing from the same would have access
                        // Same applies to the things bellow
                        opts.metadata = mixIn({}, current.$static[$class].methods[key]);
                        delete opts.metadata.allowed;
                        addMethod(key, opts.metadata.implementation || current[key], constructor, opts);
                    }
                }

                for (key in current.$static[$class].properties) {
                    if (constructor.prototype[key] === undefined) {    // Already defined members are not overwritten
                        opts.metadata = mixIn({}, current.$static[$class].properties[key]);
                        delete opts.metadata.allowed;
                        addProperty(key, opts.metadata.value || current[key], constructor, opts);
                    }
                }

                opts.isStatic = true;

                // Grab mixin static members
                for (key in current.$static[$class].staticMethods) {
                    if (constructor[key] === undefined) {              // Already defined members are not overwritten
                        opts.metadata = mixIn({}, current.$static[$class].staticMethods[key]);
                        delete opts.metadata.allowed;
                        addMethod(key, opts.metadata.implementation || current.$static[key], constructor, opts);
                    }
                }

                for (key in current.$static[$class].staticProperties) {
                    if (constructor[key] === undefined) {              // Already defined members are not overwritten
                        opts.metadata = mixIn({}, current.$static[$class].staticProperties[key]);
                        delete opts.metadata.allowed;
                        addProperty(key, opts.metadata.value || current.$static[key], constructor, opts);
                    }
                }

                if (current.$static[$class].isVanilla) {
                    constructor[$class].forceUnlocked = true;
                }

                // Merge the binds
                combine(constructor[$class].binds, current.$static[$class].binds);
            }

            delete constructor.prototype.$borrows;
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
        if (hasOwn(params, '$borrows')) {
            cache.$borrows = params.$borrows;
            delete params.$borrows;
        }

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
            has = {},
            unallowed,
            ambiguous;

         // Save constants & finals to parse later
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
            has.$constants = true;
            delete params.$constants;
        }

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
                if (has.$constants) {
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
            has.$finals = true;
            delete params.$finals;
        }

        // Parse members
        parseMembers(params, constructor);

        // Parse constants
        if (has.$constants) {
            opts.isConst = true;

            for (key in saved.$constants) {

                value = saved.$constants[key];

                if (!isImmutable(value)) {
                    throw new Error('Value for constant "' + key + '" defined in class "' + params.$name + '" must be a primitive type (immutable).');
                }

                addProperty(key, value, constructor, opts);
            }

            delete opts.isConst;
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
                        currCaller = caller,
                        isConstructor = name === 'initialize';

                    if (instance.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && meta.allowed === callerClassId)) {
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
                    } else {
                        throw new Error('Cannot set private method "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {
            Object.defineProperty(instance, name, {
                get: function get() {

                    var method = instance[cacheKeyword].methods[name],
                        currCaller = caller,
                        isConstructor = name === 'initialize';

                    if (instance.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (contains(meta.allowed, callerClassId) || instance instanceof callerClass))) {
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
                    } else {
                        throw new Error('Cannot set protected method "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else {
            Object.defineProperty(instance, name, {
                get: function get() {
                    return instance[cacheKeyword].methods[name];
                },
                set: function set(newVal) {

                    if (instance.$initializing || !instance.$static[$class].locked || instance.$static[$class].forceUnlocked) {
                        instance[cacheKeyword].methods[name] = newVal;
                    } else {
                        throw new Error('Cannot set public method "' + name + '" of class "' + instance.$name + '".');
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
        constructor[cacheKeyword].methods[name] = meta.implementation;

        if (meta.isPrivate) {
            Object.defineProperty(constructor, name, {
                get: function get() {

                    var method = constructor[cacheKeyword].methods[name],
                        currCaller = caller;


                    if (inheriting || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && meta.allowed === callerClassId)) {
                        return method;
                    }

                    throw new Error('Cannot access private static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                set: function set() {
                    if (constructor[$class].locked && !constructor[$class].forceUnlocked) {
                        throw new Error('Cannot set private static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {
            Object.defineProperty(constructor, name, {
                get: function get() {

                    var method = constructor[cacheKeyword].methods[name],
                        currCaller = caller;

                    if (inheriting || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (contains(meta.allowed, callerClassId) || constructor.prototype instanceof callerClass))) {
                        return method;
                    }

                    throw new Error('Cannot access protected static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                set: function set() {
                    if (constructor[$class].locked && !constructor[$class].forceUnlocked) {
                        throw new Error('Cannot set protected static method "' + name + '" of class "' + constructor.prototype.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else {
            Object.defineProperty(constructor, name, {
                get: function get() {
                    return constructor[cacheKeyword].methods[name];
                },
                set: function set() {
                    if (constructor[$class].locked && !constructor[$class].forceUnlocked) {
                        throw new Error('Cannot set public static method "' + name + '" of class "' + constructor.$name + '".');
                    }
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

                    var currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && meta.allowed === callerClassId)) {
                        return instance[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access private property "' + name + '" of class "' + instance.$name + '".');
                },
                set: function set(newValue) {

                    var currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && meta.allowed === callerClassId)) {
                        instance[cacheKeyword].properties[name] = newValue;
                    } else {
                        throw new Error('Cannot set private property "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {
            instance[cacheKeyword].properties[name] = cloneProperty(meta.value);

            Object.defineProperty(instance, name, {
                get: function get() {

                    var currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (contains(meta.allowed, callerClassId) || instance instanceof callerClass))) {
                        return instance[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access protected property "' + name + '" of class "' + instance.$name + '".');
                },
                set: function set(newValue) {

                    var currCaller = caller;

                    if (instance.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (contains(meta.allowed, callerClassId) || instance instanceof callerClass))) {
                        instance[cacheKeyword].properties[name] = newValue;
                    } else {
                        throw new Error('Cannot set protected property "' + name + '" of class "' + instance.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else if (!meta.isPrimitive) {
            instance[name] = cloneProperty(instance[name]);
        } else {
            instance[name] = instance.$static.prototype[name];
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
            constructor[cacheKeyword].properties[name] = !meta.isConst ? cloneProperty(meta.value) : meta.value;

            Object.defineProperty(constructor, name, {
                get: function get() {

                    var currCaller = caller;

                    if (inheriting || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && meta.allowed === callerClassId)) {
                        return constructor[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access private static property "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                set: meta.isConst ?
                        function () {
                            throw new Error('Cannot change value of constant property "' + name + '" of class "' + constructor.prototype.$name + '".');
                        } :
                        function set(newValue) {

                            var currCaller = caller;

                            if (currCaller && (currCaller[$name] || currCaller[$anonymous]) && meta.allowed === callerClassId) {
                                constructor[cacheKeyword].properties[name] = newValue;
                            } else {
                                throw new Error('Cannot set private property "' + name + '" of class "' + constructor.prototype.$name + '".');
                            }
                        },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {
            constructor[cacheKeyword].properties[name] = !meta.isConst ? cloneProperty(meta.value) : meta.value;

            Object.defineProperty(constructor, name, {
                get: function get() {

                    var currCaller = caller;

                    if (inheriting || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (contains(meta.allowed, callerClassId) || constructor.prototype instanceof callerClass))) {
                        return constructor[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access protected static property "' + name + '" of class "' + constructor.prototype.$name + '".');
                },
                set: meta.isConst ?
                        function () {
                            throw new Error('Cannot change value of constant property "' + name + '" of class "' + constructor.prototype.$name + '".');
                        } :
                        function set(newValue) {

                            var currCaller = caller;

                            if (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (contains(meta.allowed, callerClassId) || constructor.prototype instanceof callerClass)) {
                                constructor[cacheKeyword].properties[name] = newValue;
                            } else {
                                throw new Error('Cannot set protected static property "' + name + '" of class "' + constructor.prototype.$name + '".');
                            }
                        },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isConst) {
            constructor[cacheKeyword].properties[name] = meta.value;

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
        var key;

        obfuscateProperty(constructor, cacheKeyword, { properties: {}, methods: {} });

        for (key in constructor[$class].staticMethods) {
            protectStaticMethod(key, constructor[$class].staticMethods[key], constructor);
        }

        for (key in constructor[$class].staticProperties) {
            protectStaticProperty(key, constructor[$class].staticProperties[key], constructor);
        }

        // Prevent any properties/methods to be added and deleted to the constructor
        if (constructor[$class].locked && !constructor[$class].forceUnlocked) {
            if (isFunction(Object.seal)) {
                Object.seal(constructor);
            }

            // Prevent any properties/methods to modified in the prototype
            if (isFunction(Object.freeze) && !hasFreezeBug) {
                Object.freeze(constructor.prototype);
            } else if (isFunction(Object.seal)) {
                Object.seal(constructor.prototype);
            }
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
                    if (!tmp.properties[x].isPrimitive) {
                        this[x] = cloneProperty(this[x]);
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
            obfuscateProperty(Instance, $class, { methods: {}, properties: {}, staticMethods: {}, staticProperties: {}, interfaces: [], binds: [] });
        }

        return Instance;
    }

    /**
     * Default implementation of the super function.
     */
    function defaultSuper() {
        throw new Error('Trying to call $super when there is not parent function.');
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

        if (!func[$wrapped] && this.$static && this.$static[$class]) {
            func[$anonymous] = true;
            func = wrapMethod(func, this.$self || this.$static, callerClassId);
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

        if (!func[$wrapped] && this.$static && this.$static[$class]) {
            func[$anonymous] = true;
            func = wrapStaticMethod(func, this.$self || this.$static, callerClassId);
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

        inheriting = true;

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
                constructor[key] = parent[key];

                if (value.isProtected) {
                    value.allowed.push(classId);
                }
            }
        }

        for (key in parent[$class].staticProperties) {
            value = parent[$class].staticProperties[key];

            if (!value.isPrivate) {
                constructor[$class].staticProperties[key] = value;
                constructor[key] = cloneProperty(value.value);

                if (value.isProtected) {
                    value.allowed.push(classId);
                }

            }
        }

        inheriting = false;

        // Inherit locked and forceUnlocked
        if (hasOwn(parent[$class], 'locked')) {
            constructor[$class].locked = parent[$class].locked;
        }
        if (hasOwn(parent[$class], 'forceUnlocked')) {
            constructor[$class].forceUnlocked = parent[$class].forceUnlocked;
        }

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
            obfuscateProperty(dejavu, '$parent', parent);
            dejavu.prototype = createObject(parent.prototype);

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

        // Parse class members
        parseClass(params, dejavu);

        // Parse mixins
        parseBorrows(params, dejavu);

        // Assign aliases
        obfuscateProperty(dejavu.prototype, '$static', dejavu);
        obfuscateProperty(dejavu, '$static', dejavu);
        obfuscateProperty(dejavu, '$self', null, true);
        obfuscateProperty(dejavu, '$super', null, true);
        obfuscateProperty(dejavu, '$bind', doBindStatic);
        if (!dejavu.$parent) {
            obfuscateProperty(dejavu.prototype, '$bind', doBind);
        }

        // Add toString() if not defined yet
        if (params.toString === Object.prototype.toString) {
            obfuscateProperty(dejavu.prototype, 'toString', toStringInstance, true);
        }
        if (dejavu.toString === Function.prototype.toString) {
            obfuscateProperty(dejavu, 'toString', toStringConstructor, true);
        }

        // If we are a concrete class tha3t extends an abstract class, we need to verify the methods existence
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

        // Take care of $locked flag
        if (hasOwn(params, '$locked')) {
            if (dejavu[$class].forceUnlocked && params.$locked) {
                throw new Error('Class "' + params.$name + '" cannot be locked because it borrows or extends from a vanilla class.');
            }
            if (dejavu[$class].locked === false && params.$locked) {
                throw new Error('Class "' + params.$name + '" inherits from an unlocked class, therefore its subclasses cannot be locked.');
            }
            dejavu[$class].locked = !!params.$locked;
            delete params.$locked;
        } else if (!hasOwn(dejavu[$class], 'locked')) {
            dejavu[$class].locked = !!options.locked;
        }

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
            constructor;

        if (arg1 && arg2 && arg2 !== true) {
            if (!isFunction(arg1) || !arg1[$class]) {
                throw new Error('Expected first argument to be a class.');
            }

            // create(parentClass, func)
            if (isFunction(arg2)) {
                constructor = createConstructor();
                params = arg2(arg1.prototype, constructor, arg1);
            // create(parentClass, props)
            } else {
                params = arg2;
            }

            if (params.$extends) {
                throw new Error('Object cannot contain an $extends property.');
            }

            params.$extends = arg1;
        // create(func)
        } else if (isFunction(arg1)) {
            constructor = createConstructor();
            params = arg1(constructor);
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
    tmp = true;
    if (Function.prototype.$bound) {
        if (!Function.prototype.$bound.dejavu) {
            printWarning('Function.prototype.$bound is already defined and will be overwritten.');
            if (Object.getOwnPropertyDescriptor) {
                descriptor = Object.getOwnPropertyDescriptor(Function.prototype, '$bound');
                if (!descriptor.writable || !descriptor.configurable) {
                    printWarning('Could not overwrite Function.prototype.$bound.');
                    tmp = false;
                }
            }
        } else {
            tmp = false;
        }
    }

    if (tmp) {
        obfuscateProperty(Function.prototype, '$bound', function () {
            this[$bound] = true;

            return this;
        });
        Function.prototype.$bound.dejavu = true;
    }

    // Add custom bind function to supply binds
    tmp = true;
    if (Function.prototype.$bind) {
        if (!Function.prototype.$bind.dejavu) {
            printWarning('Function.prototype.$bind is already defined and will be overwritten.');
            if (Object.getOwnPropertyDescriptor) {
                descriptor = Object.getOwnPropertyDescriptor(Function.prototype, '$bind');
                if (!descriptor.writable || !descriptor.configurable) {
                    printWarning('Could not overwrite Function.prototype.$bind.');
                    tmp = false;
                }
            }
        } else {
            tmp = false;
        }
    }

    if (tmp) {
        obfuscateProperty(Function.prototype, '$bind', function (context) {
            if (!arguments.length) {
                this[$bound] = true;

                return this;
            }

            var args = toArray(arguments);
            args.splice(0, 1, this);

            if (isFunction(context)) {
                return doBindStatic.apply(context, args);
            }

            return doBind.apply(context, args);
        });
        Function.prototype.$bind.dejavu = true;
    }

    return Class;
});