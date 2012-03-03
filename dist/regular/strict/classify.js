(function () {
/**
 * almond 0.0.3 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
/*jslint strict: false, plusplus: false */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {

    var defined = {},
        waiting = {},
        aps = [].slice,
        main, req;

    if (typeof define === "function") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
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
                baseName = baseName.split("/");
                baseName = baseName.slice(0, baseName.length - 1);

                name = baseName.concat(name.split("/"));

                //start trimDots
                var i, part;
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
            main.apply(undef, args);
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

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, i, ret, map;

        //Use name if no relName
        if (!relName) {
            relName = name;
        }

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Default to require, exports, module if no deps if
            //the factory arg has any arguments specified.
            if (!deps.length && callback.length) {
                deps = ['require', 'exports', 'module'];
            }

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
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
                        exports: defined[name]
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw name + ' missing ' + depName;
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef) {
                    defined[name] = cjsModule.exports;
                } else if (!usingExports) {
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

    requirejs = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {

            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            //Drop the config stuff on the ground.
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
            } else {
                deps = [];
            }
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
    req.config = function () {
        return req;
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (define.unordered) {
            waiting[name] = [name, deps, callback];
        } else {
            main(name, deps, callback);
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../vendor/almond/almond.js", function(){});

define('Utils/lang/kindOf',[],function () {

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

define('Utils/lang/isKind',['./kindOf'], function (kindOf) {
    /**
     * Check if value is from a specific "kind".
     * @version 0.1.0 (2011/10/31)
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    return isKind;
});

define('Utils/lang/isString',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isString(val) {
        return isKind(val, 'String');
    }
    return isString;
});

define('Utils/array/forEach',[],function () {

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

define('Utils/array/filter',['./forEach'], function (forEach) {

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

define('Utils/array/every',[],function () {

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

define('Utils/array/indexOf',[],function () {

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

define('Utils/array/contains',['./indexOf'], function (indexOf) {

    /**
     * If array contains values.
     * @version 0.1.0 (2011/10/31)
     */
    function contains(arr, val) {
        return indexOf(arr, val) !== -1;
    }
    return contains;
});

define('Utils/array/unique',['./indexOf', './filter'], function(indexOf, filter){

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


define('Utils/array/intersection',['./unique', './filter', './every', './contains'], function (unique, filter, every, contains) {


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

define('Utils/array/compact',['./filter'], function (filter) {

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

/*jslint sloppy:true, regexp:true*/
/*global define*/

define('common/functionMeta',[],function () {

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

        var matches = /^function\s+[a-zA-Z0-9_$]*\s*\(([^\(]*)\)/m.exec(func.toString()),
            ret,
            split,
            optionalReached = false,
            length,
            x;

        if (!matches) {
            return null;
        }

        split = (matches[1] || '').split(/\s*,\s*/gm);
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

/*jslint sloppy:true, regexp:true*/
/*global define*/

define('common/propertyMeta',[],function () {

    /**
     * Extract meta data from a property.
     * It returns an object containing the value and visibility.
     *
     * @param {Mixed}  prop The property
     * @param {String} name The name of the property
     *
     * @return {Object} An object containg the metadata
     */
    function propertyMeta(prop, name) {

        var ret = { value: prop };

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

/*jslint sloppy:true*/
/*global define*/

define('common/isFunctionCompatible',[],function () {

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

/*jslint sloppy:true, forin:true*/
/*global define*/

define('common/checkKeywords',[
    'Utils/array/contains'
], function (
    contains
) {
    var reservedNormal = ['$constructor', '$initializing', '$static', '$self', '$super'],
        reservedStatics = ['$parent', '$super'];

    /**
     * Verify reserved words found in classes/interfaces.
     * The second parameter can be normal or statics.
     * Normal will test for reserved words of the instance.
     * $statics will test for reserved words in the ckass statics.
     *
     * Will throw an error if any reserved key is found.
     *
     * @param {Object} object            The object to verify
     * @param {String} [type="normal"]   The list of reserved word to test
     */
    function checkKeywords(object, type) {

        var reserved = type === 'normal' || !type ? reservedNormal : reservedStatics,
            key;

        for (key in object) {

            if (contains(reserved, key) || Object.prototype[key]) {
                throw new TypeError('"' + object.$name + '" is using a reserved keyword: ' + key);
            }
        }
    }

    return checkKeywords;
});

/*jslint sloppy:true, forin:true*/
/*global define,console*/

define('common/isObjectPrototypeSpoiled',[],function () {

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

/*jslint sloppy:true*/
/*global define,console*/

define('common/randomAccessor',['Utils/array/contains'], function (contains) {

    var random = new Date().getTime() + '_' + Math.floor((Math.random() * 100000000 + 1)),
        nrAccesses = 0;

    function randomAccessor() {

        var caller = randomAccessor.caller || arguments.callee.caller || arguments.caller,
            allowed = ['ClassWrapper', 'InterfaceWrapper', 'AbstractClassWrapper', 'isntanceOfWrapper'];

        if ((caller.name && !contains(allowed, caller.name)) || nrAccesses > 4) {
            throw new Error('Can\'t access random identifier.');
        } {
            nrAccesses++;
            return random;
        }
    }
    return randomAccessor;
});

define('Utils/lang/isFunction',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    return isFunction;
});

/*jslint sloppy:true*/
/*global define*/

define('common/hasDefineProperty',['Utils/lang/isFunction'], function (isFunction) {

    var hasDefineProperty = (function () {

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
    }());

    return hasDefineProperty;
});

/*jslint sloppy:true*/
/*global define*/

define('common/obfuscateProperty',['./hasDefineProperty'], function (hasDefineProperty) {

    /**
     * Sets the key of object with the specified value.
     * The property is obfuscated, by not being enumerable, configurable and writable.
     *
     * @param {Object}  obj                  The object
     * @param {String}  key                  The key
     * @param {Mixin}   value                The value
     * @param {Boolean} [isWritable="false"] True to be writable, false otherwise
     */
    function obfuscateProperty(obj, key, value, isWritable) {

        if (hasDefineProperty) {
            if (obj.hasOwnProperty(key)) {
                console.log(obj);
                console.trace();
            }
            Object.defineProperty(obj, key, {
                value: value,
                configurable: false,
                writable: isWritable || false,
                enumerable: false
            });
        } else {
            obj[key] = value;
        }
    }

    return obfuscateProperty;
});

/*jslint sloppy:true, forin:true*/
/*global define,console*/

define('common/checkObjectPrototype',[
    './isObjectPrototypeSpoiled',
    'Utils/lang/isFunction'
], function (
    isObjectPrototypeSpoiled,
    isFunction
) {

    /**
     * Checks object prototype, throwing an error if it has enumerable properties.
     * Also seals it, to prevent any further modifications
     */
    function checkObjectPrototype() {

        if (isObjectPrototypeSpoiled()) {
            throw new Error('Classify will not work properly if Object.prototype has enumerable properties!');
        }

        if (isFunction(Object.seal)) {
            Object.seal(Object.prototype);
        }
    }

    return isObjectPrototypeSpoiled;
});


define('Utils/lang/isObject',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    return isObject;
});

define('Utils/lang/isArray',['./isKind'], function (isKind) {
    /**
     * @version 0.2.0 (2011/12/06)
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    return isArray;
});

define('Utils/lang/isUndefined',[],function () {
    var UNDEF;

    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isUndef(val){
        return val === UNDEF;
    }
    return isUndef;
});

define('Utils/object/hasOwn',[],function () {

    /**
     * Safer Object.hasOwnProperty
     * @version 0.1.0 (2012/01/19)
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     return hasOwn;

});

define('Utils/object/mixIn',['./hasOwn'], function(hasOwn){

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    * @version 0.1.1 (2012/01/19)
    */
    function mixIn(target, objects){
        var i = 1,
            n = arguments.length,
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

define('Utils/lang/createObject',['../object/mixIn'], function(mixIn){

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


define('Utils/array/combine',['./indexOf'], function (indexOf) {

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

define('Utils/lang/bind',[],function(){

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


define('Utils/lang/isArguments',['./isKind'], function (isKind) {

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

define('Utils/lang/toArray',['./isArray', './isObject', './isArguments'], function (isArray, isObject, isArguments) {

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

/*jslint browser:true, sloppy:true, forin:true, newcap:true, callee:true*/
/*global define,console*/

define('Class',[
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
    'Utils/lang/isFunction',
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/hasOwn',
    'Utils/array/combine',
    'Utils/lang/bind',
    'Utils/lang/toArray'
], function ClassWrapper(
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
    isFunction,
    isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    hasOwn,
    combine,
    bind,
    toArray
) {

    checkObjectPrototype();

    var Class,
        random = randomAccessor(),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        $abstract = '$abstract_' + random,
        cacheKeyword = '$cache_' + random,
        inheriting,
        nextId = 0;

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
            isStatic = opts && opts.isStatic,
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
                throw new Error('Cannot override private ' + (isStatic ? 'static ' : '') + ' method "' + name + ' in class "' + constructor.prototype.$name + '".');
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
     *
     * @param {String}   name        The property name
     * @param {Function} value       The property itself
     * @param {Function} constructor The class constructor in which the method metadata will be saved
     * @param {Object}   [opts="{}"] The options
     */
    function addProperty(name, value, constructor, opts) {

        var metadata = propertyMeta(value, name),
            isStatic = opts && opts.isStatic,
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


        target = isStatic ? constructor[$class].staticMethods : constructor[$class].methods;

        // Check if a property with the same name exists
        if (isObject(target[name])) {
            throw new Error((isStatic ? 'Static property' : 'Property') + ' "' + name + '" is overwriting a ' + (isStatic ? 'static ' : '') + 'method with the same name in class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor[$class].staticProperties : constructor[$class].properties;

        if (isObject(target[name])) {
            // Are we overriding a private property?
            if (target[name].isPrivate) {
                throw new Error('Cannot override private ' + (isStatic ? 'static ' : '') + ' property "' + name + ' in class "' + constructor.prototype.$name + '".');
            }
        }

        target[name] = metadata;

        // Store a reference to the prototype/constructor
        if (!isStatic) {
            metadata['$prototype_' + constructor[$class].id] = constructor.prototype;
        } else {
            metadata['$constructor_' + constructor[$class].id] = constructor;
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
                value,
                optsStatic = { isStatic: true };

            // Verify argument type
            if (!i && !isArray(constructor.prototype.$borrows)) {
                throw new TypeError('$borrows of "' + constructor.prototype.$name + '" must be a class/object or an array of classes/objects.');
            }
            // Verify duplicate entries
            if (i !== unique(mixins).length && compact(mixins).length === i) {
                throw new Error('There are duplicate entries defined in $borrows of "' + constructor.prototype.$name + '".');
            }

            for (i -= 1; i >= 0; i -= 1) {

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
    }

    /**
     * Parse binds.
     *
     * @param {Function} constructor The constructor
     */
    function parseBinds(constructor) {

        if (hasOwn(constructor.prototype, '$binds')) {
            var binds = toArray(constructor.prototype.$binds),
                x = binds.length,
                common;

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

            combine(constructor[$class].binds, binds);
            delete constructor.prototype.$binds;
        }
    }

    /**
     * Parse all the members, including static ones.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function parseMembers(params, constructor) {

        var optsStatic = { isStatic: true },
            key,
            value;
        // Add each method metadata, verifying its signature

        for (key in params) {

            if (key === '$statics') {

                if (!isObject(params.$statics)) {
                    throw new TypeError('$statics definition of class "' + params.$name + '" must be an object.');
                }

                checkKeywords(params.$statics, 'statics');

                for (key in params.$statics) {

                    value = params.$statics[key];

                    if (isFunction(value) && !value[$class] && !value[$interface]) {
                        addMethod(key, value, constructor, optsStatic);
                    } else {
                        addProperty(key, value, constructor, optsStatic);
                    }
                }

                delete constructor.prototype.$statics;

            } else {

                value = params[key];

                if (key.charAt(0) !== '$' || (key !== '$name' && key !== '$binds' && key !== '$borrows' && key !== '$implements' && key !== '$abstracts')) {

                    if (isFunction(value) && !value[$class] && !value[$interface]) {
                        addMethod(key, value, constructor);
                    } else {
                        addProperty(key, value, constructor);
                    }
                }
            }
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

        var Instance = function () {

            var key;

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

            // Apply binds
            applyBinds(this.$constructor[$class].binds, this, this);

            delete this.$initializing;

            // Prevent any properties/methods to be added and deleted
            if (isFunction(Object.seal)) {
                Object.seal(this);
            }

            // Call initialize
            initialize.apply(this, arguments);
        };

        obfuscateProperty(Instance, $class, { methods: {}, properties: {}, staticMethods: {}, staticProperties: {}, interfaces: [], binds: [] });

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

            if (!caller['$prototype_' + classId]) {
                throw new Error('Cannot retrieve self alias within an unknown function.');
            }

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
        };
    }

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

        var classify,
            parent;

        if (hasOwn(params, '$extends')) {
            // Verify if parent is a valid class
            if (!isFunction(params.$extends) || !params.$extends[$class]) {
                throw new TypeError('Specified parent class in $extends of "' + params.$name + '" is not a valid class.');
            }

            parent = params.$extends;
            delete params.$extends;

            if (!hasOwn(params, 'initialize')) {
                params.initialize = function () { parent.prototype.initialize.apply(this, arguments); };
                obfuscateProperty(params.initialize, '$inherited', true);
            }

            classify = createConstructor(params.initialize, isAbstract);
            classify[$class].id = parent[$class].id;
            classify.$parent = parent;
            classify.prototype = createObject(parent.prototype, params);

            inheritParent(classify, parent);
        } else {
            params.initialize = params.initialize || function () {};
            classify = createConstructor(params.initialize, isAbstract);
            classify[$class].id = nextId += 1;
            classify.prototype = params;

            // Assign aliases
            obfuscateProperty(classify.prototype, '$super', superAlias(classify[$class].id));
            obfuscateProperty(classify.prototype, '$self', selfAlias(classify[$class].id));
            obfuscateProperty(classify.prototype, '$static', staticAlias);
        }

        if (isAbstract) {
            obfuscateProperty(classify, '$abstract_' + random, true, true); // Signal it has abstract
        }

        // Parse members
        parseMembers(params, classify);

        // Assign constructor & static parent alias
        obfuscateProperty(classify.prototype, '$constructor', classify);
        obfuscateProperty(classify, '$super', superStaticAlias(classify[$class].id));

        // Parse mixins
        parseBorrows(classify);

        // Parse binds
        parseBinds(classify);

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

        // Handle interfaces
        if (hasOwn(params, '$implements')) {
            handleInterfaces(params.$implements, classify);
            delete classify.prototype.$implements;
        }

        // Remove abstracts reference
        if (hasOwn(params, '$abstracts')) {
            delete params.$abstracts;
        }

        // Prevent any properties/methods to be added and deleted
        if (hasDefineProperty) {
            protectConstructor(classify);
        }


        return classify;
    };

    return Class;
});

/*jslint sloppy:true, regexp:true*/
/*global define*/

define('common/isFunctionEmpty',[],function () {

    /**
     * Check if a function has no body.
     *
     * @param {Function} func The function
     *
     * @return {Boolean} True if it's empty, false otherwise
     */
    function isFunctionEmpty(func) {
        return (/^function\s+\([^\(]*\)\s*\{\s*\}$/m).test(func.toString());
    }

    return isFunctionEmpty;
});

/*jslint sloppy:true, nomen:true, newcap:true, forin:true*/
/*global define*/

define('AbstractClass',[
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/lang/isArray',
    'Utils/lang/isString',
    'Utils/lang/toArray',
    'Utils/lang/bind',
    'Utils/object/mixIn',
    'Utils/array/combine',
    './common/functionMeta',
    './common/isFunctionEmpty',
    './common/isFunctionCompatible',
    './common/checkKeywords',
    './common/checkObjectPrototype',
    './common/hasDefineProperty',
    './common/randomAccessor',
    'Utils/object/hasOwn',
    './Class',
    'require'
], function AbstractClassWrapper(
    isObject,
    isFunction,
    isArray,
    isString,
    toArray,
    bind,
    mixIn,
    combine,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible,
    checkKeywords,
    checkObjectPrototype,
    hasDefineProperty,
    randomAccessor,
    hasOwn,
    Class,
    require
) {

    var random = randomAccessor(),
        $class = '$class_' + random,
        $interface = '$interface_' + random,
        $abstract = '$abstract_' + random;

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
     * @param {Object}   [opts="{}"] The options
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
            throw new TypeError((isStatic ? 'Static method' : 'Method') + ' "' + name + '" must be anonymous and contain no implementation in abstract class "' + constructor.prototype.$name + '".');
        }

        target = isStatic ? constructor : constructor.prototype;

        // Check if function is ok
        metadata = functionMeta(method, name);
        if (metadata === null) {
            throw new Error((isStatic ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in abstract class "' + constructor.prototype.$name + '".');
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

        target[name] = metadata;
    }

    /**
     * Checks if an abstract class is well implemented in a class.
     * In order to this function to work, it must be bound to an abstract class definition.
     *
     * @param {Function} target The class to be checked
     */
    function checkClass(target) {

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
    }

    /**
     * Parse abstract methods.
     *
     * @param {Object}   abstracts   The object that contains the abstract methods
     * @param {Function} constructor The constructor
     */
    function parseAbstracts(abstracts, constructor) {

        if (!isObject(abstracts)) {
            throw new TypeError('$abstracts defined in abstract class "' + constructor.prototype.$name + "' must be an object.");
        }

        checkKeywords(abstracts);

        var optsStatic = { isStatic: true },
            key,
            value;

        for (key in abstracts) {

            if (key === '$statics') {

                if (!isObject(abstracts.$statics)) {
                    throw new TypeError('$statics definition in $abstracts of abstract class "' + constructor.prototype.$name + '" must be an object.');
                }

                checkKeywords(abstracts.$statics, 'statics');

                for (key in abstracts.$statics) {

                    value = abstracts.$statics[key];

                    // Check if it is not a function
                    if (!isFunction(value) || value[$interface] || value[$class]) {
                        throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.$name + '" is not a function.');
                    }

                    addMethod(key, value, constructor, optsStatic);
                }

            } else {

                value = abstracts[key];

                // Check if it is not a function
                if (!isFunction(value) || value[$interface] || value[$class]) {
                    throw new Error('Abstract member "' + key + '" found in abstract class "' + constructor.prototype.$name + '" is not a function.');
                }

                addMethod(key, value, constructor);
            }
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

        // Verify argument type
        if (!x && !isArray(interfs)) {
            throw new TypeError('$implements of abstract class "' + constructor.prototype.$name + '" must be an interface or an array of interfaces.');
        }

        for (x -= 1; x >= 0; x -= 1) {

            interf = interfs[x];

            // Validate interfaces
            if (!isFunction(interf) || !interf[$interface]) {
                throw new TypeError('Entry at index ' + x + ' in $implements of class "' + constructor.prototype.$name + '" is not a valid interface.');
            }

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

            // Add it to the interfaces array
            constructor[$class].interfaces.push(interf);
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

        Class = require('./Class');

        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }
        // Validate class name
        if (hasOwn(params, '$name')) {
            if (!isString(params.$name)) {
                throw new TypeError('Abstract class name must be a string.');
            } else if (/\s+/.test(params.$name)) {
                throw new TypeError('Abstract class name cannot have spaces.');
            }
        } else {
            params.$name = 'Unnamed';
        }

        var def,
            abstractObj = { methods: {}, staticMethods: {}, interfaces: [] },
            saved = {};

        // If we are extending an abstract class also, inherit the abstract methods
        if (isFunction(params.$extends)) {

            if (params.$extends[$abstract]) {
                mixIn(abstractObj.methods, params.$extends[$abstract].methods);
                mixIn(abstractObj.staticMethods, params.$extends[$abstract].staticMethods);
                combine(abstractObj.interfaces, params.$extends[$abstract].interfaces);
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
        def = Class(params, true);

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

define('Utils/object/forOwn',['../lang/isObject', './hasOwn'], function (isObject, hasOwn) {

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

define('Utils/object/keys',['./forOwn'], function (forOwn) {

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

/*jslint sloppy:true, forin:true*/
/*global define*/

define('Interface',[
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
    './common/checkKeywords',
    './common/functionMeta',
    './common/isFunctionEmpty',
    './common/isFunctionCompatible',
    './common/checkObjectPrototype',
    './common/obfuscateProperty',
    './common/randomAccessor',
    'Utils/object/hasOwn',
    'Utils/lang/toArray'
], function InterfaceWrapper(
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
    checkKeywords,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible,
    checkObjectPrototype,
    obfuscateProperty,
    randomAccessor,
    hasOwn,
    toArray
) {

    var random = randomAccessor(),
        $class = '$class_' + random,
        $interface = '$interface_' + random;

    checkObjectPrototype();

    /**
     * Checks if an interface is well implemented in a class.
     * In order to this function to work, it must be bound to an interface definition.
     *
     * @param {Function} target The class to be checked
     */
    function checkClass(target) {

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
    }

    /**
     * Add a method to an interface.
     * This method will throw an error if something is not right.
     * Valid options:
     *   - isStatic: true|false Defaults to false
     *
     * @param {String}   name        The method name
     * @param {Function} method      The method itself
     * @param {Function} interf      The interface in which the method metadata will be saved
     * @param {Object}   [opts="{}"] The options
     */
    function addMethod(name, method, interf, opts) {

        var metadata,
            isStatic = opts && opts.isStatic,
            target;

        // Check if it is public
        if (name.charAt(0) === '_') {
            throw new Error('Interface "' + interf.prototype.$name + '" contains an unallowed non public method: "' + name + '".');
        }
        // Check if it contains no implementation
        if (!isFunctionEmpty(method)) {
            throw new TypeError((isStatic ? 'Static method' : 'Method') + ' "' + name + '" must be anonymous and contain no implementation in interface "' + interf.prototype.$name + '".');
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
        if (hasOwn(params, '$name')) {
            if (!isString(params.$name)) {
                throw new TypeError('Interface name must be a string.');
            } else if (/\s+/.test(params.$name)) {
                throw new TypeError('Interface name cannot have spaces.');
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
            optsStatic,
            interf = function () {
                throw new Error('Interfaces cannot be instantiated.');
            };

        obfuscateProperty(interf, $interface, { parents: [], methods: {}, staticMethods: {}, check: bind(checkClass, interf) });
        interf.prototype.$name = params.$name;

        if (hasOwn(params, '$extends')) {

            parents = toArray(params.$extends);
            k = parents.length;

            // Verify argument type
            if (!k && !isArray(params.$extends)) {
                throw new TypeError('$extends of "' + params.$name + '" seems to point to an nonexistent interface.');
            }
            // Verify duplicate entries
            if (k !== unique(parents).length && compact(parents).length === k) {
                throw new Error('There are duplicate entries defined in $extends of "' + params.$name + '".');
            }

            for (k -= 1; k >= 0; k -= 1) {

                current = parents[k];

                // Check if it is a valid interface
                if (!isFunction(current) || !current[$interface]) {
                    throw new TypeError('Specified interface in $extends at index ' +  k + ' of "' + params.$name + '" is not a valid interface.');
                }

                // Merge methods
                duplicate = intersection(keys(interf[$interface].methods), keys(current[$interface].methods));
                i = duplicate.length;
                if (i > 0) {
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
                if (i > 0) {
                    for (i -= 1; i >= 0; i -= 1) {
                        if (!isFunctionCompatible(interf[$interface].staticMethods[duplicate[i]], current[$interface].staticMethods[duplicate[i]]) &&
                                !isFunctionCompatible(current[$interface].staticMethods[duplicate[i]], interf[$interface].staticMethods[duplicate[i]])) {
                            throw new Error('Interface "' + params.$name + '" is inheriting static method "' + duplicate[i] + '" from different parents with incompatible signatures.');
                        }
                    }
                }

                mixIn(interf[$interface].staticMethods, current[$interface].staticMethods);

                // Add interface to the parents
                interf[$interface].parents.push(current);
            }

            delete params.$extends;
        }

        optsStatic = { isStatic: true };

        // Check if the interface defines the initialize function
        if (hasOwn(params, 'initialize')) {
            throw new Error('Interface "' + params.$name + '" can\'t define the initialize method.');
        }

        for (k in params) {

            if (k === '$statics') {

                if (!isObject(params.$statics)) {
                    throw new TypeError('$statics definition of interface "' + params.$name + '" must be an object.');
                }

                checkKeywords(params.$statics, 'statics');

                for (k in params.$statics) {

                    value = params.$statics[k];

                    // Check if it is not a function
                    if (!isFunction(value) || value[$interface] || value[$class]) {
                        throw new Error('Static member "' + k + '" found in interface "' + params.$name + '" is not a function.');
                    }

                    addMethod(k, value, interf, optsStatic);
                }

            } else if (k !== '$name') {

                value = params[k];

                // Check if it is not a function
                if (!isFunction(value) || value[$interface] || value[$class]) {
                    throw new Error('Member "' + k + '" found in interface "' + params.$name + '" is not a function.');
                }

                addMethod(k, value, interf);
            }
        }


        return interf;
    }

    return Interface;
});

/*jslint sloppy:true*/
/*global define*/

define('instanceOf',[
    './common/randomAccessor'
], function (
    randomAccessor
) {

    var random = randomAccessor(),
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
     * Check if a class is an instance of an interface.
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

        return instance.$constructor.$parent ? instanceOfInterface(instance.$constructor.$parent.prototype, target) : false;
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

        if (instance.$constructor[$class] && target[$interface]) {
            return instanceOfInterface(instance, target);
        }

        return instance instanceof target;
    }

    return instanceOf;
});
define('classify',[
    './Class',
    './AbstractClass',
    './Interface',
    'instanceOf'
], function (
    Class,
    AbstractClass,
    Interface,
    instanceOf
) {
    var Classify = {},
        target = (typeof window !== 'undefined' && window.navigator && window.document) ? window : global;

    Classify.Class = Class;
    Classify.AbstractClass = AbstractClass;
    Classify.Interface = Interface;
    Classify.instanceOf = instanceOf;

    target.Classify = Classify;
});}());