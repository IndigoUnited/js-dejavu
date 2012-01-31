
define('Utils/lang/kindOf',[],function () {

    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     * @author Miller Medeiros
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
     * @author Miller Medeiros
     * @version 0.1.0 (2011/10/31)
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    return isKind;
});

define('Utils/lang/isFunction',['./isKind'], function (isKind) {
    /**
     * @author Miller Medeiros
     * @version 0.1.0 (2011/10/31)
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    return isFunction;
});

define('Utils/lang/isString',['./isKind'], function (isKind) {
    /**
     * @author Miller Medeiros
     * @version 0.1.0 (2011/10/31)
     */
    function isString(val) {
        return isKind(val, 'String');
    }
    return isString;
});

define('Utils/array/every',[],function () {

    /**
     * ES5 Array.every
     * @author Miller Medeiros
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
     * @author Miller Medeiros
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
     * @author Miller Medeiros
     * @version 0.1.0 (2011/10/31)
     */
    function contains(arr, val) {
        return indexOf(arr, val) !== -1;
    }
    return contains;
});

define('Utils/lang/isObject',['./isKind'], function (isKind) {
    /**
     * @author Miller Medeiros
     * @version 0.1.0 (2011/10/31)
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    return isObject;
});

define('Utils/lang/isArray',['./isKind'], function (isKind) {
    /**
     * @author Miller Medeiros
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
     * @author Miller Medeiros
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
     * @author Miller Medeiros
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
    * @author Miller Medeiros
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
     * @author Miller Medeiros
     */
    function createObject(parent, props){
        function F(){}
        F.prototype = parent;
        return mixIn(new F(), props);

    }
    return createObject;
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
     * @author Miller Medeiros
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
     * @author Miller Medeiros
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

define('Utils/array/forEach',[],function () {

    /**
     * ES5 Array.forEach
     * @author Miller Medeiros
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
     * @author Miller Medeiros
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

define('Utils/array/unique',['./indexOf', './filter'], function(indexOf, filter){

    /**
     * @return {array} Array of unique items
     * @author Miller Medeiros
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
     * @author Miller Medeiros
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

define('Utils/array/combine',['./indexOf'], function (indexOf) {

    /**
     * Combines an array with all the items of another.
     * Does not allow duplicates and is case and type sensitive.
     * @author André Cruz
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

define('Utils/array/append',[],function () {

    /**
     * Appends an array to the end of another.
     * The first array will be modified.
     * @author André Cruz
     * @version 0.1.0 (2012/01/31)
     */
    function append(arr1, arr2) {
        Array.prototype.push.apply(arr1, arr2);
        return arr1;
    }
    return append;
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
     * @author Miller Medeiros
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
     * @author Miller Medeiros
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

define('Utils/array/union',['./unique'], function (unique) {

    /**
     * Concat multiple arrays and remove duplicates
     * @author Miller Medeiros
     * @version 0.1.0 (2011/01/12)
     */
    function union(arrs) {
        return unique(Array.prototype.concat.apply([], arguments));
    }

    return union;

});

define('Utils/array/some',['require'],function (forEach) {

    /**
     * ES5 Array.some
     * @author Miller Medeiros
     * @version 0.2.1 (2011/11/25)
     */
    var some = Array.prototype.some?
                function (arr, callback, thisObj) {
                    return arr.some(callback, thisObj);
                } :
                function (arr, callback, thisObj) {
                    var result = false,
                        n = arr.length >>> 0;
                    while (n--) {
                        //according to spec callback should only be called for
                        //existing items
                        if ( n in arr && callback.call(thisObj, arr[n], n, arr) ) {
                            result = true;
                            break;
                        }
                    }
                    return result;
                };

    return some;
});

define('Utils/array/difference',['./unique', './filter', './some', './contains'], function (unique, filter, some, contains) {


    /**
     * Return a new Array with elements that aren't present in the other Arrays.
     * @author Miller Medeiros
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

define('Utils/array/insert',['./difference', '../lang/toArray'], function (difference, toArray) {

    /**
     * Insert item into array if not already present.
     * @author André Cruz, Miller Medeiros
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

define('Utils/Array/indexOf',[],function () {

    /**
     * ES5 Array.indexOf
     * @author Miller Medeiros
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

define('Utils/Array/forEach',[],function () {

    /**
     * ES5 Array.forEach
     * @author Miller Medeiros
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

define('Utils/Array/filter',['./forEach'], function (forEach) {

    /**
     * ES5 Array.filter
     * @author Miller Medeiros
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

define('Utils/Array/unique',['./indexOf', './filter'], function(indexOf, filter){

    /**
     * @return {array} Array of unique items
     * @author Miller Medeiros
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


define('Utils/Array/some',['require'],function (forEach) {

    /**
     * ES5 Array.some
     * @author Miller Medeiros
     * @version 0.2.1 (2011/11/25)
     */
    var some = Array.prototype.some?
                function (arr, callback, thisObj) {
                    return arr.some(callback, thisObj);
                } :
                function (arr, callback, thisObj) {
                    var result = false,
                        n = arr.length >>> 0;
                    while (n--) {
                        //according to spec callback should only be called for
                        //existing items
                        if ( n in arr && callback.call(thisObj, arr[n], n, arr) ) {
                            result = true;
                            break;
                        }
                    }
                    return result;
                };

    return some;
});

define('Utils/Array/contains',['./indexOf'], function (indexOf) {

    /**
     * If array contains values.
     * @author Miller Medeiros
     * @version 0.1.0 (2011/10/31)
     */
    function contains(arr, val) {
        return indexOf(arr, val) !== -1;
    }
    return contains;
});

define('Utils/Array/difference',['./unique', './filter', './some', './contains'], function (unique, filter, some, contains) {


    /**
     * Return a new Array with elements that aren't present in the other Arrays.
     * @author Miller Medeiros
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

define('Utils/Array/insert',['./difference', '../lang/toArray'], function (difference, toArray) {

    /**
     * Insert item into array if not already present.
     * @author André Cruz, Miller Medeiros
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

/*jslint sloppy: true*/
/*global define*/

define('Classify.Interface',[
        'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/object/forOwn',
    'Utils/Array/insert',
    'Utils/lang/createObject'
    ], function (
        isObject,
    isFunction,
    forOwn,
    insert,
    createObject
    ) {

    /**
     *
     */
    function Interface(params) {

                if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }
        
        var interf = function () {
                        throw new Error('Interfaces cannot be instantiated.');
                    };

                params.Name = params.Name || 'Unnamed';

        /**
         * Grabs the static methods from the constructor parent and itself and merges them.
         *
         * @param {Function} constructor The constructor
         */
        function grabStatics(constructor) {

            var parent = constructor.Super ? constructor.Super.$constructor : null;

            constructor.$statics = [];

            if (constructor.prototype.Statics) {

                if (!isObject(constructor.prototype.Statics)) {
                    throw new TypeError('Statics definition for "' + params.Name + '" must be an object.');
                }

                forOwn(constructor.prototype.Statics, function (value, key) {
                    if (isFunction(value)) {
                        constructor.$statics.push(key);
                    }
                });
            }

            if (parent && parent.$statics) {

                parent.$statics.forEach(function (value) {
                    insert(constructor.$statics, value);
                });
            }

            if (!constructor.$statics.length) {
                delete constructor.$statics;
            }
        }

        if (params.Extends) {

            if (!isFunction(params.Extends) || !params.Extends.$interface) {
                throw new TypeError('The parent interface of "' + params.Name + '" is not a valid interface (defined in Extends).');
            }

            interf.Super = params.Extends.prototype;
            delete params.Extends;

            interf.prototype = createObject(interf.Super, params);
            delete interf.prototype.Extends;
        } else {
            interf.prototype = params;
        }

        interf.prototype.$constructor = interf;

        // Grab all statics from the parent and itself and references them for later use
        grabStatics(interf);
        delete interf.prototype.Statics;

        // TODO: Make a way to validate an interface
        interf.$interface = true;   // Mark it as an interface

        
        return interf;
    }

    return Interface;
});
/*jslint sloppy: true nomen: true evil: true, newcap:true*/
/*global define*/

define('Classify.Abstract',[
        'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/object/forOwn',
    'Utils/array/forEach',
    'Utils/lang/toArray',
    'Utils/array/union',
    'Utils/array/insert',
        'Trinity/Classify',
    'require'
], function (
        isObject,
    isFunction,
    forOwn,
    forEach,
    toArray,
    union,
    insert,
        Classify,
    require
) {

    // We need to return a closure in order to solve the requirejs circular dependency
    return function (params) {

        Classify = require('Trinity/Classify');

        var def;

                if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        params.Name = params.Name || 'Unnamed';

        /*jslint vars:true*/
        var originalInitialize = params.initialize,
            parent,
            abstractMethods = { normal: [], statics: [] };
        /*jslint vars:false*/

        /**
         * Grab the source abstrac methods and append them to the target arrays
         *
         * @param {Object} source The source
         * @param {Object} target An object container normal and statics array
         * @param {String} name   The name of the class
         */
        function grabAbstracts(source, target, name) {

            forOwn(source, function (value, key) {

                if (key !== 'Statics') {
                    insert(target.normal, key);
                } else {

                    if (!isObject(source.Statics)) {
                        throw new TypeError('Statics definition for abstract class "' + name + '" must be an object.');
                    }

                    forOwn(source.Statics, function (value, key) {

                        if (isFunction(value)) {
                            insert(target.statics, key);
                        }
                    });
                }
            });
        }
        
        // Grab all the abstract methods
        if (params.Abstracts) {

                        if (!isObject(params.Abstracts)) {
                throw new TypeError('Abstracts defined in abstract class "' + params.Name + "' must be an object.");
            }

            grabAbstracts(params.Abstracts, abstractMethods, params.Name);
            
            delete params.Abstracts;
        }

                // Automatically grab not implemented interface methods
        if (params.Implements) {


            forEach(toArray(params.Implements), function (value, x) {

                if (!isFunction(value) || !value.$interface) {
                    throw new TypeError('Unexpected interface at index ' + x + ' for abstract class "' + value.prototype.Name + "'.");
                }

                grabAbstracts(value.prototype, abstractMethods, params.Name);
            });

            delete params.Implements;
        }

        // If we are extending an abstract class also, merge the abstract methods
        if (params.Extends && isFunction(params.Extends)) {

            parent = params.Extends;

            if (params.Extends.$class) {
                originalInitialize = originalInitialize || function () { parent.prototype.initialize.apply(this, arguments); };
            }

            if (params.Extends.$abstract) {
                abstractMethods.normal = union(abstractMethods.normal, params.Extends.$abstract.normal);
                abstractMethods.statics = union(abstractMethods.statics, params.Extends.$abstract.statics);
            }
        } else {
            originalInitialize = originalInitialize || function () {};
        }

        // Override the constructor
        params.initialize = function () {

            if (!this.$initializing) {
                throw new Error('An abstract class cannot be instantiated.');
            }

            originalInitialize.apply(this, arguments);
        };

        params.$abstract = true;    // Mark the instance as abstract
        
        // Create the class definition
        def = Classify(params);

                delete def.prototype.$abstract;    // Delete the mark and add it to the constructor
        def.$abstract = abstractMethods;
        
        return def;
    };
});
/*jslint sloppy: true, forin: true, newcap:true*/
/*global define*/

/**
 * Classify - Sugar syntax for Prototypal Inheritance
 *
 * @author Luís Couto <lcouto87@gmail.com>
 * @author André Cruz <andremiguelcruz@msn.com>
 * @version 1.0.0
 *
 * @example
 *
 *      var MyClass = Classify({
 *          Implements: [SomeInterface, OtherInterface],
 *          Extends: ParentClass,
 *          Borrows: [SomeMixin, OtherMixin],
 *          Binds: ['method1', 'method2'],
 *          Statics: {
 *              staticMethod1: function () {},
 *              staticMethod2: function () {},
 *              staticMethod3: function () {},
 *          },
 *          initialize: function () {
 *              MyClass.Super.initialize.call(this);
 *          },
 *          method1: function () {},
 *          method2: function () {},
 *          method3: function () {}
 *      });
 */
define('Trinity/Classify', [
        'Utils/lang/isFunction',
    'Utils/lang/isString',
    'Utils/array/intersection',
    'Utils/array/unique',
        'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/keys',
    'Utils/array/forEach',
    'Utils/array/combine',
    'Utils/array/append',
    'Utils/lang/bind',
    'Utils/lang/toArray',
    'Classify.Abstract',
    'Classify.Interface'
], function (
        isFunction,
    isString,
    intersection,
    unique,
        isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    keys,
    forEach,
    combine,
    append,
    bind,
    toArray,
    Abstract,
    Interface
) {

    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @returns {Function} The constructor
     */
    function Classify(params) {

                if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        params.Name = params.Name || 'Unnamed';

        if (params.Abstracts && !params.$abstract) {
            throw new Error('Class "' + params.Name + '" has abstract methods, therefore it must be defined as abstract.');
        }
        
        
        var classify,
            parent;


        /**
         *  Inherits source classic methods if not defined in target
         *
         *  @param {Function} source The source
         *  @param {Function} target The target
         */
        function inheritStatics(source, target) {

            if (source.$statics) {

                if (!target.$statics) {
                    target.$statics = [];
                }

                forEach(source.$statics, function (value) {
                    if (isUndefined(target[value])) {    // Already defined members are not overwritten
                        target[value] = source[value];
                        target.$statics.push(value);
                    }
                });

                if (!target.$statics.length) {
                    delete target.$statics;
                }
            }
        }

        /**
         * Borrows the properties and methods of various source objects to the target.
         *
         * @param {Array}  sources Array of objects that will give their methods
         * @param {Object} target  Target that will receive the methods
         */
        function borrows(sources, target) {

            sources = toArray(sources);

                        if (sources.length !== unique(sources).length) {
                throw new Error('There are duplicate entries defined in Borrows of "' + target.prototype.Name + '".');
            }
                        var i,
                current,
                key;

            for (i = sources.length - 1; i >= 0; i -= 1) {    // We don't use forEach here due to performance

                                if ((!isFunction(sources[i]) || !sources[i].$class || sources[i].$abstract) && (!isObject(sources[i]) || sources[i].$constructor)) {
                    throw new TypeError('Entry at index ' + i + ' in Borrows of class "' + target.prototype.Name + '" is not a valid class/object (abstract classes and instances of classes are not supported). ');
                }
                
                // Do the mixin manually because we need to ignore already defined methods and handle statics
                current = isObject(sources[i]) ? Classify(mixIn({}, sources[i])).prototype : sources[i].prototype;

                for (key in current) {
                    if (isUndefined(target.prototype[key])) {    // Besides ignoring already defined members, reserved words like $constructor are also preserved
                        target.prototype[key] = current[key];
                    }
                }

                // Merge the statics and binds
                inheritStatics(current.$constructor, target);

                if (current.$constructor.$binds) {
                    target.$binds = target.$binds || [];
                    combine(target.$binds, current.$constructor.$binds);
                }
            }
        }

        /**
         * Fixes the context in given methods.
         *
         * @param {Array}  fns     The array of functions to be bound
         * @param {Object} context The context that will be bound
         * @param {Object} target  The target class that will have these methods
         */
        function binds(fns, context, target) {

            var i;

            for (i = fns.length - 1; i >= 0; i -= 1) {    // We don't use forEach here due to performance
                target[fns[i]] = bind(target[fns[i]], context);
            }
        }

                /**
         * Checks a target against interfaces methods.
         *
         * @param {Array}  interfaces The array of interfaces
         * @param {Object} target     The target that will be check
         */
        function checkInterfaces(interfaces, target) {

            interfaces = toArray(interfaces);

            var checkStatic = function (value) {
                    if (!isFunction(target[value])) {
                        throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + this.prototype.Name + '" correctly, static method "' + value + '()" was not found.');
                    }
                };

            forEach(interfaces, function (curr, i) {

                var k;

                if (!isFunction(curr) || !curr.$interface) {
                    throw new TypeError('Entry at index ' + i + ' in Implements of class "' + params.Name + '" is not a valid interface.');
                }

                // Check normal functions
                for (k in curr.prototype) {
                    if (isFunction(curr.prototype[k]) && !isFunction(target.prototype[k])) {
                        throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + curr.prototype.Name + '" correctly, method "' + k + '()" was not found.');
                    }
                }

                // Check static functions
                if (curr.$statics) {
                    forEach(curr.$statics, checkStatic, curr);
                }
            });
        }

        /**
         * Checks a target against an abstract class.
         *
         * @param {Function} abstractClass The abstract class
         * @param {Object}   target        The target that will be check
         */
        function checkAbstract(abstractClass, target) {

            var abstracts = abstractClass.$abstract;

            forEach(abstracts.normal, function (func) {
                if (!isFunction(target.prototype[func])) {
                    throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + abstractClass.prototype.Name + '" correctly, method "' + func + '()" was not found.');
                }
            });

            forEach(abstracts.statics, function (func) {
                if (!isFunction(target[func])) {
                    throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + abstractClass.prototype.Name + '" correctly, static method "' + func + '()" was not found.');
                }
            });
        }
        
        /**
         * Grab all the bound from the constructor parent and itself and merges them for later use.
         *
         * @param {Function} constructor The constructor
         */
        function grabBinds(constructor) {

            var parent = constructor.Super ? constructor.Super.$constructor : null,
                prototype = constructor.prototype;

                        if ((prototype.Binds || []).length !== unique(prototype.Binds || []).length) {
                throw new Error('There are duplicate binds in "' + prototype.Name + '".');
            }
            if (intersection(constructor.$binds || [], prototype.Binds || []).length > 0) {
                throw new Error('There are binds in "' + prototype.Name + '" that are already being bound by a mixin (used in Borrows).');
            }
            
            if (!constructor.$binds) {
                constructor.$binds = prototype.Binds || [];
            } else if (prototype.Binds) {
                append(constructor.$binds, prototype.Binds);
            }


            if (parent && parent.$binds) {

                                if (intersection(constructor.$binds, parent.$binds).length > 0) {
                    throw new Error('There are binds in "' + prototype.Name + '" that are already being bound in the parent class.');
                }
                
                Array.prototype.push.apply(constructor.$binds, parent.$binds);
            }

                        if (constructor.$binds) {

                forEach(constructor.$binds, function (value) {

                    if (!isString(value)) {
                        throw new TypeError('All bind entries of "' + prototype.Name + '" must be a string.');
                    }

                    if (!isFunction(prototype[value])) {
                        throw new Error('Method "' + value + '()" referenced in "' + prototype.Name + '" binds does not exist.');
                    }
                });
            }
            
            if (!constructor.$binds.length) {
                delete constructor.$binds;
            }
        }

        /**
         * Grabs the static methods from the constructor parent and itself and merges them.
         *
         * @param {Function} constructor The constructor
         */
        function grabStatics(constructor) {

            // TODO: Shall we improve this function due to performance?
            if (constructor.prototype.Statics) {

                                if (!isObject(constructor.prototype.Statics)) {
                    throw new TypeError('Statics definition for "' + params.Name + '" must be an object.');
                }
                
                mixIn(constructor, constructor.prototype.Statics);
                constructor.$statics = keys(constructor.prototype.Statics);
            }

            // Inherit statics from parent
            if (constructor.Super) {
                inheritStatics(constructor.Super.$constructor, constructor);
            }
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
         * @param {Funciton} initialize The initialize function
         *
         * @return {Function} The constructor function
         */
        function constructor(initialize) {

            return function initializer() {

                // Reset some types of the object in order for each instance to have their variables
                reset(this);

                // Apply binds
                if (this.$constructor.$binds) {
                    binds(this.$constructor.$binds, this, this);
                }

                                // Call initialize
                if (!this.$constructor.$abstract) {
                    this.$initializing = true;
                }
                
                initialize.apply(this, arguments);

                                delete this.$initializing;
                            };
        }

        if (params.Extends) {

                        if (!isFunction(params.Extends) || !params.Extends.$class) {
                throw new TypeError('Specified parent class in Extends of "' + params.Name + '" is not a valid class.');
            }
            
            parent = params.Extends;
            delete params.Extends;

            params.initialize = params.initialize || function () { parent.prototype.initialize.apply(this, arguments); };
            classify = constructor(params.initialize);
            classify.Super = parent.prototype;
            classify.prototype = createObject(parent.prototype, params);
        } else {
            params.initialize = params.initialize || function () {};
            classify = constructor(params.initialize);
            classify.prototype = params;
        }

        classify.prototype.$constructor = classify;
                classify.$class = true;
        
        // Grab static methods from the parent and itself
        grabStatics(classify);
        
        // Grab all the defined mixins
        if (params.Borrows) {
            borrows(params.Borrows, classify);
            delete classify.prototype.Borrows;
        }

        // Grab all the defined binds
        if (params.Binds) {
            grabBinds(classify);
            delete classify.prototype.Binds;
        }

                // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent.$abstract && !params.$abstract) {
            checkAbstract(parent, classify);
        }
        
        // If the class implement some interfaces and is not abstract then
        if (params.Implements) {

                        if (!params.$abstract) {
                checkInterfaces(params.Implements, classify);
            }
            
            delete classify.prototype.Implements;
        }

                if (params.Statics) {
            delete classify.prototype.Statics;  // Delete statics now
        }
        
        return classify;
    }

    Classify.Abstract = Abstract;
    Classify.Interface = Interface;

    return Classify;
});
