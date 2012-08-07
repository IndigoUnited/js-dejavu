(function () {
/**
 * almond 0.1.1 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice,
        main, req;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {},
            nameParts, nameSegment, mapValue, foundMap, i, j, part;

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            return true;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                break;
                            }
                        }
                    }
                }

                foundMap = foundMap || starMap[nameSegment];

                if (foundMap) {
                    nameParts.splice(0, i, foundMap);
                    name = nameParts.join('/');
                    break;
                }
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, ret, map, i;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                    cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("../vendor/almond/almond.js", function(){});

define('amd-utils/lang/kindOf',[],function () {

    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     * @version 0.1.0 (2011/10/31)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    return kindOf;
});

define('amd-utils/lang/isKind',['./kindOf'], function (kindOf) {
    /**
     * Check if value is from a specific "kind".
     * @version 0.1.0 (2011/10/31)
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    return isKind;
});

define('amd-utils/lang/isFunction',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    return isFunction;
});

define('amd-utils/lang/isString',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isString(val) {
        return isKind(val, 'String');
    }
    return isString;
});

define('amd-utils/array/indexOf',[],function () {

    /**
     * ES5 Array.indexOf
     * @version 0.2.1 (2011/11/25)
     */
    var indexOf = Array.prototype.indexOf?
                    function (arr, item, fromIndex) {
                        return arr.indexOf(item, fromIndex);
                    } :
                    function (arr, item, fromIndex) {
                        fromIndex = fromIndex || 0;
                        var n = arr.length >>> 0,
                            i = fromIndex < 0? n + fromIndex : fromIndex;
                        for (; i < n; i++) {
                            if (arr[i] === item) {
                                return i;
                            }
                        }
                        return -1;
                    };

    return indexOf;
});

define('amd-utils/array/forEach',[],function () {

    /**
     * ES5 Array.forEach
     * @version 0.3.1 (2011/11/25)
     */
    var forEach = Array.prototype.forEach?
                    function (arr, callback, thisObj) {
                        arr.forEach(callback, thisObj);
                    } :
                    function (arr, callback, thisObj) {
                        for (var i = 0, n = arr.length >>> 0; i < n; i++) {
                            //according to spec callback should only be called for
                            //existing items
                            if (i in arr) {
                                callback.call(thisObj, arr[i], i, arr);
                            }
                        }
                    };

    return forEach;

});

define('amd-utils/array/filter',['./forEach'], function (forEach) {

    /**
     * ES5 Array.filter
     * @version 0.3.0 (2011/11/15)
     */
    var filter = Array.prototype.filter?
                function (arr, callback, thisObj) {
                    return arr.filter(callback, thisObj);
                } :
                function (arr, callback, thisObj) {
                    var results = [];
                    forEach(arr, function (val, i, arr) {
                        if ( callback.call(thisObj, val, i, arr) ) {
                            results.push(val);
                        }
                    });
                    return results;
                };

    return filter;

});

define('amd-utils/array/unique',['./indexOf', './filter'], function(indexOf, filter){

    /**
     * @return {array} Array of unique items
     * @version 0.1.0 (2011/10/18)
     */
    function unique(arr){
        return filter(arr, isUnique);
    }

    function isUnique(item, i, arr){
        return indexOf(arr, item, i+1) === -1;
    }

    return unique;
});


define('amd-utils/array/every',[],function () {

    /**
     * ES5 Array.every
     * @version 0.2.1 (2011/11/25)
     */
    var every = Array.prototype.every?
                function (arr, callback, thisObj) {
                    return arr.every(callback, thisObj);
                } :
                function (arr, callback, thisObj) {
                    var result = true,
                        n = arr.length >>> 0;
                    while (n--) {
                        //according to spec callback should only be called for
                        //existing items
                        if ( n in arr && !callback.call(thisObj, arr[n], n, arr) ) {
                            result = false;
                            break;
                        }
                    }
                    return result;
                };

    return every;
});

define('amd-utils/array/contains',['./indexOf'], function (indexOf) {

    /**
     * If array contains values.
     * @version 0.1.0 (2011/10/31)
     */
    function contains(arr, val) {
        return indexOf(arr, val) !== -1;
    }
    return contains;
});

define('amd-utils/array/intersection',['./unique', './filter', './every', './contains'], function (unique, filter, every, contains) {


    /**
     * Return a new Array with elements common to all Arrays.
     * - based on underscore.js implementation
     * @version 0.1.0 (2011/01/12)
     */
    function intersection(arr) {
        var arrs = Array.prototype.slice.call(arguments, 1),
            result = filter(unique(arr), function(needle){
                return every(arrs, function(haystack){
                    return contains(haystack, needle);
                });
            });
        return result;
    }

    return intersection;

});

define('amd-utils/array/compact',['./filter'], function (filter) {

    /**
     * Remove all null/undefined items from array.
     * @version 0.1.0 (2011/11/15)
     */
    function compact(arr) {
        return filter(arr, function(val){
            return (val != null);
        });
    }

    return compact;
});

define('amd-utils/array/remove',['./indexOf'], function(indexOf){

    /**
     * Remove a single item from the array.
     * (it won't remove duplicates, just a single item)
     * @version 0.1.1 (2012/03/13)
     */
    function remove(arr, item){
        var idx = indexOf(arr, item);
        if (idx !== -1) arr.splice(idx, 1);
    }

    return remove;
});

define('amd-utils/lang/isObject',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    return isObject;
});

