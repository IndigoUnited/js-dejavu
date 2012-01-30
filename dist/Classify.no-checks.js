
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

/*jslint sloppy: true*/
/*global define*/

define('Classify.Interface',[
    ], function (
    ) {

    /**
     *
     */
    function Interface(params) {

        
        var interf = function () {
                    };

        
        return interf;
    }

    return Interface;
});
/*jslint sloppy: true nomen: true evil: true, newcap:true*/
/*global define*/

define('Classify.Abstract',[
        'Trinity/Classify',
    'require'
], function (
        Classify,
    require
) {

    // We need to return a closure in order to solve the requirejs circular dependency
    return function (params) {

        Classify = require('Trinity/Classify');

        var def;

        
        // Grab all the abstract methods
        if (params.Abstracts) {

            
            delete params.Abstracts;
        }

        
        // Create the class definition
        def = Classify(params);

        
        return def;
    };
});
/*jslint sloppy: true, forin: true*/
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
        'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/keys',
    'Utils/array/forEach',
    'Utils/lang/bind',
    'Utils/lang/toArray',
    'Classify.Abstract',
    'Classify.Interface'
], function (
        isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    keys,
    forEach,
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

        
                delete params.Name;
        
        var classify,
            parent;

        /**
         * Borrows the properties and methods of various source objects to the target.
         *
         * @param {Array}  sources Array of objects that will give their methods
         * @param {Object} target  Target that will receive the methods
         */
        function borrows(sources, target) {

            sources = toArray(sources);

            var i, length = sources.length,
                current,
                key;

            for (i = 0; i < length; i += 1) {

                current = sources[i];

                
                // Do the mixin manually because we need to ignore already defined methods
                current = isObject(current) ? current : current.prototype;

                for (key in current) {
                    if (isUndefined(target.prototype[key])) {    // Besides ignoring already defined, also reserved words like $constructor are also preserved
                        target.prototype[key] = current[key];
                    }
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

            var i = fns.length - 1;

            for (i; i >= 0; i -= 1) {    // We don't use forEach here due to performance
                target[fns[i]] = bind(target[fns[i]], context);
            }
        }

        
        /**
         * Grab all the bound from the constructor parent and itself and merges them for later use.
         *
         * @param {Function} constructor The constructor
         */
        function grabBinds(constructor) {

            var parent = constructor.Super ? constructor.Super.$constructor : null,
                prototype = constructor.prototype;

            
            if (parent && parent.$binds) {

                
                constructor.$binds = (prototype.Binds || []).concat(parent.$binds);
            } else if (params.Binds) {
                constructor.$binds = prototype.Binds;
            }

            
            delete prototype.Binds;
        }

        /**
         * Grabs the static methods from the constructor parent and itself and merges them.
         *
         * @param {Function} constructor The constructor
         */
        function grabStatics(constructor) {

            var parent = constructor.Super ? constructor.Super.$constructor : null;

            // TODO: Shall we improve this function due to performance?
            if (constructor.prototype.Statics) {

                
                mixIn(constructor, constructor.prototype.Statics);
                constructor.$statics = keys(constructor.prototype.Statics);
            }

            if (parent && parent.$statics) {

                if (!constructor.$statics) {
                    constructor.$statics = [];
                }

                forEach(parent.$statics, function (value) {
                    if (isUndefined(constructor[value])) {    // Besides ignoring already defined, also reserved words like $abstract are also preserved
                        constructor[value] = parent[value];
                        constructor.$statics.push(value);
                    }
                });
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

                                initialize.apply(this, arguments);
                            };
        }

        if (params.Extends) {

            
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

        // Grab static methods from the parent and itself
        grabStatics(classify);
                if (params.Statics) {
            delete classify.prototype.Statics;  // If we got checks enabled, we can't delete the Statics yet (see bellow)
        }
        
        
        // If the class implement some interfaces and is not abstract then
        if (params.Implements) {

            
            delete classify.prototype.Implements;
        }

        
        return classify;
    }

    Classify.Abstract = Abstract;
    Classify.Interface = Interface;

    return Classify;
});
