define([
//>>includeStart('strict', pragmas.strict);
    './common/randomAccessor',
    './common/hasDefineProperty',
    './options',
    'amd-utils/lang/createObject',
    'amd-utils/lang/isObject',
    'amd-utils/lang/isArray',
    'amd-utils/lang/isFunction',
    'amd-utils/object/hasOwn',
    'amd-utils/array/forEach'
//>>includeEnd('strict');
], function (
//>>includeStart('strict', pragmas.strict);
    randomAccessor,
    hasDefineProperty,
    options,
    createObject,
    isObject,
    isArray,
    isFunction,
    hasOwn,
    forEach
//>>includeEnd('strict');
) {

    'use strict';

//>>includeStart('strict', pragmas.strict);
    var random = randomAccessor('inspectWrapper'),
        $class = '$class_' + random,
        $wrapped = '$wrapped_' + random,
        cacheKeyword = '$cache_' + random,
        redefinedCacheKeyword = '$redefined_cache_' + random,
        rewrittenConsole = false,
        prev,
        userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '',
        isIE = /msie/.test(userAgent) && !/opera/.test(userAgent);

    // Function prototype bind shim
    // Can't use amd-utils bind because of IE's
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (context) {
            var fn = this, args = Array.prototype.slice.call(arguments, 1);
            return function () {
                return fn.apply(context, Array.prototype.concat.apply(args, arguments));
            };
        };
    }

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

        var cached = fetchCache(target, cache),
            def,
            simpleConstructor,
            methodsCache,
            propertiesCache,
            obj,
            tmp,
            key;

        if (cached) {
            return cached;
        }

        def = target.$static[$class];
        simpleConstructor = def.simpleConstructor;
        methodsCache = target[cacheKeyword].methods;
        propertiesCache = target[cacheKeyword].properties;

        obj = createObject(simpleConstructor.prototype);
        cache.push({ target: target, inspect: obj });

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

        var cached = fetchCache(target, cache),
            def,
            methodsCache,
            propertiesCache,
            membersCache,
            obj,
            tmp,
            key;

        if (cached) {
            return cached;
        }

        def = target[$class];
        obj = def.simpleConstructor;
        methodsCache = target[cacheKeyword].methods;
        propertiesCache = target[cacheKeyword].properties;

        cache.push({ target: target, inspect: obj });

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

        cache = cache || [];

        if (isObject(prop)) {
            if (prop.$static) {
                return inspectInstance(prop, cache);
            }

            ret = clone ? {} : prop;
            for (key in prop) {
                ret[key] = inspect(prop[key], cache, clone);
            }

            return ret;
        }

        if (isArray(prop)) {
            length = prop.length;
            ret = clone ? [] : prop;
            for (x = 0; x < length; x += 1) {
                ret[x] = inspect(prop[x], cache, clone);
            }

            return ret;
        }

        if (isFunction(prop)) {
            if (prop[$class]) {
                return inspectConstructor(prop, cache);
            }

            return prop[$wrapped] || prop;
        }

        return prop;
    }

    /**
     * Rewrites console methods, enhancing them with inspect capability
     *
     * @param {Array} methods The method names to rewrite
     */
    function rewriteConsole(methods) {
        if (typeof console !== 'object' || rewrittenConsole) {
            return;
        }

        forEach(methods, function (method) {
            var prev = console[method];
            if (prev) {
                // Fix for IE..
                if (typeof prev === 'object') {
                    prev = Function.prototype.call.bind(prev, console);
                }

                console[method] = function () {
                    var args = [],
                        length = arguments.length,
                        x;

                    for (x = 0; x < length; x += 1) {
                        args[x] = inspect(arguments[x]);
                    }

                    prev.apply(console, args);
                };
            }
        });

        rewrittenConsole = true;
    }

    inspect.rewriteConsole = rewriteConsole;

    // Add inspect method to the console
    if (typeof console === 'object') {
        prev = console.inspect || (isIE ? console.dir || console.log : console.log);  // console.dir is better in IE

        // Fix for IE..
        if (typeof prev === 'object') {
            prev = Function.prototype.call.bind(prev, console);
        }

        console.inspect = function () {
            var args = [],
                length = arguments.length,
                x;

            for (x = 0; x < length; x += 1) {
                args[x] = inspect(arguments[x]);
            }

            prev.apply(console, args);
        };
    }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    var userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '',
        isIE = /msie/.test(userAgent) && !/opera/.test(userAgent);

    function inspect(target) {
        // TODO: Should inspect do something more?
        //       If the code is not optimized, they will see wrappers when clicking in functions
        //       and also some strange things like $bind and $static.
        //       But I think it does not compensate the extra bytes to support it
        //       If we ever do this, we must adjust the console.inspect bellow
        return target;
    }

    inspect.rewriteConsole = function () {};

    // Add inspect method to the console
    if (typeof console === 'object' && !console.inspect) {
        console.inspect = isIE ? console.dir || console.log : console.log;  // console.dir is better in IE
    }
//>>excludeEnd('strict');
});