define('amd-utils/object/hasOwn',[],function () {

    /**
     * Safer Object.hasOwnProperty
     * @version 0.1.0 (2012/01/19)
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     return hasOwn;

});

define('amd-utils/object/forOwn',['../lang/isObject', './hasOwn'], function (isObject, hasOwn) {

    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     * @version 0.1.1 (2012/01/19)
     */
    function forOwn(obj, fn, thisObj){
        var key, i = 0;

        if (!isObject(obj)) {
            throw new TypeError('forOwn called on a non-object');
        }

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            exec(fn, obj, key, thisObj);
        }

        if (_hasDontEnumBug) {
            while (key = _dontEnums[i++]) {
                exec(fn, obj, key, thisObj);
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        if (hasOwn(obj, key)) {
            fn.call(thisObj, obj[key], key, obj);
        }
    }

    return forOwn;

});

define('amd-utils/object/keys',['./forOwn'], function (forOwn) {

    /**
     * Get object keys
     * @version 0.3.0 (2011/12/17)
     */
     var keys = Object.keys || function (obj) {
            var keys = [];
            forOwn(obj, function(val, key){
                keys.push(key);
            });
            return keys;
        };

    return keys;

});

define('amd-utils/object/size',['./forOwn'], function (forOwn) {

    /**
     * Get object size
     * @version 0.1.1 (2012/01/28)
     */
    function size(obj) {
        var count = 0;
        forOwn(obj, function(){
            count++;
        });
        return count;
    }

    return size;

});

/*jshint regexp:false*/

define('common/functionMeta',[],function () {

    'use strict';

    /**
     * Extract meta data from a function.
     * It returns an object containing the number of normal arguments, the number
     * of optional arguments, the function signature, the function name and the visibility.
     *
     * Will return null if the function arguments are invalid.
     *
     * @param {Function} func The function
     * @param {String}   name The name of the function
     *
     * @return {Object|null} An object containg the function metadata
     */
    function functionMeta(func, name) {

        var matches = /^function(\s+[a-zA-Z0-9_$]*)*\s*\(([^\(]*)\)/m.exec(func.toString()),
            ret,
            split,
            optionalReached = false,
            length,
            x;

        // Analyze arguments
        if (!matches) {
            return null;
        }

        split = (matches[2] || '').split(/\s*,\s*/gm);
        length = split.length;

        ret = { mandatory: 0, optional: 0, signature: '' };

        if (split[0] !== '') {

            for (x = 0; x < length; x += 1) {
                if (split[x].charAt(0) === '$') {
                    ret.optional += 1;
                    ret.signature += ' ' + split[x] + ', ';
                    optionalReached = true;
                } else if (!optionalReached) {
                    ret.mandatory += 1;
                    ret.signature += split[x] + ', ';
                } else {
                    return null;
                }
            }

            ret.signature = ret.signature.substr(0, ret.signature.length - 2);
        }

        // Analyze visibility
        if (name) {
            if (name.charAt(0) === '_') {
                if (name.charAt(1) === '_') {
                    ret.isPrivate = true;
                } else {
                    ret.isProtected = true;
                }
            } else {
                ret.isPublic = true;
            }
        }

        return ret;
    }

    return functionMeta;
});

define('common/propertyMeta',[],function () {

    'use strict';

    /**
     * Extract meta data from a property.
     * For now, the returns an object containing the visibility.
     *
     * @param {Mixed} prop The property
     * @param {String} name The name of the property
     *
     * @return {Object} An object containg the metadata
     */
    function propertyMeta(prop, name) {

        var ret = {};

        // Is it undefined?
        if (prop === undefined) {
            return null;
        }

        // Analyze visibility
        if (name) {
            if (name.charAt(0) === '_') {
                if (name.charAt(1) === '_') {
                    ret.isPrivate = true;
                } else {
                    ret.isProtected = true;
                }
            } else {
                ret.isPublic = true;
            }
        }

        return ret;
    }

    return propertyMeta;
});
define('common/isFunctionCompatible',[],function () {

    'use strict';

    /**
     * Check if a function signature is compatible with another.
     *
     * @param {Function} func1 The function to be checked
     * @param {Function} func2 The function to be compared with
     *
     * @return {Boolean} True if it's compatible, false otherwise
     */
    function isFunctionCompatible(func1, func2) {
        return func1.mandatory === func2.mandatory && func1.optional >= func2.optional;
    }

    return isFunctionCompatible;
});

define('amd-utils/array/append',[],function () {

    /**
     * Appends an array to the end of another.
     * The first array will be modified.
     * @version 0.1.1 (2012/06/10)
     */
    function append(arr1, arr2) {
        var pad = arr1.length,
            i = -1,
            n = arr2.length;
        while (++i < n) {
            arr1[pad + i] = arr2[i];
        }
        return arr1;
    }
    return append;
});

define('common/checkKeywords',[
    'amd-utils/object/hasOwn',
    'amd-utils/array/append'
], function (
    hasOwn,
    append
) {

    'use strict';

    var reservedNormal = ['$constructor', '$initializing', '$static', '$self', '$super'],
        reservedAll = append(['initialize'], reservedNormal),
        reservedStatics = ['$parent', '$super'];

    /**
     * Verify reserved words found in classes/interfaces.
     * The second parameter can be normal or statics.
     * Normal will test for reserved words of the instance.
     * $statics will test for reserved words in the ckass statics.
     *
     * Will throw an error if any reserved key is found.
     *
     * @param {Object} object The object to verify
     * @param {String} [type] The list of reserved word to test (defaults to all)
     */
    function checkKeywords(object, type) {

        var reserved = type === 'normal' || !type ? reservedNormal : (type === 'all' ? reservedAll : reservedStatics),
            x;

        for (x = reserved.length - 1; x >= 0; x -= 1) {
            if (hasOwn(object, reserved[x])) {
                throw new Error('"' + object.$name + '" is using a reserved keyword: ' + reserved[x]);
            }
        }
    }

    return checkKeywords;
});

define('amd-utils/array/some',['require'],function (forEach) {

    /**
     * ES5 Array.some
     * @version 0.2.2 (2012/06/07)
     */
    var some = Array.prototype.some?
                function (arr, callback, thisObj) {
                    return arr.some(callback, thisObj);
                } :
                function (arr, callback, thisObj) {
                    var result = false,
                        n = arr.length,
                        i = 0;
                    while (i < n) {
                        //according to spec callback should only be called for
                        //existing items
                        if ( i in arr && callback.call(thisObj, arr[i], i, arr) ) {
                            result = true;
                            break;
                        }
                        i += 1;
                    }
                    return result;
                };

    return some;
});

define('amd-utils/array/difference',['./unique', './filter', './some', './contains'], function (unique, filter, some, contains) {


    /**
     * Return a new Array with elements that aren't present in the other Arrays.
     * @version 0.1.0 (2011/01/12)
     */
    function difference(arr) {
        var arrs = Array.prototype.slice.call(arguments, 1),
            result = filter(unique(arr), function(needle){
                return !some(arrs, function(haystack){
                    return contains(haystack, needle);
                });
            });
        return result;
    }

    return difference;

});

define('common/testKeywords',[
    'amd-utils/array/difference',
    'amd-utils/object/hasOwn'
], function (
    difference,
    hasOwn
) {

    'use strict';

    var keywords = [
        '$name', '$extends', '$implements', '$borrows',
        '$statics', '$finals', '$abstracts', '$constants'
    ];

    /**
     * Tests if an object contains an unallowed keyword in a given context.
     *
     * @param {String} object    The object to verify
     * @param {Array}  [allowed  The list of allowed keywords (defaults to [])
     *
     * @return {Mixed} False if is ok, or the key that is unallowed.
     */
    function testKeywords(object, allowed) {

        var test = allowed ? difference(keywords, allowed) : keywords,
            x;

        for (x = test.length - 1; x >= 0; x -= 1) {
            if (hasOwn(object, test[x])) {
                return test[x];
            }
        }

        return false;
    }

    return testKeywords;
});

define('common/hasDefineProperty',['amd-utils/lang/isFunction'], function (isFunction) {

    'use strict';

    /**
     * Check if the environment supports Object.hasDefineProperty.
     * There is some quirks related to IE that is handled inside.
     *
     * @return {Boolean} True if it supports, false otherwise
     */
    function hasDefineProperty() {

        if (!isFunction(Object.defineProperty)) {
            return false;
        }

        // Avoid IE8 bug
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            return false;
        }

        return true;
    }

    return hasDefineProperty();
});

define('common/obfuscateProperty',['./hasDefineProperty'], function (hasDefineProperty) {

    'use strict';

    /**
     * Sets the key of object with the specified value.
     * The property is obfuscated, by not being enumerable, configurable and writable.
     *
     * @param {Object}  obj           The object
     * @param {String}  key           The key
     * @param {Mixed}   value         The value
     * @param {Boolean} [isWritable]  True to be writable, false otherwise (defaults to false)
     * @param {Boolean} [isDeletable] True to be deletable, false otherwise (defaults to false)
     */
    function obfuscateProperty(obj, key, value, isWritable, isDeletable) {

        if (hasDefineProperty) {
            Object.defineProperty(obj, key, {
                value: value,
                configurable: isDeletable || false,
                writable: isWritable || false,
                enumerable: false
            });
        } else {
            obj[key] = value;
        }
    }

    return obfuscateProperty;
});

define('common/isObjectPrototypeSpoiled',[],function () {

    'use strict';

    /**
     * Checks if object prototype has non enumerable properties attached.
     *
     * @return {Boolean} True if it is, false otherwise
     */
    function isObjectPrototypeSpoiled() {

        var obj = {},
            key;

        for (key in obj) {
            if (key) {  // This is just to trick jslint..
                return true;
            }
        }

        return false;
    }

    return isObjectPrototypeSpoiled;
});

define('common/checkObjectPrototype',[
    './isObjectPrototypeSpoiled',
    'amd-utils/lang/isFunction'
], function (
    isObjectPrototypeSpoiled,
    isFunction
) {

    'use strict';

    /**
     * Checks object prototype, throwing an error if it has enumerable properties.
     * Also seals it, preventing any additions or deletions.
     */
    function checkObjectPrototype() {

        if (isObjectPrototypeSpoiled()) {
            throw new Error('dejavu will not work properly if Object.prototype has enumerable properties!');
        }

        // TODO: should we really do this? the user could legitimately adding non enumerable properties..
        if (isFunction(Object.seal) && !Object.isSealed(Object.prototype)) {
            Object.seal(Object.prototype);
        }
    }

    return checkObjectPrototype;
});

define('common/randomAccessor',['amd-utils/array/contains'], function (contains) {

    'use strict';

    var random = new Date().getTime() + '_' + Math.floor((Math.random() * 100000000 + 1)),
        nrAccesses = 0,
        allowed = ['ClassWrapper', 'InterfaceWrapper', 'AbstractClassWrapper', 'FinalClassWrapper', 'instanceOfWrapper'];

    /**
     * Provides access to a random string that allows acceess to some hidden properties
     * used through this library.
     *
     * @param {Function} caller The function that is trying to access
     *
     * @return {String} The random string
     */
    function randomAccessor(caller) {

        if (nrAccesses > 5 || !contains(allowed, caller)) {
            throw new Error('Can\'t access random identifier.');
        }

        nrAccesses += 1;

        return random;
    }

    return randomAccessor;
});

define('common/hasFreezeBug',['amd-utils/lang/isFunction'], function (isFunction) {

    'use strict';

    /**
     * Checks if the browser has Object.freeze bug.
     *
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=744494
     *
     * @return {Boolean} True if it has, false otherwise
     */
    function checkHasFreezeBug() {

        if (!isFunction(Object.freeze)) {
            return false;
        }

        // Create a constructor
        var A = function () {},
            a;

        A.prototype.foo = '';
        Object.freeze(A.prototype);   // Freeze prototype

        // Create an instance
        a = new A();

        try {
            a.foo = 'baz';            // Throws a['foo'] is read only
            if (a.foo !== 'baz') {    // Or fails silently in at least IE9
                return true;
            }
        } catch (e) {
            return true;
        }

        return false;
    }

    return checkHasFreezeBug();
});

define('common/printWarning',['amd-utils/lang/isFunction'], function (isFunction) {

    'use strict';

    function printWarning(message) {

        if (typeof console !== 'undefined' && isFunction(console.warn)) {
            console.warn(message);
        }

    }

    return printWarning;
});

define('amd-utils/lang/isNumber',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isNumber(val) {
        return isKind(val, 'Number');
    }
    return isNumber;
});

