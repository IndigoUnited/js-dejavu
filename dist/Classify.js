
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

/*jslint sloppy: true*/
/*global define*/

define('Trinity/common/verifyReserved',[
    'Utils/object/forOwn',
    'Utils/array/contains',
    'Utils/array/difference'
], function (
    forOwn,
    contains,
    difference
) {
    var reservedNormal = ['$constructor', '$initializing'],
        reservedStatics = ['$class', '$abstract', '$interface', '$binds', '$statics'];

    /**
     * Verify reserved words found in classes/interfaces.
     * The second parameter can be normal or statics.
     * Normal will test for reserved words of the instance.
     * Statics will test for reserved words in the ckass statics.
     *
     * Will throw an error if any reserved key is found.
     *
     * @param {Object} object            The object to verify
     * @param {String} [type="normal"]   The list of reserved word to test
     * @param {Array}  [ignoreList="[]"] An array to ignore
     */
    function verifyReserved(object, type, ignoreList) {

        var reserved = type === 'normal' || !type ? reservedNormal : reservedStatics;

        if (ignoreList) {
            reserved = difference(reserved, ignoreList);
        }

        forOwn(object, function (value, key) {
            if (contains(reserved, key) || Object.prototype[key]) {
                throw new TypeError('"' + object.Name + '" is using a reserved keyword: ' + key);
            }
        });
    }

    return verifyReserved;
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

/*jslint sloppy: true*/
/*global define*/

define('Trinity/Classify.Interface',[
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/object/hasOwn',
    'Utils/object/forOwn',
    'Utils/array/combine',
    'Utils/array/insert',
    'Utils/lang/createObject',
    './common/verifyReserved'
], function (
    isObject,
    isFunction,
    hasOwn,
    forOwn,
    combine,
    insert,
    createObject,
    verifyReserved
) {
    /**
     * Grabs the static methods from the constructor parent and itself and merges them.
     *
     * @param {Function} constructor The constructor
     */
    function grabStatics(constructor) {

        var parent = constructor.Super ? constructor.Super.$constructor : null;

        constructor.$statics = [];

        if (hasOwn(constructor.prototype, 'Statics')) {

            // Verify if statics is an object
            if (!isObject(constructor.prototype.Statics)) {
                throw new TypeError('Statics definition for "' + constructor.prototype.Name + '" must be an object.');
            }

            // Verify reserved words
            verifyReserved(constructor.prototype.Statics, 'statics');

            forOwn(constructor.prototype.Statics, function (value, key) {
                if (isFunction(value)) {
                    insert(constructor.$statics, key);
                }
            });
        }

        if (parent && parent.$statics) {
            combine(constructor.$statics, parent.$statics);
        } else if (!constructor.$statics.length) {
            delete constructor.$statics;
        }
    }

    /**
     *
     */
    function Interface(params) {

        // Validate params as an object
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        params.Name = params.Name || 'Unnamed';

        // Verify reserved words
        verifyReserved(params);

        var interf = function () {
            throw new Error('Interfaces cannot be instantiated.');
        };

        if (hasOwn(params, 'Extends')) {

            // Verify if parent is a valid interface
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

define('Trinity/Classify.Abstract',[
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/lang/isArray',
    'Utils/lang/toArray',
    'Utils/object/forOwn',
    'Utils/object/hasOwn',
    'Utils/array/forEach',
    'Utils/array/combine',
    'Utils/array/insert',
    'Utils/array/contains',
    './common/verifyReserved',
    './Classify',
    'require'
], function (
    isObject,
    isFunction,
    isArray,
    toArray,
    forOwn,
    hasOwn,
    forEach,
    combine,
    insert,
    contains,
    verifyReserved,
    Classify,
    require
) {
    /**
     * Grab the source abstract methods and appends them to the abstract object array.
     *
     * @param {Object}   source The object that contains the methods
     * @param {Function} target The target object
     */
    function grabAbstracts(source, target) {

        if (!isObject(source)) {
            throw new TypeError('Abstracts defined in abstract class "' + target.prototype.Name + "' must be an object.");
        }

        verifyReserved(source);

        forOwn(source, function (value, key) {

            if (key !== 'Statics') {

                if (!isFunction(value)) {
                    throw new TypeError('Value for "' + key + '" in abstracts of abstract class "' + target.prototype.Name + "' must be a function.");
                }

                if (target.prototype[key]) {
                    throw new Error('Abstract method "' + key + '" of abstract class "' + target.prototype.Name + "' is already implemented and cannot be declared as abstract anymore.");
                }

                insert(target.$abstract.normal, key);
            } else {

                if (!isObject(source.Statics)) {
                    throw new TypeError('Statics definition for abstract class of abstract class "' + target.prototype.Name + '" must be an object.');
                }

                verifyReserved(source.Statics, 'statics');

                forOwn(source.Statics, function (value, key) {

                    if (!isFunction(value)) {
                        throw new TypeError('Value for "' + key + '" in abstracts (statics) of abstract class "' + target.prototype.Name + "' must be a function.");
                    }

                    if (target.$statics && contains(target.$statics, key)) {
                        throw new Error('Abstract static method "' + key + '" of abstract class "' + target.prototype.Name + "' is already implemented and cannot be declared as abstract anymore.");
                    }

                    insert(target.$abstract.statics, key);
                });
            }
        });
    }

    /**
     * Grab the interfaces methods and appends them to the abstract object arrays.
     *
     * @param {Array}    interfaces  The interfaces
     * @param {Function} target      The target
     */
    function grabInterfaces(interfaces, target) {

        var interfs = toArray(interfaces),
            reserved = ['$constructor', '$initializing'];

        // Verify argument type
        if (!interfaces.length && !isArray(interfs)) {
            throw new TypeError('Implements of abstract class "' + target.prototype.Name + '" must be an interface or an array of interfaces.');
        }

        forEach(interfs, function (interf, x) {

            // Validate interfaces
            if (!isFunction(interf) || !interf.$interface) {
                throw new TypeError('Entry at index ' + x + ' in Implements of class "' + target.prototype.Name + '" is not a valid interface.');
            }

            verifyReserved(interf.prototype, 'normal', reserved);

            forOwn(interf.prototype, function (value, key) {

                if (!contains(reserved, key) && isFunction(value)) {

                    if (target.prototype[key] && !isFunction(target[key])) {
                        throw new Error('Abstract class "' + target.prototype.Name + '" does not implement interface "' + interf.prototype.Name + '" correctly, method "' + key + '()" was not found.');
                    }

                    insert(target.$abstract.normal, key);
                }
            });

            // Merge static methods of interface
            if (interf.$statics) {
                forEach(interf.$statics, function (value) {
                    if (!target.$statics || !contains(target.$statics, value)) {
                        insert(target.$abstract.statics, value);
                    }
                });
            }
        });
    }

    // We need to return a closure in order to solve the requirejs circular dependency
    return function (params) {

        Classify = require('./Classify');

        var def;

        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        params.Name = params.Name || 'Unnamed';

        /*jslint vars:true*/
        var originalInitialize = params.initialize,
            parent,
            saved = {},
            abstractMethods = { normal: [], statics: [] };
        /*jslint vars:false*/

        // If we are extending an abstract class also, merge the abstract methods
        if (isFunction(params.Extends)) {

            parent = params.Extends;

            if (params.Extends.$class) {
                originalInitialize = originalInitialize || function () { parent.prototype.initialize.apply(this, arguments); };
            }

            if (params.Extends.$abstract) {
                combine(abstractMethods.normal, params.Extends.$abstract.normal);
                combine(abstractMethods.statics, params.Extends.$abstract.statics);
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

        // Save abstract methods and delete them
        if (hasOwn(params, 'Abstracts')) {
            saved.Abstracts = params.Abstracts;
        }

        // Save interfaces and delete them
        if (hasOwn(params, 'Implements')) {
            saved.Implements = params.Implements;
            delete params.Implements;
        }

        params.$abstract = true;    // Mark the instance as abstract

        // Create the class definition
        def = Classify(params);

        // Delete the abstract mark and add it to the constructor
        delete def.prototype.$abstract;
        def.$abstract = abstractMethods;

        // Process the saved abstract methods
        if (hasOwn(saved, 'Abstracts')) {
            grabAbstracts(saved.Abstracts, def);
            delete def.prototype.Abstracts;
        }

        // Process the saved interfaces
        if (hasOwn(saved, 'Implements')) {
            grabInterfaces(saved.Implements, def);
        }

        return def;
    };
});
/*jslint sloppy: true, forin: true, newcap:true*/
/*global define*/

/**
 * Classify - Sugar syntax for Prototypal Inheritance
 *
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
    './common/verifyReserved',
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/keys',
    'Utils/object/hasOwn',
    'Utils/array/forEach',
    'Utils/array/combine',
    'Utils/array/append',
    'Utils/lang/bind',
    'Utils/lang/toArray',
    './Classify.Abstract',
    './Classify.Interface'
], function (
    isFunction,
    isString,
    intersection,
    unique,
    verifyReserved,
    isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    keys,
    hasOwn,
    forEach,
    combine,
    append,
    bind,
    toArray,
    Abstract,
    Interface
) {

    var Classify;

    /**
     *  Merges source static methods if not defined in target.
     *
     *  @param {Function} source The source
     *  @param {Function} target The target
     */
    function mergeStatics(source, target) {

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

        var i,
            current,
            key,
            mixins;

        mixins = toArray(sources);

        // Verify argument type
        if (!mixins.length && !isArray(sources)) {
            throw new TypeError('Borrows of "' + target.prototype.Name + '" must be a class/object or an array of classes/objects.');
        }
        // Verify duplicate entries
        if (mixins.length !== unique(mixins).length) {
            throw new Error('There are duplicate entries defined in Borrows of "' + target.prototype.Name + '".');
        }

        for (i = mixins.length - 1; i >= 0; i -= 1) {    // We don't use forEach here due to performance

            // Verify each mixin
            if ((!isFunction(mixins[i]) || !mixins[i].$class || mixins[i].$abstract) && (!isObject(mixins[i]) || mixins[i].$constructor)) {
                throw new TypeError('Entry at index ' + i + ' in Borrows of class "' + target.prototype.Name + '" is not a valid class/object (abstract classes and instances of classes are not supported).');
            }

            if (isObject(mixins[i])) {
                try {
                    current = Classify(mixIn({}, mixins[i])).prototype;
                } catch (e) {
                    // When an object is being used, throw a more friend message if an error occurs
                    throw new Error('Unable to define object as class at index ' + i + ' in Borrows of class "' + target.prototype.Name + '" (' + e.message + ').');
                }
            } else {
                current = mixins[i].prototype;
            }

            for (key in current) {
                if (isUndefined(target.prototype[key])) {    // Already defined members are not overwritten
                    target.prototype[key] = current[key];
                }
            }

            // Merge the statics
            mergeStatics(current.$constructor, target);

            // Merge the binds
            if (current.$constructor.$binds) {
                target.$binds = target.$binds || [];
                combine(target.$binds, current.$constructor.$binds);
            }
        }
    }

    /**
     * Fixes the context of given methods in the target.
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
     * Checks a target against a interfaces definition.
     *
     * @param {Array}  interfaces The array of interfaces
     * @param {Object} target     The target that will be checked
     */
    function checkInterfaces(interfaces, target) {

        var interf = toArray(interfaces),
            checkStatic = function (value) {
                if (!isFunction(target[value]) || !hasOwn(target, value)) {
                    throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + this.prototype.Name + '" correctly, static method "' + value + '()" was not found.');
                }
            };

        // Verify argument type
        if (!interf.length && !isArray(interfaces)) {
            throw new TypeError('Implements of class "' + target.prototype.Name + '" must be an interface or an array of interfaces.');
        }

        forEach(interfaces, function (curr, i) {

            var k;

            // Verify if it's a valid interface
            if (!isFunction(curr) || !curr.$interface) {
                throw new TypeError('Entry at index ' + i + ' in Implements of class "' + target.prototype.Name + '" is not a valid interface.');
            }

            // Check normal functions
            for (k in curr.prototype) {
                if (k !== 'Name' && k !== '$constructor') {   // Ignore reserved keywords
                    if (isFunction(curr.prototype[k]) && !isFunction(target.prototype[k])) {
                        throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + curr.prototype.Name + '" correctly, method "' + k + '()" was not found.');
                    }
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

        // Check normal functions
        forEach(abstracts.normal, function (func) {
            if (!isFunction(target.prototype[func])) {
                throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + abstractClass.prototype.Name + '" correctly, method "' + func + '()" was not found.');
            }
        });

        // Check static functions
        forEach(abstracts.statics, function (func) {
            if (!isFunction(target[func]) || !hasOwn(target, func)) {
                throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + abstractClass.prototype.Name + '" correctly, static method "' + func + '()" was not found.');
            }
        });
    }

    /**
     * Grab all the binds from the constructor parent and itself and merges them for later use.
     *
     * @param {Function} constructor The constructor
     */
    function grabBinds(constructor) {

        var parent = constructor.Super ? constructor.Super.$constructor : null,
            binds;

        if (hasOwn(constructor.prototype, 'Binds')) {

            binds = toArray(constructor.prototype.Binds);

            // Verify arguments type
            if (!binds.length && !isArray(constructor.prototype.Binds)) {
                throw new TypeError('Binds of "' + constructor.prototype.Name + '" must be a string or an array of strings.');
            }
            // Verify duplicate binds
            if (binds.length !== unique(binds).length) {
                throw new Error('There are duplicate binds in "' + constructor.prototype.Name + '".');
            }
            // Verify duplicate binds already proved in mixins
            if (intersection(constructor.$binds || [], binds).length > 0) {
                throw new Error('There are binds in "' + constructor.prototype.Name + '" that are already being bound by a mixin (used in Borrows).');
            }

            constructor.$binds = append(constructor.$binds || [], binds);
            delete constructor.prototype.Binds;
        }

        if (parent && parent.$binds) {

            // Verify duplicate binds already provided by the parent
            if (intersection(constructor.$binds || [], parent.$binds).length > 0) {
                throw new Error('There are binds in "' + constructor.prototype.Name + '" that are already being bound in the parent class.');
            }

            constructor.$binds = append(constructor.$binds || [], parent.$binds);
        } else if (constructor.$binds && !constructor.$binds.length) {
            delete constructor.$binds;
        }

        // Finnaly verify if all binds are strings and reference existent methods
        if (constructor.$binds) {

            forEach(constructor.$binds, function (value) {
                if (!isString(value)) {
                    throw new TypeError('All bind entries of "' + constructor.Name + '" must be a string.');
                }
                if (!isFunction(constructor.prototype[value]) && (!constructor.prototype.Abstracts || !constructor.prototype.Abstracts[value])) {
                    throw new Error('Method "' + value + '()" referenced in "' + constructor.prototype.Name + '" binds does not exist.');
                }
            });
        }
    }

    /**
     * Grabs the static methods from the constructor parent and itself and merges them.
     *
     * @param {Function} constructor The constructor
     */
    function grabStatics(constructor) {

        // TODO: Shall we improve this function due to performance?
        if (hasOwn(constructor.prototype, 'Statics')) {

            // Verify if statics is an object
            if (!isObject(constructor.prototype.Statics)) {
                throw new TypeError('Statics definition for "' + constructor.prototype.Name + '" must be an object.');
            }

            // Verify reserved words
            verifyReserved(constructor.prototype.Statics, 'statics');

            mixIn(constructor, constructor.prototype.Statics);
            constructor.$statics = keys(constructor.prototype.Statics);

        }

        // Inherit statics from parent
        if (constructor.Super) {
            mergeStatics(constructor.Super.$constructor, constructor);
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

            delete this.$initializing;    // TODO: Check $abstract before deleting due to performance?
        };
    }

    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @returns {Function} The constructor
     */
    Classify = function (params) {

        // Validate params as an object
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        // Give the class a default name
        params.Name = params.Name || 'Unnamed';

        // Verify reserved words
        verifyReserved(params);

        // Verify if the class has abstract methods but is not defined as abstract
        if (hasOwn(params, 'Abstracts') && !params.$abstract) {
            throw new Error('Class "' + params.Name + '" has abstract methods, therefore it must be defined as abstract.');
        }

        var classify,
            parent;

        if (hasOwn(params, 'Extends')) {
            // Verify if parent is a valid class
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
        if (hasOwn(params, 'Borrows')) {
            borrows(params.Borrows, classify);
            delete classify.prototype.Borrows;
        }

        // Grab binds from the parent and itself
        grabBinds(classify);

        // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent.$abstract && !params.$abstract) {
            checkAbstract(parent, classify);
        }

        // If the class implement some interfaces and is not abstract then
        if (hasOwn(params, 'Implements')) {
            if (!params.$abstract) {
                checkInterfaces(params.Implements, classify);
            }
            delete classify.prototype.Implements;
        }

        if (hasOwn(params, 'Statics')) {
            delete classify.prototype.Statics;  // Delete statics now
        }

        return classify;
    };

    Classify.Abstract = Abstract;
    Classify.Interface = Interface;

    return Classify;
});
