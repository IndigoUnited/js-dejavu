(function() {
/**
 * almond 0.2.1 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

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
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
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
                            break;
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
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
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
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
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

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
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

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

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

        if (!hasProp(defined, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond",[], function(){});



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

define('common/printWarning',['amd-utils/lang/isFunction'], function (isFunction) {

    

    /**
     * Simple function to print warning in the console only if the console is available.
     *
     * @param {String} message The message to print
     */
    function printWarning(message) {
        if (typeof console !== 'undefined' && isFunction(console.warn)) {
            console.warn(message);
        }

    }

    return printWarning;
});

define('common/hasDefineProperty',['amd-utils/lang/isFunction'], function (isFunction) {

    

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



define('amd-utils/lang/isNumber',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isNumber(val) {
        return isKind(val, 'Number');
    }
    return isNumber;
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

define('common/isPlainObject',[
    'amd-utils/lang/isFunction',
    'amd-utils/object/hasOwn'
], function (
    isFunction,
    hasOwn
) {

    

    var hasObjectPrototypeOf = isFunction(Object.getPrototypeOf);

    /**
     * Checks if a given object is a plain object.
     *
     * @param {Object} obj The object
     */
    function isPlainObject(obj) {
        var proto = '__proto__',
            key;

        // This function is based on the jquery one
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

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own
        for (key in obj) {}

        return key === undefined || hasOwn(obj, key);
    }

    return isPlainObject;
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



define('amd-utils/object/forOwn',['./hasOwn'], function (hasOwn) {

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
     * @version 0.2.0 (2012/08/30)
     */
    function forOwn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

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



define('amd-utils/object/mixIn',['./forOwn'], function(forOwn){

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    * @version 0.1.3 (2012/08/11)
    */
    function mixIn(target, objects){
        var i = 1,
            obj;
        while(obj = arguments[i++]){
            forOwn(obj, copyProp, target);
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
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




define('amd-utils/lang/inheritPrototype',['./createObject'], function(createObject){

    /**
    * Inherit prototype from another Object.
    * - inspired by Nicholas Zackas <http://nczonline.net> Solution
    * @param {object} child Child object
    * @param {object} parent    Parent Object
    * @version 0.1.0 (2011/02/18)
    */
    function inheritPrototype(child, parent){
        var p = createObject(parent.prototype);
        p.constructor = child;
        child.prototype = p;
    }

    return inheritPrototype;
});



define('amd-utils/array/indexOf',[],function () {

    /**
     * Array.indexOf
     * @version 0.3.0 (2012/07/26)
     */
    function indexOf(arr, item, fromIndex) {
        fromIndex = fromIndex || 0;
        var n = arr.length >>> 0,
            i = fromIndex < 0? n + fromIndex : fromIndex;
        while (i < n) {
            //it should skip sparse items
            if (i in arr && arr[i] === item) {
                return i;
            }
            i += 1;
        }
        return -1;
    }

    return indexOf;
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

define('common/mixIn',[], function () {

    

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



define('amd-utils/function/bind',[],function(){

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




define('amd-utils/lang/toArray',['./kindOf'], function (kindOf) {

    var _win = this;

    /**
     * Convert array-like object into array
     * @version 0.3.1 (2012/08/30)
     */
    function toArray(val){
        var ret = [],
            kind = kindOf(val),
            n;

        if (val != null) {
            if ( val.length == null || kind === 'String' || kind === 'Function' || kind === 'RegExp' || val === _win ) {
                //string, regexp, function have .length but user probably just want
                //to wrap value into an array..
                ret[ret.length] = val;
            } else {
                //window returns true on isObject in IE7 and may have length
                //property. `typeof NodeList` returns `function` on Safari so
                //we can't use it (#58)
                n = val.length;
                while (n--) {
                    ret[n] = val[n];
                }
            }
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




define('amd-utils/array/forEach',[],function () {

    /**
     * Array forEach
     * @version 0.4.0 (2012/07/26)
     */
    function forEach(arr, callback, thisObj) {
        var i = -1,
            n = arr.length >>> 0;
        while (++i < n) {
            //according to spec callback should only be called for
            //existing items
            if (i in arr) {
                callback.call(thisObj, arr[i], i, arr);
            }
        }
    }

    return forEach;

});



define('amd-utils/array/filter',['./forEach'], function (forEach) {

    /**
     * Array filter
     * @version 0.4.0 (2012/07/26)
     */
    function filter(arr, callback, thisObj) {
        var results = [];
        forEach(arr, function (val, i, arr) {
            if ( callback.call(thisObj, val, i, arr) ) {
                results.push(val);
            }
        });
        return results;
    }

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




define('amd-utils/array/some',['require'],function (forEach) {

    /**
     * Array some
     * @version 0.3.0 (2012/07/26)
     */
    function some(arr, callback, thisObj) {
        var result = false,
            i = -1,
            n = arr.length >>> 0;
        while (++i < n) {
            //according to spec callback should only be called for
            //existing items
            if ( i in arr && callback.call(thisObj, arr[i], i, arr) ) {
                result = true;
                break;
            }
        }
        return result;
    }

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

/*jshint noarg:false*/

define('Class',[
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
    'amd-utils/lang/inheritPrototype',
    'amd-utils/object/hasOwn',
    'amd-utils/array/combine',
    'amd-utils/array/contains',
    './common/mixIn',
    'amd-utils/array/append',
    'amd-utils/function/bind',
    'amd-utils/lang/toArray',
    'amd-utils/lang/clone',
    'amd-utils/array/insert'
], function ClassWrapper(
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
    inheritPrototype,
    hasOwn,
    combine,
    contains,
    mixIn,
    append,
    bind,
    toArray,
    clone,
    insert
) {

    

    var createClass,
        Class = {},
        $class = '$class',
        $interface = '$interface',
        $bound = '$bound_dejavu',
        $wrapped = '$wrapped_dejavu',
        tmp,
        descriptor;

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
     * @param {Function} parent      The parent method
     *
     * @return {Function} The wrapper
     */
    function wrapMethod(method, constructor, parent) {
        // Return the method if the class was created efficiently
        if (constructor[$class].efficient) {
            return method;
        }

        var wrapper,
            isWrapped = !!method[$wrapped];

        if (isWrapped) {
            method = method[$wrapped];
        }

        if (!parent) {
            if (isWrapped || method.toString().indexOf('$self') !== -1) {
                wrapper = function () {
                    var _self = this.$self,
                        ret;

                    // TODO: We should be using a try finally here to ensure that $super is restored correctly but it slows down by a lot!
                    //       Find a better solution?
                    this.$self = constructor;
                    ret = method.apply(this, arguments);
                    this.$self = _self;

                    return ret;
                };
            } else {
                return method;
            }
        } else {
            wrapper = function () {
                var _super = this.$super,
                    _self = this.$self,
                    ret;

                // TODO: We should be using a try finally here to ensure that $super is restored correctly but it slows down by a lot!
                //       Find a better solution?
                this.$super = parent;
                this.$self = constructor;
                ret = method.apply(this, arguments);
                this.$super = _super;
                this.$self = _self;

                return ret;
            };
        }

        wrapper[$wrapped] = method;

        return wrapper;
    }

    /**
     * Borrows members from a vanilla object definition.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function borrowFromVanilla(params, constructor) {
        var key,
            value;

        // Grab mixin members
        for (key in params) {
            value = params[key];

            if (constructor.prototype[key] === undefined) {    // Already defined members are not overwritten
                if (isFunction(value) && !value[$class] && !value[$interface]) {
                    constructor.prototype[key] = wrapMethod(value, constructor, constructor.$parent ? constructor.$parent.prototype[key] : null);

                    // If the function is specified to be bound, add it to the binds
                    if (value[$bound]) {
                        insert(constructor[$class].binds, key);
                    }
                } else {
                    constructor.prototype[key] = value;
                    if (!isImmutable(value)) {
                        insert(constructor[$class].properties, key);
                    }
                }
            }
        }

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
                k,
                key,
                value,
                mixins = toArray(params.$borrows),
                i = mixins.length;

            for (i -= 1; i >= 0; i -= 1) {
                current = mixins[i];
                // If it's a vanilla object
                if (isObject(current)) {
                    borrowFromVanilla(current, constructor);
                    continue;
                }
                // If it's a vanilla class
                if (isFunction(current) && !current[$class]) {
                    borrowFromVanilla(current.prototype, constructor);
                    continue;
                }

                current = current.prototype;

                // Grab mixin members
                borrowFromVanilla(current, constructor);

                // Grab mixin static methods
                for (k = current.$static[$class].staticMethods.length - 1; k >= 0; k -= 1) {
                    key = current.$static[$class].staticMethods[k];

                    if (constructor[key] === undefined) {    // Already defined members are not overwritten
                        insert(constructor[$class].staticMethods, key);
                        constructor[key] = current.$static[key];
                    }
                }

                // Grab mixin static properties
                for (key in current.$static[$class].staticProperties) {
                    value = current.$static[$class].staticProperties[key];

                    if (constructor[key] === undefined) {              // Already defined members are not overwritten
                        constructor[$class].staticProperties[key] = value;
                        constructor[key] = cloneProperty(value);
                    }
                }

                // Merge the binds
                combine(constructor[$class].binds, current.$static[$class].binds);
            }
        }
    }

    /**
     * Handle class interfaces.
     *
     * @param {Array}  interfs The array of interfaces
     * @param {Object} target  The target that has the interfaces
     */
    function handleInterfaces(interfs, target) {
        interfs = toArray(interfs);

        var interf,
            x = interfs.length,
            k;

        for (x -= 1; x >= 0; x -= 1) {
            interf = interfs[x];

            // Inherit constants and add interface to the interfaces array
            if (!contains(target[$class].interfaces, interf)) {

                for (k = interf[$interface].constants.length - 1; k >= 0; k -= 1) {
                    target[interf[$interface].constants[k]] = interf[interf[$interface].constants[k]];
                    target[$class].staticProperties[interf[$interface].constants[k]] = interf[interf[$interface].constants[k]];
                }

                target[$class].interfaces.push(interf);
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
        var key,
            value,
            cache = {};

        if (hasOwn(params, '$statics')) {
            for (key in params.$statics) {
                value = params.$statics[key];

                if (isFunction(value) && !value[$class] && !value[$interface]) {
                    insert(constructor[$class].staticMethods, key);
                    constructor[key] = wrapMethod(value, constructor, constructor.$parent ? constructor.$parent[key] : null);
                } else {
                    constructor[$class].staticProperties[key] = value;
                    constructor[key] = value;
                }
            }

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
                constructor.prototype[key] = wrapMethod(value, constructor, constructor.$parent ? constructor.$parent.prototype[key] : null);

                // If the function is specified to be bound, add it to the binds
                if (value[$bound]) {
                    insert(constructor[$class].binds, key);
                    delete value[$bound];
                }

                // We should remove the key here because a class may override from primitive to non primitive,
                // but we skip it because the cloneProperty already handles it
            } else {
                constructor.prototype[key] = value;

                if (!isImmutable(value)) {
                    insert(constructor[$class].properties, key);
                }
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
        var key,
            value,
            saved = {},
            has = {};

         // Save constants & finals to parse later
        if (hasOwn(params, '$constants')) {
            saved.$constants = params.$constants;
            has.$constants = true;
            delete params.$constants;
        }

        if (hasOwn(params, '$finals')) {
            saved.$finals = params.$finals;
            has.$finals = true;
            delete params.$finals;
        }

        // Parse members
        parseMembers(params, constructor);

        // Parse constants
        if (has.$constants) {
            for (key in saved.$constants) {

                value = saved.$constants[key];

                constructor[$class].staticProperties[key] = value;
                constructor[key] = value;
            }
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

            tmp = this.$static[$class];

            // Reset some types of the object in order for each instance to have their variables
            for (x = tmp.properties.length - 1; x >= 0; x -= 1) {
                this[tmp.properties[x]] = cloneProperty(this[tmp.properties[x]]);
            }

            if (!tmp.efficient) {
                this.$super = this.$self = null;  // Add the super & self to the instance object to speed lookup of the wrapper function
            }

            // Apply binds
            if (tmp.binds.length) {
                applyBinds(tmp.binds, this, this);
            }

            // Call initialize
            this.initialize.apply(this, arguments);
        };

        if (!Instance[$class]) {
            obfuscateProperty(Instance, $class, { staticMethods: [], staticProperties: {}, properties: [], interfaces: [], binds: [] });
        }

        return Instance;
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
            bound;

        if (!func[$wrapped] && this.$static && this.$static[$class]) {
            func = wrapMethod(func, this.$self || this.$static);
        }

        args.splice(1, 0, this);
        bound = bind.apply(func, args);

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

        // Grab properties
        append(constructor[$class].properties, parent[$class].properties);

        // Inherit static methods and properties
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

        // Inherit implemented interfaces
        constructor[$class].interfaces = [].concat(parent[$class].interfaces);
    }

    /**
     * Attempts to optimize the constructor function.
     *
     * @param {Function} constructor The constructor
     *
     * @param {Function} The old or the new constructor
     */
    function optimizeConstructor(constructor) {
        var tmp = constructor[$class],
            canOptimizeConst,
            newConstructor,
            parentInitialize;

        // Check if we can optimize the constructor
        if (tmp.efficient) {
            canOptimizeConst = constructor.$canOptimizeConst;
            delete constructor.$canOptimizeConst;

            if (canOptimizeConst && !tmp.properties.length && !tmp.binds.length) {
                if (hasOwn(constructor.prototype, 'initialize'))  {
                    newConstructor = constructor.prototype.initialize;
                } else {
                    parentInitialize = constructor.prototype.initialize;

                    // Optimize common use cases
                    // Default to the slower apply..
                    switch (parentInitialize.length) {
                    case 0:
                        newConstructor = function () { parentInitialize.call(this); };
                        break;
                    case 1:
                        newConstructor = function (a) { parentInitialize.call(this, a); };
                        break;
                    case 2:
                        newConstructor = function (a, b) { parentInitialize.call(this, a, b); };
                        break;
                    case 3:
                        newConstructor = function (a, b, c) { parentInitialize.call(this, a, b, c); };
                        break;
                    case 4:
                        newConstructor = function (a, b, c, d) { parentInitialize.call(this, a, b, c, d); };
                        break;
                    default:
                        newConstructor = function () { parentInitialize.apply(this, arguments); };
                    }
                }

                newConstructor.prototype = constructor.prototype;
                newConstructor.prototype.constructor = newConstructor;
                constructor.prototype = Function.prototype;

                newConstructor[$class] = constructor[$class];
                mixIn(newConstructor, constructor);
                if (constructor.$parent) {
                    newConstructor.$parent = constructor.$parent;
                }

                return newConstructor;
            }
        }

        return constructor;
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
            isEfficient = !!constructor;

        delete params.$name;

        if (hasOwn(params, '$extends')) {
            parent = params.$extends;
            delete params.$extends;

            // If its a vanilla class create a dejavu class based on it
            if (!parent[$class])  {
                parent = createClass(parent.prototype, parent, { isVanilla: true });
            }

            params.initialize = opts.isVanilla ? dejavu : params.initialize || params._initialize || params.__initialize;
            if (!params.initialize) {
                delete params.initialize;
            }

            dejavu = createConstructor(constructor);
            obfuscateProperty(dejavu, '$parent', parent);
            inheritPrototype(dejavu, parent);
            inheritParent(dejavu, parent);
        } else {
            dejavu = createConstructor(constructor);
            params.initialize = opts.isVanilla ? dejavu : params.initialize || params._initialize || params.__initialize || function () {};
        }

        dejavu[$class].efficient = isEfficient;
        if (!opts.isVanilla) {
            delete params._initialize;
            delete params.__initialize;
        }

        // Parse class members
        parseClass(params, dejavu);

        // Parse mixins
        parseBorrows(params, dejavu);

        // Optimize constructor if possible
        dejavu = optimizeConstructor(dejavu);

        // Assign aliases
        obfuscateProperty(dejavu.prototype, '$static', dejavu);
        obfuscateProperty(dejavu, '$static', dejavu);
        obfuscateProperty(dejavu, '$self', null, true);
        obfuscateProperty(dejavu, '$super', null, true);
        obfuscateProperty(dejavu, '$bind', doBind);
        if (!dejavu.$parent) {
            obfuscateProperty(dejavu.prototype, '$bind', doBind);
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
            // create(parentClass, func)
            if (isFunction(arg2)) {
                constructor = createConstructor();
                constructor.$canOptimizeConst = !!$arg3;
                params = arg2(arg1.prototype, arg1, constructor);
            // create(parentClass, props)
            } else {
                params = arg2;
            }

            params.$extends = arg1;
        // create(func)
        } else if (isFunction(arg1)) {
            constructor = createConstructor();
            constructor.$canOptimizeConst = !!arg2;
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

            return doBind.apply(context, args);
        });
        Function.prototype.$bind.dejavu = true;
    }

    return Class;
});

define('AbstractClass',[
    'amd-utils/object/hasOwn',
    'amd-utils/array/insert',
    './Class'
], function AbstractClassWrapper(
    hasOwn,
    insert,
    Class
) {

    

    var $abstract = '$abstract',
        $class = '$class',
        $bound = '$bound_dejavu',
        AbstractClass = {};

    /**
     * Create an abstract class definition.
     *
     * @param {Object}      params        An object containing methods and properties
     * @param {Constructor} [constructor] Assume the passed constructor
     *
     * @return {Function} The constructor
     */
    function createAbstractClass(params, constructor) {
        var def,
            savedMembers,
            key,
            value;

        // Handle abstract methods
        if (hasOwn(params, '$abstracts')) {
            savedMembers = params.$abstracts;
            delete params.$abstracts;
        }

        // Create the class definition
        def = Class.$create(params, constructor);
        def[$abstract] = true;

        // Grab binds
        if (savedMembers) {
            for (key in savedMembers) {
                value = savedMembers[key];

                if (value[$bound]) {
                    insert(def[$class].binds, key);
                }
            }
        }

        return def;
    }

    /**
     * Function to declare an abstract class.
     * This function can be called with various formats.
     * The first parameter can be a class to extend.
     * The second parameter must be an object containing the class members or a function to obtain it.
     *
     * @param {Function|Object} arg1 A class, an object or a function
     * @param {Function|Object} arg2 Object containing the class members or a function to obtain it.
     *
     * @return {Function} The constructor
     */
    AbstractClass.declare = function (arg1, arg2, $arg3) {
        return Class.declare.call(createAbstractClass, arg1, arg2, $arg3);
    };

    return AbstractClass;
});

define('Interface',[
    'amd-utils/lang/isFunction',
    'amd-utils/object/hasOwn',
    'amd-utils/lang/toArray'
], function InterfaceWrapper(
    isFunction,
    hasOwn,
    toArray
) {

    

    var $interface = '$interface',
        Interface = {};

    /**
     * Function to easily extend another interface.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The new interface
     */
    function extend(params) {
        /*jshint validthis:true*/
        params.$extends = this;

        return Interface.declare(params);
    }

    /**
     * Create an interface definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function createInterface(params) {
        delete params.$name;

        var parents,
            k,
            i,
            current,
            interf = function () {};

        interf[$interface] = { parents: [], constants: [] };

        if (hasOwn(params, '$extends')) {
            parents = toArray(params.$extends);
            k = parents.length;

            for (k -= 1; k >= 0; k -= 1) {
                current = parents[k];

                // Add interface constants
                for (i = current[$interface].constants.length - 1; i >= 0; i -= 1) {
                    interf[current[$interface].constants[i]] = current[current[$interface].constants[i]];
                }

                // Add interface to the parents
                interf[$interface].parents.push(current);
            }

            delete params.$extends;
        }

        // Parse constants
        if (hasOwn(params, '$constants')) {
            for (k in params.$constants) {
                interf[k] = params.$constants[k];
                interf[$interface].constants.push(k);
            }
        }

        // Supply .extend() to easily extend an interface
        interf.extend = extend;

        return interf;
    }

    /**
     * Function to declare an Interface.
     *
     * @param {Object} obj An object containing the interface members.
     *
     * @return {Function} The Interface
     */
    Interface.declare = createInterface;

    return Interface;
});

define('FinalClass',[
    './Class'
], function FinalClassWrapper(
    Class
) {

    

    var FinalClass = {};

    /**
     * Create a final class definition.
     *
     * @param {Object}      params        An object containing methods and properties
     * @param {Constructor} [constructor] Assume the passed constructor
     *
     * @return {Function} The constructor
     */
    function createFinalClass(params, constructor) {
        var def = Class.$create(params, constructor);

        return def;
    }

    /**
     * Function to declare a final class.
     * This function can be called with various formats.
     *
     * @param {Function|Object} arg1 A class to extend or an object/function to obtain the members
     * @param {Function|Object} arg2 Object/function to obtain the members
     *
     * @return {Function} The constructor
     */
    FinalClass.declare = function (arg1, arg2, $arg3) {
        return Class.declare.call(createFinalClass, arg1, arg2, $arg3);
    };

    return FinalClass;
});

define('instanceOf',[
], function instanceOfWrapper(
) {

    

    var $class = '$class',
        $interface = '$interface';

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
            interfaces = instance.$static[$class].interfaces;

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

        if (instance && instance.$static && instance.$static[$class] && target && target[$interface]) {
            return instanceOfInterface(instance, target);
        }

        return false;
    }

    return instanceOf;
});
define('options',[], function () {

    

    return {
        locked: true
    };
});

define('dejavu',[
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    './instanceOf',
    './options'
], function (
    Class,
    AbstractClass,
    Interface,
    FinalClass,
    instanceOf,
    options
) {

    

    var dejavu = {};

    dejavu.Class = Class;
    dejavu.AbstractClass = AbstractClass;
    dejavu.Interface = Interface;
    dejavu.FinalClass = FinalClass;
    dejavu.instanceOf = instanceOf;
    dejavu.options = options;

    dejavu.mode = 'loose';
    window.dejavu = dejavu;
});

require('dejavu', null, null, true);

}());