define('amd-utils/lang/isBoolean',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isBoolean(val) {
        return isKind(val, 'Boolean');
    }
    return isBoolean;
});

define('common/isImmutable',[
    'amd-utils/lang/isNumber',
    'amd-utils/lang/isString',
    'amd-utils/lang/isBoolean'
], function (
    isNumber,
    isString,
    isBoolean
) {

    'use strict';

    /**
     * Checks if a value is immutable.
     *
     * @param {Mixed} value The value
     *
     * @return {Boolean} True if it is, false otherwise
     */
    function isImmutable(value) {
        return value == null || isBoolean(value) || isNumber(value) || isString(value);
    }

    return isImmutable;
});

define('common/isPlainObject',[
    'amd-utils/lang/isFunction',
    'amd-utils/object/hasOwn'
], function (
    isFunction,
    hasOwn
) {

    'use strict';

    var hasObjectPrototypeOf = isFunction(Object.getPrototypeOf);

    /**
     * Checks if a given object is a plain object.
     *
     * @param {Object} obj The object
     */
    function isPlainObject(obj) {

        var proto = '__proto__',
            key;

        if (obj.nodeType || obj === obj.window) {
            return false;
        }

        try {
            proto = hasObjectPrototypeOf ? Object.getPrototypeOf(obj) : obj[proto];

            if (proto && proto !== Object.prototype) {
                return false;
            }

            if (obj.constructor && !hasOwn(obj, 'constructor') && !hasOwn(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;       // IE8,9 Will throw exceptions on certain host objects
        }

        for (key in obj) {}

        return key === undefined || hasOwn(obj, key);
    }

    return isPlainObject;
});

define('amd-utils/lang/isArray',['./isKind'], function (isKind) {
    /**
     * @version 0.2.0 (2011/12/06)
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    return isArray;
});

define('amd-utils/lang/isDate',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isDate(val) {
        return isKind(val, 'Date');
    }
    return isDate;
});

define('amd-utils/lang/isRegExp',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isRegExp(val) {
        return isKind(val, 'RegExp');
    }
    return isRegExp;
});

define('amd-utils/object/mixIn',['./hasOwn'], function(hasOwn){

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    * @version 0.1.2 (2012/04/30)
    */
    function mixIn(target, objects){
        var i = 1,
            key, cur;
        while(cur = arguments[i++]){
            for(key in cur){
                if(hasOwn(cur, key)){
                    target[key] = cur[key];
                }
            }
        }
        return target;
    }

    return mixIn;
});

define('amd-utils/lang/createObject',['../object/mixIn'], function(mixIn){

    /**
     * Create Object using prototypal inheritance and setting custom properties.
     * - Mix between Douglas Crockford Prototypal Inheritance <http://javascript.crockford.com/prototypal.html> and the EcmaScript 5 `Object.create()` method.
     * @param {object} parent    Parent Object.
     * @param {object} [props] Object properties.
     * @return {object} Created object.
     * @version 0.1.0 (2011/08/09)
     */
    function createObject(parent, props){
        function F(){}
        F.prototype = parent;
        return mixIn(new F(), props);

    }
    return createObject;
});


define('amd-utils/array/combine',['./indexOf'], function (indexOf) {

    /**
     * Combines an array with all the items of another.
     * Does not allow duplicates and is case and type sensitive.
     * @version 0.1.0 (2012/01/28)
     */
    function combine(arr1, arr2) {

        var x, length = arr2.length;

        for (x = 0; x < length; x++) {
            if (indexOf(arr1, arr2[x]) === -1) {
                arr1.push(arr2[x]);
            }
        }

        return arr1;
    }
    return combine;
});

define('common/mixIn',[],function () {

    'use strict';

    /**
     * This method does exactly the same as the amd-utils counterpart but
     * does not perform hasOwn for each key in the objects.
     * This is only done because the object prototype is sealed and to get an extra performance.
     *
     * @param {object}    target  Target Object
     * @param {...object} objects Objects to be combined (0...n objects)
     *
     * @return {object} Target Object
     */
    function mixIn(target, objects) {

        var x,
            length = arguments.length,
            key,
            curr;

        for (x = 1; x < length; x += 1) {
            curr = arguments[x];
            for (key in arguments[x]) {
                target[key] = curr[key];
            }
        }

        return target;
    }

    return mixIn;
});

define('amd-utils/lang/bind',[],function(){

    function slice(arr, offset){
        return Array.prototype.slice.call(arr, offset || 0);
    }

    /**
     * Return a function that will execute in the given context, optionally adding any additional supplied parameters to the beginning of the arguments collection.
     * @param {Function} fn  Function.
     * @param {object} context   Execution context.
     * @param {rest} args    Arguments (0...n arguments).
     * @return {Function} Wrapped Function.
     * @version 0.1.0 (2011/02/18)
     */
    function bind(fn, context, args){
        var argsArr = slice(arguments, 2); //curried args
        return function(){
            return fn.apply(context, argsArr.concat(slice(arguments)));
        };
    }

    return bind;
});


define('amd-utils/lang/isArguments',['./isKind'], function (isKind) {

    /**
     * @version 0.2.0 (2011/12/05)
     */
    var isArgs = isKind(arguments, 'Arguments')?
            function(val){
                return isKind(val, 'Arguments');
            } :
            function(val){
                // Arguments is an Object on IE7
                return !!(val && Object.prototype.hasOwnProperty.call(val, 'callee'));
            };

    return isArgs;
});

define('amd-utils/lang/toArray',['./isArray', './isObject', './isArguments'], function (isArray, isObject, isArguments) {

    var _win = this;

    /**
     * Convert array-like object into array
     * @version 0.2.0 (2011/12/05)
     */
    function toArray(val){
        var ret;

        if (val == null) {
            ret = [];
        } else if ( val && val !== _win && (isArray(val) || isArguments(val) || (isObject(val) && 'length' in val)) ) {
            //window returns true on isObject in IE7 and may have length property
            //only convert object to array if it is a array-like object
            ret = Array.prototype.slice.call(val);
        } else {
            //string, regexp, function have .length but user probably just want
            //to wrap value into an array..
            ret = [val];
        }
        return ret;
    }
    return toArray;
});

define('amd-utils/lang/clone',['../object/forOwn', './kindOf'], function (forOwn, kindOf) {

    /**
     * Clone native types.
     * @version 0.1.0 (2012/07/13)
     */
    function clone(val){
        var result;
        switch ( kindOf(val) ) {
            case 'Object':
                result = cloneObject(val);
                break;
            case 'Array':
                result = deepCloneArray(val);
                break;
            case 'RegExp':
                result = cloneRegExp(val);
                break;
            case 'Date':
                result = cloneDate(val);
                break;
            default:
                result = val;
        }
        return result;
    }

    function cloneObject(source) {
        var out = {};
        forOwn(source, copyProperty, out);
        return out;
    }

    function copyProperty(val, key){
        this[key] = clone(val);
    }

    function cloneRegExp(r){
        var flags = '';
        flags += r.multiline? 'm' : '';
        flags += r.global? 'g' : '';
        flags += r.ignoreCase? 'i' : '';
        return new RegExp(r.source, flags);
    }

    function cloneDate(date){
        return new Date( date.getTime() );
    }

    function deepCloneArray(arr){
        var out = [],
            i = -1,
            n = arr.length,
            val;
        while (++i < n) {
            out[i] = clone(arr[i]);
        }
        return out;
    }

    return clone;

});


define('amd-utils/array/insert',['./difference', '../lang/toArray'], function (difference, toArray) {

    /**
     * Insert item into array if not already present.
     * @version 0.2.0 (2012/01/28)
     */
    function insert(arr, rest_items) {
        var diff = difference(toArray(arguments).slice(1), arr);
        if (diff.length) {
            Array.prototype.push.apply(arr, diff);
        }
        return arr.length;
    }
    return insert;
});

/*jshint strict:false, noarg:false, expr:true*/

define('Class',[
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
    './common/printWarning',
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
    'amd-utils/lang/bind',
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
    obfuscateProperty,
    hasDefineProperty,
    checkObjectPrototype,
    randomAccessor,
    hasFreezeBug,
    printWarning,
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

    checkObjectPrototype();

    var Class,
        random = randomAccessor('ClassWrapper'),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        $abstract = '$abstract_' + random,
        $bound = '$bound_' + random,
        $name = '$name_' + random,
        $anonymous = '$anonymous_' + random,
        cacheKeyword = '$cache_' + random,
        inheriting,
        nextId = 0,
        caller,
        callerClassId,
        callerClassBaseId,
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
            parent = parentMeta.isPrivate && method[$name] === 'initialize' ? callingPrivateConstructor : parentMeta.implementation;
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

        if (method[$name]) {
            obfuscateProperty(wrapper, $name, method[$name]);
        }

        return wrapper;
    }

    /**
     * Wraps a method.
     * This is to make some alias such as $super and $self to work correctly.
     *
     * @param {Function} method      The method to wrap
     * @param {Function} constructor The constructor
     * @param {String}   classId     The class id
     * @param {String}   classBaseId The class base id
     * @param {Object}   parentMeta  The parent method metadata
     *
     * @return {Function} The wrapper
     */
    function wrapStaticMethod(method, constructor, classId, classBaseId, parentMeta) {

        if (method.$wrapped) {
            throw new Error('Method is already wrapped.');
        }

        var parent = parentMeta ? parentMeta.implementation : parentMeta,
            wrapper;

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
            this.$self =  constructor;

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

        if (method[$name]) {
            obfuscateProperty(wrapper, $name, method[$name]);
        }

        return wrapper;
    }

    /**
     * Default function to execute when a class atempts to call its parent private constructor.
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
        if (method[$name]) {
            if (method[$name] !== name) {
                throw new Error('Method "' + name + '" of class "' + constructor.prototype.$name + '" seems to be used several times by the same or another class.');
            }
        } else {
            obfuscateProperty(method, $name, name);
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
        method = !isStatic ?
                  wrapMethod(method, constructor, constructor[$class].id, constructor[$class].baseId, constructor.$parent && constructor.$parent[$class].methods[name] ? constructor.$parent[$class].methods[name] : null) :
                  wrapStaticMethod(method, constructor, constructor[$class].id, constructor[$class].baseId, constructor.$parent && constructor.$parent[$class].staticMethods[name] ? constructor.$parent[$class].staticMethods[name] : null);

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

        if (metadata.isProtected) {
            allowed = constructor[$class].baseId;
        } else if (metadata.isPrivate) {
            allowed = constructor[$class].id;
        }

        // If the function is specified to be bound, add it to the binds
        if (originalMethod[$bound]) {
            if (!isStatic) {
                insert(constructor[$class].binds, name);
            }
            delete originalMethod[$bound];
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
                    if (constructor.prototype[key] === undefined) {    // Already defined members are not overwritten
                        opts.metadata = current.$constructor[$class].methods[key];
                        addMethod(key, opts.metadata.implementation || current[key], constructor, opts);
                    }
                }

                for (key in current.$constructor[$class].properties) {
                    if (constructor.prototype[key] === undefined) {    // Already defined members are not overwritten
                        opts.metadata = current.$constructor[$class].properties[key];
                        addProperty(key, opts.metadata.value || current[key], constructor, opts);
                    }
                }

                opts.isStatic = true;

                // Grab mixin static members
                for (key in current.$constructor[$class].staticMethods) {
                    if (constructor[key] === undefined) {              // Already defined members are not overwritten
                        opts.metadata = current.$constructor[$class].staticMethods[key];
                        addMethod(key, opts.metadata.implementation || current.$constructor[key], constructor, opts);
                    }
                }

                for (key in current.$constructor[$class].staticProperties) {
                    if (constructor[key] === undefined) {              // Already defined members are not overwritten
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

                    var method = this[cacheKeyword].methods[name],
                        currCaller,
                        isConstructor = name === 'initialize';

                    if (!isConstructor && !this.$underStrict && !this.$constructor[$class].$underStrict) {
                        currCaller = get.caller || arguments.callee.caller || arguments.caller || caller;  // Ignore JSLint error regarding .caller and .callee
                    } else {
                        currCaller = caller;
                    }

                    if (this.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
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

                    if (this.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
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

                    if (inheriting || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
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

                    if (inheriting || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
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

                    if (this.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
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

                    if (this.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
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

                    if (this.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
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

                    if (this.$initializing || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
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

                    if (inheriting || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId))))) {
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

                            if (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || (isArray(meta.allowed) && contains(meta.allowed, callerClassId)))) {
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

                    if (inheriting || (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId)))))) {
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

                            if (currCaller && (currCaller[$name] || currCaller[$anonymous]) && (meta.allowed === callerClassId || meta.allowed === callerClassBaseId || (isArray(meta.allowed) && (contains(meta.allowed, callerClassId) || contains(meta.allowed, callerClassBaseId))))) {
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
            //Object.seal(constructor);
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

            obfuscateProperty(this, '$initializing', true, true, true);  // Mark it in order to let abstract classes run their initialize
            obfuscateProperty(this, '$super', null, true);               // Add the super to the instance object to speed lookup of the wrapper function
            obfuscateProperty(this, '$self', null, true);                // Add the self to the instance object to speed lookup of the wrapper function

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

            delete this.$initializing;

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
     * Anonymous bind.
     *
     * @param {Function} func   The function to be bound
     * @param {...mixed} [args] The arguments to also be bound
     */
    function anonymousBind(func) {

        if (func[$name]) {
            throw new Error('Function with name "' + func[$name] + '" is not anonymous.');
        }

        if (func[$anonymous]) {
            throw new Error('Anonymous function cannot be bound twice.');
        }

        // TODO: improve the bind here
        var args = toArray(arguments),
            bound;

        args.splice(1, 0, this);
        bound = bind.apply(func, args);
        bound[$anonymous] = func[$anonymous] = true;
        bound = wrapMethod(bound, this.$self, callerClassId, callerClassBaseId);

        return bound;
    }

    /**
     * Anonymous bind for static methods.
     *
     * @param {Function} func   The function to be bound
     * @param {...mixed} [args] The arguments to also be bound
     */
    function anonymousBindStatic(func) {

        if (func[$name]) {
            throw new Error('Function with name "' + func[$name] + '" is not anonymous.');
        }

        if (func[$anonymous]) {
            throw new Error('Anonymous function cannot be bound twice.');
        }

        // TODO: improve the bind here
        var args = toArray(arguments),
            bound;

        args.splice(1, 0, this);
        bound = bind.apply(func, args);
        bound[$anonymous] = func[$anonymous] = true;
        bound = wrapStaticMethod(bound, this.$self, callerClassId, callerClassBaseId);

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
     * @param {Object} params An object containing methods and properties
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
        obfuscateProperty(dejavu, '$static', dejavu);
        obfuscateProperty(dejavu, '$bind', anonymousBindStatic);
        if (!dejavu.$parent) {
            obfuscateProperty(dejavu.prototype, '$bind', anonymousBind);
        }

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

    if (Function.prototype.$bound) {
        printWarning('Function.prototype.$bound is already defined and will be overwritten.');
    }

    // Add custom bound/bind function to supply binds
    obfuscateProperty(Function.prototype, '$bound', function (context) {
        this[$bound] = true;

        return this;
    });

    if (Function.prototype.$bind) {
        printWarning('Function.prototype.$bind is already defined and will be overwritten.');
    }

    obfuscateProperty(Function.prototype, '$bind', function (context) {
        if (!arguments.length) {
            this[$bound] = true;

            return this;
        }

        var args = toArray(arguments);
        args.splice(0, 1, this);

        if (isFunction(context)) {
            return anonymousBindStatic.apply(context, args);
        }

        return anonymousBind.apply(context, args);
    });

    return Class;
});
/*jshint regexp:false*/

define('common/isFunctionEmpty',[],function () {

    'use strict';

    /**
     * Check if a function has no body.
     *
     * @param {Function} func The function
     *
     * @return {Boolean} True if it's empty, false otherwise
     */
    function isFunctionEmpty(func) {
        return (/^function\s*\([^\(]*\)\s*\{\s*(["']use strict["'];)?\s*\}$/m).test(func.toString());
    }

    return isFunctionEmpty;
});

define('AbstractClass',[
    'amd-utils/lang/isObject',
    'amd-utils/lang/isFunction',
    'amd-utils/lang/isString',
    'amd-utils/lang/toArray',
    'amd-utils/lang/bind',
    './common/functionMeta',
    './common/isFunctionEmpty',
    './common/isFunctionCompatible',
    './common/checkKeywords',
    './common/testKeywords',
    './common/checkObjectPrototype',
    './common/hasDefineProperty',
    './common/randomAccessor',
    './common/mixIn',
    'amd-utils/object/hasOwn',
    'amd-utils/array/insert',
    './Class'
], function AbstractClassWrapper(
    isObject,
    isFunction,
    isString,
    toArray,
    bind,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible,
    checkKeywords,
    testKeywords,
    checkObjectPrototype,
    hasDefineProperty,
    randomAccessor,
    mixIn,
    hasOwn,
    insert,
    Class
) {

    'use strict';

    var random = randomAccessor('AbstractClassWrapper'),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        $abstract = '$abstract_' + random,
        checkClass;

    checkObjectPrototype();

    /**
     * Add an abstract method to an abstract class.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *
     * @param {String}   name        The method name
     * @param {Function} method      The method itself
     * @param {Object}   constructor The class constructor
     * @param {Object}   [opts]      The options, defaults to {}
     */
    function addMethod(name, method, constructor, opts) {

        var metadata,
            isStatic = opts && opts.isStatic,
            target;

        // Check if it is a private member
        if (name.substr(0, 2) === '__') {
            throw new Error('Abstract class "' + constructor.prototype.$name + '" contains an unallowed abstract ' + (isStatic ? 'static ' : '') + 'private method: "' + name + '".');
        }
        // Check if it contains implementation
        if (!isFunctionEmpty(method)) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" must be anonymous and contain no implementation in abstract class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor : constructor.prototype;

        // Check if function is ok
        metadata = functionMeta(method, name);
        if (metadata === null) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in abstract class "' + constructor.prototype.$name + '".');
        }

        // Check if a variable exists with the same name
        target = isStatic ? constructor[$class].staticProperties : constructor[$class].properties;
        if (isObject(target[name])) {
            throw new Error('Abstract method "' + name + '" defined in abstract class "' + constructor.prototype.$name + "' conflicts with an already defined property.");
        }


        target = isStatic ? constructor[$class].staticMethods : constructor[$class].methods;

        // Check if it is already implemented
        if (isObject(target[name])) {
            throw new Error('Abstract method "' + name + '" defined in abstract class "' + constructor.prototype.$name + "' seems to be already implemented and cannot be declared as abstract anymore.");
        }

        target = isStatic ? constructor[$abstract].staticMethods : constructor[$abstract].methods;

        // Check if the method already exists and if it's compatible
        if (isObject(target[name])) {
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in abstract class "' + constructor.prototype.$name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        if (!isStatic) {
            insert(constructor[$class].binds, name);
        }

        metadata.checkCompatibility = true;

        target[name] = metadata;
    }

    /**
     * Checks if an abstract class is well implemented in a class.
     * In order to this function to work, it must be bound to an abstract class definition.
     *
     * @param {Function} target The class to be checked
     */
    checkClass = function (target) {

        var key,
            value;

        // Check normal functions
        for (key in this[$abstract].methods) {

            value = this[$abstract].methods[key];

            if (!target[$class].methods[key]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement abstract class "' + this.prototype.$name + '" correctly, method "' + key + '" was not found.');
            }
            if (!isFunctionCompatible(target[$class].methods[key], value)) {
                throw new Error('Method "' + key + '(' + target[$class].methods[key].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in abstract class "' + this.prototype.$name + '": "' + key + '(' + value.signature + ').');
            }
        }

        // Check static functions
        for (key in this[$abstract].staticMethods) {

            value = this[$abstract].staticMethods[key];

            if (!target[$class].staticMethods[key]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement abstract class "' + this.prototype.$name + '" correctly, static method "' + key + '" was not found.');
            }
            if (!isFunctionCompatible(target[$class].staticMethods[key], value)) {
                throw new Error('Static method "' + key + '(' + target[$class].staticMethods[key].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in abstract class "' + this.prototype.$name + '": "' + key + '(' + value.signature + ').');
            }
        }
    };

    /**
     * Parse abstract methods.
     *
     * @param {Object}   abstracts   The object that contains the abstract methods
     * @param {Function} constructor The constructor
     */
    function parseAbstracts(abstracts, constructor) {

        var optsStatic = { isStatic: true },
            key,
            value,
            unallowed;

        // Check argument
        if (!isObject(abstracts)) {
            throw new Error('$abstracts defined in abstract class "' + constructor.prototype.$name + "' must be an object.");
        }

        // Check reserved keywords
        checkKeywords(abstracts);

        // Check unallowed keywords
        unallowed = testKeywords(abstracts, ['$statics']);
        if (unallowed) {
            throw new Error('$statics inside $abstracts of abstract class "' + constructor.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
        }

        if (hasOwn(abstracts, '$statics')) {

            // Check argument
            if (!isObject(abstracts.$statics)) {
                throw new Error('$statics definition in $abstracts of abstract class "' + constructor.prototype.$name + '" must be an object.');
            }

            // Check keywords
            checkKeywords(abstracts.$statics, 'statics');

            // Check unallowed keywords
            unallowed = testKeywords(abstracts.$statics);
            if (unallowed) {
                throw new Error('$statics inside $abstracts of abstract class "' + constructor.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
            }

            for (key in abstracts.$statics) {

                value = abstracts.$statics[key];

                // Check if it is not a function
                if (!isFunction(value) || value[$interface] || value[$class]) {
                    throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.$name + '" is not a function.');
                }

                addMethod(key, value, constructor, optsStatic);
            }

            delete abstracts.$statics;
        }

        for (key in abstracts) {

            value = abstracts[key];

            // Check if it is not a function
            if (!isFunction(value) || value[$interface] || value[$class]) {
                throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.$name + '" is not a function.');
            }

            addMethod(key, value, constructor);
        }
    }

    /**
     * Parse interfaces.
     *
     * @param {Array}    interfaces  The interfaces
     * @param {Function} constructor The constructor
     */
    function parseInterfaces(interfaces, constructor) {

        var interfs = toArray(interfaces),
            x = interfs.length,
            interf,
            key,
            value;

        for (x -= 1; x >= 0; x -= 1) {

            interf = interfs[x];

            // Grab methods
            for (key in interf[$interface].methods) {

                value = interf[$interface].methods[key];

                 // Check if method is already defined as abstract and is compatible
                if (constructor[$abstract].methods[key]) {
                    if (!isFunctionCompatible(constructor[$abstract].methods[key], value)) {
                        throw new Error('Method "' + key + '( ' + value.signature + ')" described in interface "' + interf.prototype.$name + '" is not compatible with the one already defined in "' + constructor.prototype.$name + '": "' + key + '(' + constructor[$abstract].methods[key].signature + ')".');
                    }
                } else {
                    constructor[$abstract].methods[key] = interf[$interface].methods[key];
                }
            }

            // Grab static methods
            for (key in interf[$interface].staticMethods) {

                value = interf[$interface].staticMethods[key];

                // Check if method is already defined as abstract and is compatible
                if (constructor[$abstract].staticMethods[key]) {
                    if (!isFunctionCompatible(constructor[$abstract].staticMethods[key], value)) {
                        throw new Error('Static method "' + key + '( ' + value.signature + ')" described in interface "' + interf.prototype.$name + '" is not compatible with the one already defined in "' + constructor.prototype.$name + '": "' + key + '(' + constructor[$abstract].staticMethods[key].signature + ')".');
                    }
                } else {
                    constructor[$abstract].staticMethods[key] = value;
                }
            }
        }
    }

    /**
     * Create an abstract class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function AbstractClass(params) {

        if (!isObject(params)) {
            throw new Error('Argument "params" must be an object while defining an abstract class.');
        }
        // Validate class name
        if (hasOwn(params, '$name')) {
            if (!isString(params.$name)) {
                throw new Error('Abstract class name must be a string.');
            } else if (/\s+/.test(params.$name)) {
                throw new Error('Abstract class name cannot have spaces.');
            }
        } else {
            params.$name = 'Unnamed';
        }

        var def,
            abstractObj = { methods: {}, staticMethods: {} },
            saved = {};

        // If we are extending an abstract class also, inherit the abstract methods
        if (isFunction(params.$extends)) {

            if (params.$extends[$abstract]) {
                mixIn(abstractObj.methods, params.$extends[$abstract].methods);
                mixIn(abstractObj.staticMethods, params.$extends[$abstract].staticMethods);
            }
        }

        // Handle abstract methods
        if (hasOwn(params, '$abstracts')) {
            saved.$abstracts = params.$abstracts;     // Save them for later use
        }

        // Handle interfaces
        if (hasOwn(params, '$implements')) {
            saved.$interfaces = params.$implements;   // Save them for later use
        }

        // Create the class definition
        def = new Class(params, true);

        abstractObj.check = bind(checkClass, def);

        if (hasDefineProperty) {
            Object.defineProperty(def, $abstract, {
                value: abstractObj,
                writable: false
            });
        } else {
            def[$abstract] = abstractObj;
        }

        // Parse the saved interfaces
        if (hasOwn(saved, '$interfaces')) {
            parseInterfaces(saved.$interfaces, def);
        }

        // Parse the abstract methods
        if (hasOwn(saved, '$abstracts')) {
            parseAbstracts(saved.$abstracts, def);
        }

        return def;
    }

    return AbstractClass;
});

define('Interface',[
    'amd-utils/lang/isObject',
    'amd-utils/lang/isFunction',
    'amd-utils/lang/isArray',
    'amd-utils/lang/isString',
    'amd-utils/lang/bind',
    'amd-utils/array/intersection',
    'amd-utils/array/unique',
    'amd-utils/array/compact',
    'amd-utils/object/keys',
    './common/checkKeywords',
    './common/testKeywords',
    './common/functionMeta',
    './common/isFunctionEmpty',
    './common/isFunctionCompatible',
    './common/checkObjectPrototype',
    './common/obfuscateProperty',
    './common/randomAccessor',
    './common/isImmutable',
    './common/hasDefineProperty',
    './common/mixIn',
    'amd-utils/object/hasOwn',
    'amd-utils/lang/toArray'
], function InterfaceWrapper(
    isObject,
    isFunction,
    isArray,
    isString,
    bind,
    intersection,
    unique,
    compact,
    keys,
    checkKeywords,
    testKeywords,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible,
    checkObjectPrototype,
    obfuscateProperty,
    randomAccessor,
    isImmutable,
    hasDefineProperty,
    mixIn,
    hasOwn,
    toArray
) {

    'use strict';

    var random = randomAccessor('InterfaceWrapper'),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        checkClass;

    checkObjectPrototype();

    /**
     * Checks if an interface is well implemented in a class.
     * In order to this function to work, it must be bound to an interface definition.
     *
     * @param {Function} target The class to be checked
     */
    checkClass = function (target) {

        var key,
            value;

        // Check normal functions
        for (key in this[$interface].methods) {

            value = this[$interface].methods[key];

            if (!target[$class].methods[key]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement interface "' + this.prototype.$name + '" correctly, method "' + key + '" was not found.');
            }
            if (!isFunctionCompatible(target[$class].methods[key], value)) {
                throw new Error('Method "' + key + '(' + target[$class].methods[key].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in interface "' + this.prototype.$name + '": "' + key + '(' + value.signature + ').');
            }
        }

        // Check static functions
        for (key in this[$interface].staticMethods) {

            value = this[$interface].staticMethods[key];

            if (!target[$class].staticMethods[key]) {
                throw new Error('Class "' + target.prototype.$name + '" does not implement interface "' + this.prototype.$name + '" correctly, static method "' + key + '" was not found.');
            }
            if (!isFunctionCompatible(target[$class].staticMethods[key], value)) {
                throw new Error('Static method "' + key + '(' + target[$class].staticMethods[key].signature + ')" defined in class "' + target.prototype.$name + '" is not compatible with the one found in interface "' + this.prototype.$name + '": "' + key + '(' + value.signature + ').');
            }
        }
    };

    /**
     * Adds a method to an interface.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *
     * @param {String}   name   The method name
     * @param {Function} method The method itself
     * @param {Function} interf The interface in which the method metadata will be saved
     * @param {Object}   [opts] The options (defaults to {})
     */
    function addMethod(name, method, interf, opts) {

        var metadata,
            isStatic = opts && opts.isStatic,
            target;

        // Check if it is not a function
        if (!isFunction(method) || method[$interface] || method[$class]) {
            throw new Error('Member "' + name + '" found in interface "' + interf.prototype.$name + '" is not a function.');
        }
        // Check if it is public
        if (name.charAt(0) === '_') {
            throw new Error('Interface "' + interf.prototype.$name + '" contains an unallowed non public method: "' + name + '".');
        }
        // Check if it contains no implementation
        if (!isFunctionEmpty(method)) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" must be anonymous and contain no implementation in interface "' + interf.prototype.$name + '".');
        }
        // Check if function is ok
        metadata = functionMeta(method, name);
        if (metadata === null) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in interface "' + interf.prototype.$name + '".');
        }

        target = isStatic ? interf[$interface].staticMethods : interf[$interface].methods;

        // Check if the method already exists and it's compatible
        if (isObject(target[name])) {
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in interface "' + interf.prototype.$name + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        target[name] = metadata;
    }

    /**
     * Assigns a constant to the interface.
     * This method will protect the constant from being changed.
     *
     * @param {String}   name        The constant name
     * @param {Function} value       The constant value
     * @param {Function} interf      The interface in which the constant will be saved
     */
    function assignConstant(name, value, interf) {

        if (hasDefineProperty) {
            Object.defineProperty(interf, name, {
                get: function () {
                    return value;
                },
                set: function () {
                    throw new Error('Cannot change value of constant property "' + name + '" of interface "' + this.prototype.$name + '".');
                },
                configurable: false,
                enumerable: true
            });
        } else {
            interf[name] = value;
        }
    }

    /**
     * Adds a constant to an interface.
     * This method will throw an error if something is not right.
     *
     * @param {String}   name        The constant name
     * @param {Function} value       The constant value
     * @param {Function} interf      The interface in which the constant will be saved
     */
    function addConstant(name, value, interf) {

        var target;

        // Check if it is public
        if (name.charAt(0) === '_') {
            throw new Error('Interface "' + interf.prototype.$name + '" contains an unallowed non public method: "' + name + '".');
        }
        // Check if it is a primitive value
        if (!isImmutable(value)) {
            throw new Error('Value for constant property "' + name + '" defined in interface "' + interf.prototype.$name + '" must be a primitive type.');
        }

        target = interf[$interface].constants;

        // Check if the constant already exists
        if (target[name]) {
            throw new Error('Cannot override constant property "' + name + '" in interface "' + interf.prototype.$name + '".');
        }

        target[name] = true;
        assignConstant(name, value, interf);
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
            throw new Error('Argument "params" must be an object while defining an interface.');
        }
        // Validate class name
        if (hasOwn(params, '$name')) {
            if (!isString(params.$name)) {
                throw new Error('Interface name must be a string.');
            } else if (/\s+/.test(params.$name)) {
                throw new Error('Interface name cannot have spaces.');
            }
        } else {
            params.$name = 'Unnamed';
        }

        checkKeywords(params);

        var parents,
            current,
            k,
            i,
            value,
            duplicate,
            opts = {},
            name,
            ambiguous,
            unallowed,
            interf = function () {
                throw new Error('Interfaces cannot be instantiated.');
            };

        obfuscateProperty(interf, $interface, { parents: [], methods: {}, staticMethods: {}, constants: {}, check: bind(checkClass, interf) });
        interf.prototype.$name = params.$name;

        if (hasOwn(params, '$extends')) {

            parents = toArray(params.$extends);
            k = parents.length;

            // Verify argument type
            if (!k && !isArray(params.$extends)) {
                throw new Error('$extends of "' + params.$name + '" seems to point to an nonexistent interface.');
            }
            // Verify duplicate entries
            if (k !== unique(parents).length && compact(parents).length === k) {
                throw new Error('There are duplicate entries defined in $extends of "' + params.$name + '".');
            }

            for (k -= 1; k >= 0; k -= 1) {

                current = parents[k];

                // Check if it is a valid interface
                if (!isFunction(current) || !current[$interface]) {
                    throw new Error('Specified interface in $extends at index ' +  k + ' of "' + params.$name + '" is not a valid interface.');
                }

                // Merge methods
                duplicate = intersection(keys(interf[$interface].methods), keys(current[$interface].methods));
                i = duplicate.length;
                if (i) {
                    for (i -= 1; i >= 0; i -= 1) {
                        if (!isFunctionCompatible(interf[$interface].methods[duplicate[i]], current[$interface].methods[duplicate[i]]) &&
                                !isFunctionCompatible(current[$interface].methods[duplicate[i]], interf[$interface].methods[duplicate[i]])) {
                            throw new Error('Interface "' + params.$name + '" is inheriting method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }
                mixIn(interf[$interface].methods, current[$interface].methods);

                // Merge static methods
                duplicate = intersection(keys(interf[$interface].staticMethods), keys(current[$interface].staticMethods));
                i = duplicate.length;
                if (i) {
                    for (i -= 1; i >= 0; i -= 1) {
                        if (!isFunctionCompatible(interf[$interface].staticMethods[duplicate[i]], current[$interface].staticMethods[duplicate[i]]) &&
                                !isFunctionCompatible(current[$interface].staticMethods[duplicate[i]], interf[$interface].staticMethods[duplicate[i]])) {
                            throw new Error('Interface "' + params.$name + '" is inheriting static method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }
                mixIn(interf[$interface].staticMethods, current[$interface].staticMethods);

                // Add interface constants
                for (i in current[$interface].constants) {
                    if (interf[$interface].constants[i]) {
                        if (interf[i] !== current[i]) {
                            throw new Error('Interface "' + params.$name + '" is inheriting constant property "' + i + '" from different parents with different values.');
                        }
                    } else {
                        interf[$interface].constants[i] = current[$interface].constants[i];
                        assignConstant(i, current[i], interf);
                    }
                }

                // Add interface to the parents
                interf[$interface].parents.push(current);
            }

            delete params.$extends;
        }

        // Check if the interface defines the initialize function
        if (hasOwn(params, 'initialize')) {
            throw new Error('Interface "' + params.$name + '" can\'t define the initialize method.');
        }

        // Parse constants
        if (hasOwn(params, '$constants')) {

            // Check argument
            if (!isObject(params.$constants)) {
                throw new Error('$constants definition of interface "' + params.$name + '" must be an object.');
            }

            // Check reserved keywords
            checkKeywords(params.$constants, 'statics');

            // Check unallowed keywords
            unallowed = testKeywords(params.$constants);
            if (unallowed) {
                throw new Error('$constants of interface "' + interf.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
            }

            // Check ambiguity
            if (hasOwn(params, '$statics')) {
                ambiguous = intersection(keys(params.$constants), keys(params.$statics));
                if (ambiguous.length) {
                    throw new Error('There are members defined in interface "' + params.$name + '" with the same name but with different modifiers: "' + ambiguous.join('", ') + '".');
                }
            }

            for (k in params.$constants) {
                addConstant(k, params.$constants[k], interf);
            }

            delete params.$constants;
        }

        // Parse statics
        if (hasOwn(params, '$statics')) {

            // Check argument
            if (!isObject(params.$statics)) {
                throw new Error('$statics definition of interface "' + params.$name + '" must be an object.');
            }

            // Check reserved keywords
            checkKeywords(params.$statics, 'statics');

            // Check unallowed keywords
            unallowed = testKeywords(params.$statics);
            if (unallowed) {
                throw new Error('$statics of interface "' + interf.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
            }

            opts.isStatic = true;

            for (k in params.$statics) {

                value = params.$statics[k];

                // Check if it is not a function
                if (!isFunction(value) || value[$interface] || value[$class]) {
                    throw new Error('Static member "' + k + '" found in interface "' + params.$name + '" is not a function.');
                }

                addMethod(k, value, interf, opts);
            }

            delete opts.isStatic;
            delete params.$statics;
        }

        name = params.$name;
        delete params.$name;

        // Check unallowed keywords
        unallowed = testKeywords(params, ['$extends', '$statics', '$constants']);
        if (unallowed) {
            throw new Error('$statics of interface "' + interf.prototype.$name + '" contains an unallowed keyword: "' + unallowed + '".');
        }

        for (k in params) {
            addMethod(k, params[k], interf);
        }

        params.$name = name;

        return interf;
    }

    return Interface;
});

define('FinalClass',[
    './Class'
    , './common/randomAccessor'
    , './common/checkObjectPrototype'
], function FinalClassWrapper(
    Class
    , randomAccessor
    , checkObjectPrototype
) {

    'use strict';

    checkObjectPrototype();

    var random = randomAccessor('FinalClassWrapper'),
        $class = '$class_' + random;

    return function FinalClass(params) {

        var def = new Class(params);
        def[$class].finalClass = true;

        return def;
    };
});

define('instanceOf',[
    './common/randomAccessor'
], function instanceOfWrapper(
    randomAccessor
) {

    'use strict';

    var random = randomAccessor('instanceOfWrapper'),
        $class = '$class_' + random,
        $interface = '$interface_' + random;

    /**
     * Check if an interface is descendant of another.
     *
     * @param {Function} interf1 The interface to be checked
     * @param {Function} interf2 The interface to be expected as the ancestor
     *
     * @return {Boolean} True if it's a descendant, false otherwise
     */
    function interfaceDescendantOf(interf1, interf2) {

        var x,
            parents = interf1[$interface].parents;

        for (x = parents.length - 1; x >= 0; x -= 1) {
            if (parents[x] === interf2) {
                return true;
            }
            if (interfaceDescendantOf(interf1, parents[x])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if an instance of a class is an instance of an interface.
     *
     * @param {Object}   instance The instance to be checked
     * @param {Function} target   The interface
     *
     * @return {Boolean} True if it is, false otherwise
     */
    function instanceOfInterface(instance, target) {

        var x,
            interfaces = instance.$constructor[$class].interfaces;

        for (x = interfaces.length - 1; x >= 0; x -= 1) {
            if (interfaces[x] === target || interfaceDescendantOf(interfaces[x], target)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Custom instanceOf that also works on interfaces.
     *
     * @param {Object}   instance The instance to be checked
     * @param {Function} target   The target
     *
     * @return {Boolean} True if it is a valid instance of target, false otherwise
     */
    function instanceOf(instance, target) {

        if (instance instanceof target) {
            return true;
        }

        if (instance && instance.$constructor && instance.$constructor[$class] && target && target[$interface]) {
            return instanceOfInterface(instance, target);
        }

        return false;
    }

    return instanceOf;
});
/*global global,module*/

define('dejavu',[
    'amd-utils/lang/isFunction',
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    'instanceOf'
], function (
    isFunction,
    Class,
    AbstractClass,
    Interface,
    FinalClass,
    instanceOf
) {

    'use strict';

    var dejavu = {},
        target;

    dejavu.Class = Class;
    dejavu.AbstractClass = AbstractClass;
    dejavu.Interface = Interface;
    dejavu.FinalClass = FinalClass;
    dejavu.instanceOf = instanceOf;

    if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports) {
        module.exports = dejavu;
    } else {
        target = (typeof window !== 'undefined' && window.navigator && window.document) ? window : global;
        if (!target) {
            throw new Error('Could not grab global object.');
        }
        target.dejavu = dejavu;
    }

    if (isFunction(Object.freeze)) {
        Object.freeze(dejavu);
    }

});

require('dejavu');}());