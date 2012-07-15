/*jshint strict:false, noarg:false, expr:true*/

// TODO: implement the super like john resign for the loose version

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
    './common/obfuscateProperty',
    './common/hasDefineProperty',
    './common/checkObjectPrototype',
    './common/randomAccessor',
    './common/hasFreezeBug',
    './common/isImmutable',
    './common/isPlainObject',
    'amd-utils/lang/isFunction',
    'amd-utils/lang/isObject',
    'amd-utils/lang/isArray',
    'amd-utils/lang/isDate',
    'amd-utils/lang/isRegExp',
    'amd-utils/lang/isUndefined',
    'amd-utils/lang/createObject',
    'amd-utils/object/hasOwn',
    'amd-utils/array/combine',
    'amd-utils/array/contains',
    './common/mixIn',
    'amd-utils/lang/bind',
    'amd-utils/lang/toArray',
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
    obfuscateProperty,
    hasDefineProperty,
    checkObjectPrototype,
    randomAccessor,
    hasFreezeBug,
    isImmutable,
    isPlainObject,
    isFunction,
    isObject,
    isArray,
    isDate,
    isRegExp,
    isUndefined,
    createObject,
    hasOwn,
    combine,
    contains,
    mixIn,
    bind,
    toArray,
    insert
) {

    checkObjectPrototype();

    var Class,
        random = randomAccessor('ClassWrapper'),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        $abstract = '$abstract_' + random,
        $bound = '$bound_' + random,
        cacheKeyword = '$cache_' + random,
        inheriting,
        nextId = 0,
        caller,
        callerClassId,
        callerClassBaseId,
        toStringInstance,
        toStringConstructor,
        staticAlias;

    /**
     * Clones a property in order to make them unique for the instance.
     * This solves the shared properties for types like objects or arrays.
     *
     * @param {Mixed} prop The property
     *
     * @return {Mixed} The cloned property
     */
    function cloneProperty(prop) {

        var temp;

        if (isArray(prop)) {
            return [].concat(prop);
        }
        if (isObject(prop)) {
            if (isPlainObject(prop)) {
                return mixIn({}, prop);
            }

            return createObject(prop);
        }
        if (isDate(prop)) {
            temp = new Date();
            temp.setTime(prop.getTime());

            return temp;
        }
        if (isRegExp(prop)) {
            temp = (prop.toString()).replace(/[\s\S]+\//, '');

            return new RegExp(prop.source, temp);
        }

        return prop;
    }

    /**
     * Wraps a method.
     * This is to make some alias such as $super to work correctly.
     *
     * @param {Function} method      The method to wrap
     * @param {Function} constructor The constructor
     * @param {String}   classId     The class id
     * @param {String}   classBaseId The class base id
     * @param {Object}   parentMeta  The parent method metada
     *
     * @return {Function} The wrapper
     */
    function wrapMethod(method, constructor, classId, classBaseId, parentMeta) {

        if (method.$wrapped) {
            throw new Error('Method is already wrapped.');
        }

        var parent,
            wrapper;

        if (parentMeta) {
            parent = parentMeta.isPrivate && method['$name_' + random] === 'initialize' ? callingPrivateConstructor : parentMeta.implementation;
        } else {
            parent = defaultSuper;
        }

        wrapper = function () {

            var prevCaller = caller,
                prevCallerClassId = callerClassId,
                prevCallerClassBaseId = callerClassBaseId,
                _super = this.$super,
                _self = this.$self,
                ret;

            caller = method;
            callerClassId = classId;
            callerClassBaseId = classBaseId;

            this.$super = parent;
            this.$self = constructor;

            try {
                ret = method.apply(this, arguments);
            } finally {
                caller = prevCaller;
                callerClassId = prevCallerClassId;
                callerClassBaseId = prevCallerClassBaseId;
                this.$super = _super;
                this.$self = _self;
            }

            return ret;
        };

        obfuscateProperty(wrapper, '$wrapped', method);

        if (method['$name_' + random]) {
            obfuscateProperty(wrapper, '$name_' + random, method['$name_' + random]);
        }

        return wrapper;
    }

    /**
     *
     */
    function callingPrivateConstructor() {
        throw new Error('Cannot call parent constructor in class "' + this.$name + '" because its declared as private.');
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

        var metadata,
            isStatic = !!(opts && opts.isStatic),
            isFinal,
            target,
            originalMethod,
            allowed;

        // Check if function is already being used by another class or within the same class
        if (method['$name_' + random]) {
            if (method['$name_' + random] !== name) {
                throw new Error('Method "' + name + '" of class "' + constructor.prototype.$name + '" seems to be used several times by the same or another class.');
            }
        } else {
            obfuscateProperty(method, '$name_' + random, name);
        }

        // If the initialize is inherited, copy the metadata
        if (!isStatic && name === 'initialize' && method.$inherited) {
            metadata = constructor.$parent[$class].methods[name];
            delete method.$inherited;
        } else if (!opts.metadata) {
            // Grab function metadata and throw error if is not valid (its invalid if the arguments are invalid)
            if (method.$wrapped) {
                throw new Error('Cannot grab metadata from wrapped method.');
            }
            metadata = functionMeta(method, name);
            if (!metadata) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in class "' + constructor.prototype.$name + '".');
            }

            metadata.isFinal = !!opts.isFinal;
        } else {
            metadata = opts.metadata;
            opts.isFinal = metadata.isFinal;
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

        // Check if we got a private method classified as final
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
            if (target[name].isPrivate && name !== 'initialize') {
                throw new Error('Cannot override private ' + (isStatic ? 'static ' : '') + ' method "' + name + '" in class "' + constructor.prototype.$name + '".');
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

        // Unwrap method if already wrapped
        if (method.$wrapped) {
            method = method.$wrapped;
        }

        originalMethod = method;
        method = wrapMethod(method, constructor, constructor[$class].id, constructor[$class].baseId, constructor.$parent && constructor.$parent[$class].methods[name] ? constructor.$parent[$class].methods[name] : null);
        obfuscateProperty(method, '$name_' + random, name);

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

        if (metadata.isProtected) {
            allowed = constructor[$class].baseId;
        } else if (metadata.isPrivate) {
            allowed = constructor[$class].id;
        }

        // Store a reference to the prototype/constructor
        if (!isStatic) {
            obfuscateProperty(method, '$prototype_' + constructor[$class].id, constructor.prototype);
            obfuscateProperty(originalMethod, '$prototype_' + constructor[$class].id, constructor.prototype);

            // If the function is specified to be bound, add it to the binds
            if (originalMethod[$bound]) {
                insert(constructor[$class].binds, name);
                delete originalMethod[$bound];
            }
        } else {
            obfuscateProperty(method, '$constructor_' + constructor[$class].id, constructor);
            obfuscateProperty(originalMethod, '$constructor_' + constructor[$class].id, constructor);
        }

        if (allowed) {
            if (metadata.allowed) {
                allowed = toArray(allowed).concat(metadata.allowed);
            }
            metadata.allowed = allowed;
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

        var metadata,
            isStatic = !!(opts && (opts.isStatic || opts.isConst)),
            isFinal,
            isConst,
            target,
            allowed;

        if (opts) {
            if (opts.metadata) {
                metadata = opts.metadata;
                isFinal = metadata.isFinal;
                isConst = metadata.isConst;
            } else {
                metadata = propertyMeta(value, name);
                if (!metadata) {
                    throw new Error('Value of property "' + name + '"  in class "' + constructor.prototype.$name + '" cannot be parsed (undefined values are not allowed).');
                }
                isFinal = !!opts.isFinal;
                isConst = !!opts.isConst;
            }
        } else {
            isFinal = isStatic = isConst = false;
        }

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

        // Check if the metadata was fine (if not then the property is undefined)
        if (!metadata) {
            throw new Error('Value of ' + (isConst ? 'constant ' : (isStatic ? 'static ' : '')) + ' property "' + name + '" defined in class "' + constructor.prototype.$name + '" can\'t be undefined (use null instead).');
        }
        // Check if we we got a private property classified as final
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
            // Are we overriding a private property?
            if (target[name].isPrivate) {
                throw new Error('Cannot override private ' + (isConst ? 'constant ' : (isStatic ? 'static ' : '')) + ' property "' + name + ' in class "' + constructor.prototype.$name + '".');
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

        if (isFinal) {
            metadata.isFinal = isFinal;
        } else if (isConst) {
            metadata.isConst = isConst;
        }


        if (metadata.isProtected) {
            allowed = constructor[$class].baseId;
        } else if (metadata.isPrivate) {
            allowed = constructor[$class].id;
        }

        if (allowed) {
            if (metadata.allowed) {
                allowed = toArray(allowed).concat(metadata.allowed);
            }
            metadata.allowed = allowed;
        }
    }

    /**
     * Parse borrows (mixins).
     *
     * @param {Function} constructor The constructor
     */
    function parseBorrows(constructor) {

        if (hasOwn(constructor.prototype, '$borrows')) {

            var current,
                mixins = toArray(constructor.prototype.$borrows),
                i = mixins.length,
                key,
                opts = {};

            // Verify argument type
            if (!i && !isArray(constructor.prototype.$borrows)) {
                throw new Error('$borrows of class "' + constructor.prototype.$name + '" must be a class/object or an array of classes/objects.');
            }
            // Verify duplicate entries
            if (i !== unique(mixins).length && compact(mixins).length === i) {
                throw new Error('There are duplicate entries defined in $borrows of class "' + constructor.prototype.$name + '".');
            }

            for (i -= 1; i >= 0; i -= 1) {

                // Verify each mixin
                if ((!isFunction(mixins[i]) || !mixins[i][$class]) && (!isObject(mixins[i]) || mixins[i].$constructor)) {
                    throw new Error('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is not a valid class/object (abstract classes and instances of classes are not supported).');
                }

                // TODO: should we inherit interfaces of the borrowed class?!
                // TODO: allow subclass classes
                // TODO: allow abstract members fully

                if (isObject(mixins[i])) {
                    try {
                        current = new Class(mixIn({}, mixins[i])).prototype;
                    } catch (e) {
                        // When an object is being used, throw a more friend message if an error occurs
                        throw new Error('Unable to define object as class at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" (' + e.message + ').');
                    }
                } else {
                    current = mixins[i].prototype;
                }

                // Verify if is an abstract class with members
                if (current.$constructor[$abstract] && (size(current.$constructor[$abstract].methods) > 0 || size(current.$constructor[$abstract].staticMethods) > 0)) {
                    throw new Error('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is an abstract class with abstract members, which are not allowed.');
                }

                // Verify if it has parent
                if (current.$constructor.$parent) {
                    throw new Error('Entry at index ' + i + ' in $borrows of class "' + constructor.prototype.$name + '" is an inherited class (only root classes are supported).');
                }

                delete opts.isStatic;

                // Grab mixin members
                for (key in current.$constructor[$class].methods) {
                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        opts.metadata = current.$constructor[$class].methods[key];
                        addMethod(key, opts.metadata.implementation || current[key], constructor, opts);
                    }
                }

                for (key in current.$constructor[$class].properties) {
                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        opts.metadata = current.$constructor[$class].properties[key];
                        addProperty(key, opts.metadata.value || current[key], constructor, opts);
                    }
                }

                opts.isStatic = true;

                // Grab mixin static members
                for (key in current.$constructor[$class].staticMethods) {
                    if (isUndefined(constructor[key])) {              // Already defined members are not overwritten
                        opts.metadata = current.$constructor[$class].staticMethods[key];
                        addMethod(key, opts.metadata.implementation || current.$constructor[key], constructor, opts);
                    }
                }

                for (key in current.$constructor[$class].staticProperties) {
                    if (isUndefined(constructor[key])) {              // Already defined members are not overwritten
                        opts.metadata = current.$constructor[$class].staticProperties[key];
                        addProperty(key, opts.metadata.value || current.$constructor[key], constructor, opts);
                    }
                }

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
            instance[fns[i]]['$prototype_' + instance.$constructor[$class].id] = current['$prototype_' + instance.$constructor[$class].id];
            instance[fns[i]]['$name_' + random] = current.$name;
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

                    var method = this[cacheKeyword].methods[name],
                        currCaller,
                        isConstructor = name === 'initialize';

                    if (!isConstructor && !this.$underStrict && !this.$constructor[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (this.$initializing || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
                        return method;
                    }

                    if (!isConstructor) {
                        throw new Error('Cannot access private method "' + name + '" of class "' + this.$name + '".');
                    } else {
                        throw new Error('Constructor of class "' + this.$name + '" is private.');
                    }
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
            Object.defineProperty(instance, name, {
                get: function get() {

                    var method = this[cacheKeyword].methods[name],
                        currCaller,
                        isConstructor = name === 'initialize';

                    if (!isConstructor && !this.$underStrict && !this.$constructor[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (this.$initializing || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
                        return method;
                    }

                    if (!isConstructor) {
                        throw new Error('Cannot access protected method "' + name + '" of class "' + this.$name + '".');
                    } else {
                        throw new Error('Constructor of class "' + this.$name + '" is protected.');
                    }
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
        } else {
            Object.defineProperty(instance, name, {
                get: function get() {
                    return this[cacheKeyword].methods[name];
                },
                set: function set(newVal) {

                    if (this.$initializing) {
                        this[cacheKeyword].methods[name] = newVal;
                    } else {
                        throw new Error('Cannot set public method "' + name + '" of class "' + this.$name + '".');
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

                    var method = this[cacheKeyword].methods[name],
                        currCaller;

                    if (!this[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (inheriting || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
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
            Object.defineProperty(constructor, name, {
                get: function get() {

                    var method = this[cacheKeyword].methods[name],
                        currCaller;

                    if (!this[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (inheriting || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
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
        } else {
            Object.defineProperty(constructor, name, {
                get: function get() {
                    return this[cacheKeyword].methods[name];
                },
                set: function set(newVal) {
                    throw new Error('Cannot set public static method "' + name + '" of class "' + this.$name + '".');
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

                    var currCaller;

                    if (!this.$underStrict && !this.$constructor[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (this.$initializing || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
                        return this[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access private property "' + name + '" of class "' + this.$name + '".');
                },
                set: function set(newValue) {

                    var currCaller;

                    if (!this.$underStrict && !this.$constructor[$class].$underStrict) {
                        currCaller = set.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (this.$initializing || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
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

                    var currCaller;

                    if (!this.$underStrict && !this.$constructor[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (this.$initializing || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
                        return this[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access protected property "' + name + '" of class "' + this.$name + '".');
                },
                set: function set(newValue) {

                    var currCaller;

                    if (!this.$underStrict && !this.$constructor[$class].$underStrict) {
                        currCaller = set.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (this.$initializing || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
                        this[cacheKeyword].properties[name] = newValue;
                    } else {
                        throw new Error('Cannot set protected property "' + name + '" of class "' + this.$name + '".');
                    }
                },
                configurable: false,
                enumerable: false
            });
        } else if (!meta.isPrimitive) {
            instance[name] = cloneProperty(instance[name]);
        } else {
            instance[name] = instance.$constructor.prototype[name];
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

                    var currCaller;

                    if (!this[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (inheriting || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
                        return this[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access private static property "' + name + '" of class "' + this.prototype.$name + '".');
                },
                set: meta.isConst ?
                        function () {
                            throw new Error('Cannot change value of constant property "' + name + '" of class "' + this.prototype.$name + '".');
                        } :
                        function set(newValue) {

                            var currCaller;

                            if (!this[$class].$underStrict) {
                                currCaller = set.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                            } else {
                                currCaller = caller;
                            }

                            if (currCaller && caller['$name_' + random] && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId)))) {
                                this[cacheKeyword].properties[name] = newValue;
                            } else {
                                throw new Error('Cannot set private property "' + name + '" of class "' + this.prototype.$name + '".');
                            }
                        },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isProtected) {
            constructor[cacheKeyword].properties[name] = !meta.isConst ? cloneProperty(meta.value) : meta.value;

            Object.defineProperty(constructor, name, {
                get: function get() {

                    var currCaller;

                    if (!this[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (inheriting || (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
                        return constructor[cacheKeyword].properties[name];
                    }

                    throw new Error('Cannot access protected static property "' + name + '" of class "' + this.prototype.$name + '".');
                },
                set: meta.isConst ?
                        function () {
                            throw new Error('Cannot change value of constant property "' + name + '" of class "' + this.prototype.$name + '".');
                        } :
                        function set(newValue) {

                            var currCaller;

                            if (!this[$class].$underStrict) {
                                currCaller = set.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                            } else {
                                currCaller = caller;
                            }

                            if (currCaller && currCaller['$name_' + random] && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId))))) {
                                this[cacheKeyword].properties[name] = newValue;
                            } else {
                                throw new Error('Cannot set protected static property "' + name + '" of class "' + this.prototype.$name + '".');
                            }
                        },
                configurable: false,
                enumerable: false
            });
        } else if (meta.isConst) {
            constructor[cacheKeyword].properties[name] = meta.value;

            Object.defineProperty(constructor, name, {
                get: function () {
                    return this[cacheKeyword].properties[name];
                },
                set: function () {
                    throw new Error('Cannot change value of constant property "' + name + '" of class "' + this.prototype.$name + '".');
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
        }
        if (isFunction(Object.freeze) && !hasFreezeBug) {
            Object.freeze(constructor.prototype);
        } else if (isFunction(Object.seal)) {
            Object.seal(constructor.prototype);
        }
    }

    /**
     * Builds the constructor function that calls the initialize and do
     * more things internally.
     *
     * @param {Boolean} isAbstract Treat this class as abstract
     *
     * @return {Function} The constructor function
     */
    function createConstructor(isAbstract) {

        var Instance = function Instance() {

            var x,
                properties;

            // Check if the user forgot the new keyword
            if (!(this instanceof Instance)) {
                throw new Error('Constructor called as a function, use the new keyword instead.');
            }

            // If it's abstract, it cannot be instantiated
            if (isAbstract) {
                throw new Error('An abstract class cannot be instantiated.');
            }

            // Check if we are under strict mode
            try {
                Instance.caller || arguments.callee.caller || arguments.caller;  // Ignore JSLint error regarding .caller and .callee
                obfuscateProperty(this, '$underStrict', false);
            } catch (e) {
                obfuscateProperty(this, '$underStrict', true);
            }

            this.$initializing = true;        // Mark it in order to let abstract classes run their initialize
            this.$super = defaultSuper;       // Add the super to the instance object to speed lookup of the wrapper function
            this.$self = this.$constructor;   // Set the self alias
            this.$static = this.$constructor; // Set the static alias

            // Apply private/protected members
            if (hasDefineProperty) {
                protectInstance(this);
            } else {
                // Reset some types of the object in order for each instance to have their variables
                properties = this.$constructor[$class].properties;
                for (x in properties) {
                    if (!properties[x].isPrimitive) {
                        this[x] = cloneProperty(this[x]);
                    }
                }
            }

            // Apply binds
            if (this.$constructor[$class].binds.length) {
                applyBinds(this.$constructor[$class].binds, this, this);
            }

            if (hasDefineProperty) {
                obfuscateProperty(this, '$initializing', false);
            } else {
                delete this.$initializing;
            }

            // Prevent any properties/methods to be added and deleted
            if (isFunction(Object.seal)) {
                Object.seal(this);
            }

            // Call initialize
            this.initialize.apply(this, arguments);
        };

        obfuscateProperty(Instance, $class, { methods: {}, properties: {}, staticMethods: {}, staticProperties: {}, interfaces: [], binds: [] });

        return Instance;
    }

    /**
     * Default implementation of the super function.
     */
    function defaultSuper() {
        throw new Error('Trying to call $super when there is not parent function.');
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

        inheriting = true;

        // Grab methods and properties definitions
        mixIn(constructor[$class].methods,  parent[$class].methods);
        mixIn(constructor[$class].properties,  parent[$class].properties);

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

        // Inherit implemented interfaces
        constructor[$class].interfaces = [].concat(parent[$class].interfaces);
    }

    /**
     * Creates a function that will be used to access the static members of itself.
     *
     * @return {Function} The function
     */
    function selfAlias() {

        if (!caller || !caller['$prototype_' + callerClassId]) {
            throw new Error('Cannot retrieve self alias within an unknown function.');
        }

        return caller['$prototype_' + callerClassId].$constructor;
    }

    /**
     * Creates a function that will be used to access the static methods of itself (with late binding).
     *
     * @return {Function} The function
     */
    staticAlias = function () {
        return this.$constructor;
    };

    /**
     * Creates a function that will be used to call a parent static method.
     *
     * @return {Function} The function
     */
    function superStaticAlias() {

        var meta,
            classId = callerClassId,
            name;

        if (!caller || !caller['$name_' + random] || !caller['$constructor_' + classId]) {
            throw new Error('Calling parent static method within an unknown function.');
        }

        name = caller['$name_' + random];

        if (!caller['$constructor_' + classId].$parent) {
            throw new Error('Cannot call parent static method "' + name + '" in class "' + this.$name + '".');
        }

        meta = caller['$constructor_' + classId][$class].staticMethods[name];

        if (meta.isPrivate) {
            throw new Error('Cannot call $super() within private static methods in class "' + this.$name + '".');
        }

        meta = caller['$constructor_' + classId].$parent[$class].staticMethods[name];

        if (!meta) {
            throw new Error('Cannot call parent static method "' + name + '" in class "' + this.$name + '".');
        }

        return meta.implementation.apply(this, arguments);
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
     * @param {Object}  params     An object containing methods and properties
     * @param {Boolean} isAbstract Treat this class as abstract
     *
     * @return {Function} The constructor
     */
    Class = function Class(params, isAbstract) {

        var dejavu,
            parent,
            tmp,
            key,
            x,
            found;

        // Validate params as an object
        if (!isObject(params)) {
            throw new Error('Argument "params" must be an object while defining a class.');
        }
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
        if (hasOwn(params, '$abstracts') && !isAbstract) {
            throw new Error('Class "' + params.$name + '" has abstract methods, therefore it must be defined as abstract.');
        }

        // Verify if initialize is a method
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

        // Verify reserved words
        checkKeywords(params, 'normal');

        if (hasOwn(params, '$extends')) {
            // Verify if parent is a valid class
            if (!isFunction(params.$extends) || !params.$extends[$class]) {
                throw new Error('Specified parent class in $extends of "' + params.$name + '" is not a valid class.');
            }
            // Verify if we are inheriting a final class
            if (params.$extends[$class].finalClass) {
                throw new Error('Class "' + params.$name + '" cannot inherit from final class "' + params.$extends.prototype.$name + "'.");
            }

            parent = params.$extends;
            delete params.$extends;

            if (!params.initialize && !params._initialize && !params.__initialize) {
                params.initialize = function () { parent.prototype.initialize.apply(this, arguments); };
                params.initialize.$inherited = true;
            } else {
                params.initialize = params.initialize || params._initialize || params.__initialize;
            }

            dejavu = createConstructor(isAbstract);
            obfuscateProperty(dejavu, '$parent', parent);
            dejavu[$class].baseId = parent[$class].baseId;
            dejavu[$class].id = nextId += 1;
            dejavu.prototype = createObject(parent.prototype, params);

            inheritParent(dejavu, parent);
        } else {
            params.initialize = params.initialize || params._initialize || params.__initialize || function () {};
            dejavu = createConstructor(isAbstract);
            dejavu[$class].baseId = nextId += 1;
            dejavu[$class].id = dejavu[$class].baseId;
            dejavu.prototype = params;
        }

        delete params._initialize;
        delete params.__initialize;

        if (isAbstract) {
            obfuscateProperty(dejavu, $abstract, true, true); // Signal it has abstract
        }

        // Check if we are under strict mode
        try {
            Class.caller || arguments.callee.caller || arguments.caller;  // Ignore JSLint error regarding .caller and .callee
            dejavu[$class].$underStrict = false;
        } catch (e) {
            dejavu[$class].$underStrict = true;
        }

        // Parse class members
        parseClass(params, dejavu);

        // Assign aliases
        obfuscateProperty(dejavu.prototype, '$constructor', dejavu);
        obfuscateProperty(dejavu.prototype, '$static', dejavu);
        obfuscateProperty(dejavu, '$super', superStaticAlias);

        // Parse mixins
        parseBorrows(dejavu);

        // Add toString() if not defined yet
        if (params.toString === Object.prototype.toString) {
            obfuscateProperty(dejavu.prototype, 'toString', toStringInstance, true);
        }
        if (dejavu.toString === Function.prototype.toString) {
            obfuscateProperty(dejavu, 'toString', toStringConstructor, true);
        }

        // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent[$abstract] && !isAbstract) {
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

        // Prevent any properties/methods to be added and deleted
        if (hasDefineProperty) {
            protectConstructor(dejavu);
        }

        return dejavu;
    };

    // TODO: check if a $bound or $bind already exist in the prototype and emit a warning?
    // TODO: do a $bound and $bind function available as amd defines

    // Add custom bound function to supply binds
    Function.prototype.$bound = function () {
        this[$bound] = true;

        return this;
    };

    Function.prototype.$bind = function () {
        if (!arguments.length) {
            this[$bound] = true;
        } else {
            // TODO:
        }
    };

    return Class;
});

// TODO: comment out the wrapMethod
// TODO: make the static methods also use the wrapper
// Remove unecessary $name and suff