define([
//>>includeStart('strict', pragmas.strict);
    './randomAccessor',
    './hasDefineProperty',
    'mout/lang/createObject',
    'mout/lang/isObject',
    'mout/lang/isArray',
    'mout/lang/isFunction',
    'mout/object/hasOwn'
//>>includeEnd('strict');
], function (
//>>includeStart('strict', pragmas.strict);
    randomAccessor,
    hasDefineProperty,
    createObject,
    isObject,
    isArray,
    isFunction,
    hasOwn
//>>includeEnd('strict');
) {

    'use strict';

//>>includeStart('strict', pragmas.strict);
    var random = randomAccessor('inspectWrapper'),
        $class = '$class_' + random,
        $wrapped = '$wrapped_' + random,
        cacheKeyword = '$cache_' + random,
        redefinedCacheKeyword = '$redefined_cache_' + random,
        prev,
        tmp;

//>>excludeStart('node', pragmas.node);
    // Function prototype bind shim
    // Can't use mout bind because of IE's
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (context) {
            var fn = this, args = Array.prototype.slice.call(arguments, 1);
            return function () {
                return fn.apply(context, Array.prototype.concat.apply(args, arguments));
            };
        };
    }

//>>excludeEnd('node');
    /**
     * Fetches an already inspected target from the cache.
     * Returns null if not in the cache.
     *
     * @param {Object|Function} target The instance or constructor.
     * @param {Array}           cache  The cache
     *
     * @return {Object|Function} The inspected target
     */
    function fetchCache(target, cache) {
        var x,
            length = cache.length,
            curr;

        for (x = 0; x < length; x += 1) {
            curr = cache[x];
            if (curr.target === target) {
                return curr.inspect;
            }
        }

        return null;
    }

    /**
     * Inspects an instance.
     *
     * @param {Object} target The instance
     * @param {Array}  cache  The cache
     *
     * @return {Object} The inspected instance
     */
    function inspectInstance(target, cache) {
        // If browser has no define property it means it is too old and
        // in that case we return the target itself.
        // This could be improved but I think it does not worth the trouble
        if (!hasDefineProperty) {
            return target;
        }

        var def,
            simpleConstructor,
            methodsCache,
            propertiesCache,
            obj,
            tmp,
            key;

        obj = fetchCache(target, cache.instances);
        if (obj) {
            return obj;
        }

        def = target.$static[$class];
        simpleConstructor = def.simpleConstructor;
        methodsCache = target[cacheKeyword].methods;
        propertiesCache = target[cacheKeyword].properties;

        obj = createObject(simpleConstructor.prototype);
        cache.instances.push({ target: target, inspect: obj });

        // Methods
        for (key in target[redefinedCacheKeyword].methods) {
            obj[key] = inspect(methodsCache[key], cache, true);
        }

        // Properties
        for (key in target[redefinedCacheKeyword].properties) {
            tmp = hasOwn(propertiesCache, key) ? propertiesCache[key] : target[key];
            obj[key] = inspect(tmp, cache, true);
        }

        // Handle undeclared properties
        methodsCache = def.methods;
        propertiesCache = def.properties;
        for (key in target) {
            if (hasOwn(target, key) && !hasOwn(obj, key) && !propertiesCache[key] && !methodsCache[key]) {
                obj[key] = inspect(target[key], cache, true);
            }
        }

        // Fix the .constructor
        tmp = obj.constructor.$constructor;
        while (tmp) {
            inspectConstructor(tmp, cache, true);
            tmp = tmp.$parent;
        }

        return obj;
    }

    /**
     * Inspects an constructor.
     *
     * @param {Function} target The constructor
     *
     * @return {Object} The inspected constructor
     */
    function inspectConstructor(target, cache) {
        // If browser has no define property it means it is too old and
        // in that case we return the target itself.
        // This could be improved but I think it does not worth the trouble
        if (!hasDefineProperty) {
            return target;
        }

        var def,
            methodsCache,
            propertiesCache,
            membersCache,
            obj,
            tmp,
            key;

        obj = fetchCache(target, cache.constructors);
        if (obj) {
            return obj;
        }

        def = target[$class];
        obj = def.simpleConstructor;
        methodsCache = target[cacheKeyword].methods;
        propertiesCache = target[cacheKeyword].properties;

        cache.constructors.push({ target: target, inspect: obj });

        // Constructor methods
        for (key in methodsCache) {
            obj[key] = inspect(methodsCache[key], cache, true);
        }

        // Constructor properties
        for (key in propertiesCache) {
            tmp = propertiesCache[key];
            obj[key] = inspect(tmp, cache, true);
        }

        // Handle constructor undeclared properties
        methodsCache = def.methods;
        propertiesCache = def.properties;
        for (key in target) {
            if (hasOwn(target, key) && !hasOwn(obj, key) && !propertiesCache[key] && !methodsCache[key]) {
                obj[key] = inspect(target[key], cache, true);
            }
        }

        obj = obj.prototype;

        // Prototype members
        target = target.prototype;
        membersCache = def.ownMembers;
        methodsCache = def.methods;
        propertiesCache = def.properties;

        for (key in membersCache) {
            tmp = methodsCache[key] ? methodsCache[key].implementation : propertiesCache[key].value;
            obj[key] = inspect(tmp, cache, true);
        }

        // Handle undeclared prototype members
        for (key in target) {
            if (hasOwn(target, key) && !hasOwn(obj, key) && !membersCache[key]) {
                obj[key] = inspect(target[key], cache, true);
            }
        }

        return obj;
    }

    /**
     * Inspects a property, recursively finding for instances/constructors.
     *
     * @param {Object}  prop  The property
     * @param {Array}   cache The cache
     * @param {Boolean} clone True to clone findings, false otherwise
     *
     * @return {Object} The inspected property
     */
    function inspect(prop, cache, clone) {
        var key,
            x,
            length,
            ret;

        cache = cache || {
            others: [],
            instances: [],
            constructors: []
        };

        if (isObject(prop)) {
            // Check if it is an instance
            if (prop.$static) {
//>>excludeStart('node', pragmas.node);
                return inspectInstance(prop, cache);
//>>excludeEnd('node');
//>>includeStart('node', pragmas.node);
                return prop.$static[$class].inspectInstance ?
                    prop.$static[$class].inspectInstance(prop, cache) :
                    inspectInstance(prop, cache);
//>>includeEnd('node');
            }

            // Object is a collection
            // Attempt to fetch from cache
            ret = fetchCache(prop, cache.others);
            if (ret) {
                return ret;
            }

            ret = {};
            cache.others.push({ target: prop, inspect: ret });

            // Iterate over each key value of the object, inspecting it
            for (key in prop) {
                ret[key] = inspect(prop[key], cache, clone);
            }

            return ret;
        }

        // Array is a collection
        if (isArray(prop)) {
            // Attempt to fetch from cache
            ret = fetchCache(prop, cache.others);
            if (ret) {
                return ret;
            }

            ret = [];
            cache.others.push({ target: prop, inspect: ret });

            // Iterate over each item of the array, inspecting it
            length = prop.length;
            for (x = 0; x < length; x += 1) {
                ret.push(inspect(prop[x], cache, clone));
            }

            return ret;
        }

        if (isFunction(prop)) {
            // Check if is a constructor
            if (prop[$class]) {
//>>excludeStart('node', pragmas.node);
                return inspectConstructor(prop, cache);
//>>excludeEnd('node');
//>>includeStart('node', pragmas.node);
                return prop[$class].inspectConstructor ?
                    prop[$class].inspectConstructor(prop, cache) :
                    inspectConstructor(prop, cache);
//>>includeEnd('node');
            }

            // Otherwise check if it is a wrapper function or a normal one
            return prop[$wrapped] || prop;
        }

        return prop;
    }

    // Add inspect method to the console
    if (typeof console === 'object' && (!console.inspect || !console.inspect.dejavu)) {
//>>excludeStart('node', pragmas.node);
        tmp = typeof navigator !== 'undefined' && /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
        prev = console.inspect || (tmp ? console.dir || console.log : console.log);  // console.dir is better in IE

        // Fix for IE..
        if (typeof prev === 'object') {
            prev = Function.prototype.call.bind(prev, console);
        }
//>>excludeEnd('node');
//>>includeStart('node', pragmas.node);
        prev = console.inspect || console.log;
//>>includeEnd('node');

        console.inspect = function () {
            var args = [],
                length = arguments.length,
                x;

            for (x = 0; x < length; x += 1) {
                args[x] = inspect(arguments[x]);
            }

            return prev.apply(console, args);
        };
        console.inspect.dejavu = true;
    }
//>>includeStart('node', pragmas.node);

    tmp = {};
    tmp['instance_' + random] = inspectInstance;
    tmp['constructor_' + random] = inspectConstructor;

    return tmp;
//>>includeEnd('node');
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    // TODO: Should inspect do something more?
    //       If the code is not optimized, they will see wrappers when clicking in functions
    //       and also some strange things like $bind and $static.
    //       But I think it does not compensate the extra bytes to support it
    //       If we ever do this, we must adjust the console.inspect bellow

    // Add inspect method to the console
    if (typeof console === 'object' && !console.inspect) {
        console.inspect = typeof navigator !== 'undefined' && /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) ?
            console.dir || console.log :  // console.dir is better in IE
            console.log;
    }
//>>excludeEnd('strict');
});