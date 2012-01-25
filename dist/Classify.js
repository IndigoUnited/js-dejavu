
define('Classify.Abstract',[],function(){

    function Abstract(methods) {};
    return Abstract;

});
define('Classify.Interface',[],function(){

    function Interface (methods) {

        if (!methods) {
            throw new Error("Classify.Interface constructor called with no arguments, but expects at least 1")
        }

        if (!methods.Name) {
            methods.Name = "Unnamed";
        }

        if (methods.Name && typeof methods.Name !== "string") {
            throw new Error("Classify.Interface's property 'Name' must be a String")
        }

        function extend(target, source) {
            var k;
            for (k in source) {
                if (source.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }

        function Interface () {
            extend(this, methods);
        }

        if (methods.Extends) {
            Interface.prototype = methods.Extends;
        }

        return new Interface();
    };

    return Interface;
});
define('Utils/Object/hasOwn',[],function () {

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

define('Utils/Object/mixIn',['./hasOwn'], function(hasOwn){

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

/*jslint sloppy: true, nomen: true*/
/*global define*/

define('Classify.Singleton',['Trinity/Classify', 'Utils/Object/mixIn', 'require'], function (Classify, mixIn, require) {

    function Singleton(params) {

        var originalInitialize = params.initialize,
            ClassDef;

        // Override the constructor
        function initialize() {

            if (this.$initializing) {
                originalInitialize.apply(this, arguments);
            } else {
                throw new Error("A singleton class cannot be constructed using the new operator. Use #getInstance() instead.");
            }
        }
        params.initialize = initialize;

        // Add methods to the Statics object
        params.Statics = mixIn({

            __instance: null,    // Private variable that holds the instance

            /**
             * Returns the instance.
             * You can pass any arbitrary arguments.
             * Those will be passed to the constructor if the instance is not yet created.
             * 
             * @return {Object} The instance
             */
            getInstance: function () {

                if (this.__instance === null) {

                    var params = [],
                        length = arguments.length,
                        x,
                        that = this;

                    for (x = 0; x < length; x += 1) {
                        params.push("arguments[" + x + "]");
                    }

                    this.prototype.$initializing = true;
                    eval("that.__instance = new that(" + params.join() + ");")
                    this.prototype.$initializing = false;
                }

                return this.__instance;
            },

            /**
             * Unsets the underlying instance.
             */
            unsetInstance: function () {
                this.__instance = null;
            }

        }, params.Statics || {}); // Let user override the methods if they want

        return params;
    }

    // We need to make a closure in order to solve the circular reference of requirejs
    return function (params) {
        Classify = require('Trinity/Classify');
        Singleton(params);
        ClassDef = Classify(params);
        return ClassDef;
    }
});

/*jslint sloppy: true*/
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
define("Trinity/Classify", ["Classify.Abstract", "Classify.Interface", "Classify.Singleton"], function (Abstract, Interface, Singleton) {


    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @returns {Function} The constructor
     */

    function Classify(params) {

        var classify;

        /**
         * Extends an object with another given object.
         *
         * @private
         *
         * @param {Object} source The object to copy from
         * @param {Object} target The object that will get the source properties and methods
         */

        function extend(source, target) {

            var k;

            for (k in source) {
                if (source.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }

        /**
         * Borrows the properties and methods of various source objects to the target.
         *
         * @private
         *
         * @param {Array}  sources Array of objects that will give their methods
         * @param {Object} target  Target that will receive the methods
         */

        function borrows(sources, target) {

            var i, length = sources.length,
                constructorBck, current;

            for (i = 0; i < length; i += 1) {

                current = sources[i];

                if (current.prototype && current.prototype.constructor) {
                    constructorBck = current.prototype.constructor;
                    delete current.prototype.constructor;
                    extend(current.prototype, target.prototype);
                    current.prototype.constructor = constructorBck;
                } else {
                    extend(current.prototype || current, target.prototype);
                }
            }
        }

        /**
         * Fixes the context in given methods.
         *
         * @private
         *
         * @param {Array}  fns     The array of functions to be binded
         * @param {Object} context The context that will be bound
         * @param {Object} target  The target class that will have these methods
         */

        function binds(fns, context, target) {

            var proxy = function (func) {

                if (Function.prototype.bind) {
                    return func.bind(context);
                }

                return function () {
                    return func.apply(context, arguments);
                };

            },
                i = fns.length - 1;

            for (i; i >= 0; i -= 1) {
                target[fns[i]] = proxy(target[fns[i]], classify);
            }
        }

        /**
         * Copies the given object into a freshly created empty function's prototype.
         *
         * @private
         *
         * @param {Object} object Object
         *
         * @returns {Function} Thew new instance
         */

        function clone(object) {

            function F() {}
            F.prototype = object;

            return new F();
        }

        /**
         * Checks a target against interfaces methods.
         *
         * @param {Array} implementations The array of interfaces
         * @param {Object} target         The target that will be check
         */

        function interfaces(implementations, target) {

            var i, k, m, curr;

            if (Object.prototype.toString.call(implementations) !== "[object Array]") {
                implementations = [implementations];
            }

            for (i = implementations.length - 1; i >= 0; i -= 1) {
                curr = implementations[i];

                for (k in curr) {
                    if (curr.hasOwnProperty(k)) {
                        if ((k !== "Extends" && k !== "Name" && k !== "Statics") && !target.prototype.hasOwnProperty(k)) {
                            throw new Error("Class does not implements Interface " + curr.Name + " correctly, " + k + " was not found");
                        }

                        if (k === "Statics") {
                            if (!target.prototype.hasOwnProperty(k)) {
                                throw new Error("Class does not implements Interface " + curr.Name + " correctly, " + k + " method was not found");
                            }

                            for (m in curr.Statics) {
                                if (curr.Statics.hasOwnProperty(m)) {
                                    if (!target.hasOwnProperty(m)) {
                                        throw new Error("Class does not implements Interface " + curr.Name + " correctly, static method " + k + "  was not found");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


        classify = params.initialize || function () {};

        if (params.Extends) {
            classify.Super = params.Extends.prototype;
            classify.prototype = clone(classify.Super);
            extend(params, classify.prototype);
        } else {
            classify.prototype = params;
        }

        classify.prototype.constructor = classify;

        if (params.Borrows) {
            borrows(params.Borrows, classify);
            delete classify.prototype.Borrows;
        }

        if (params.Binds) {
            binds(params.Binds, classify, classify.prototype);
            delete classify.prototype.Binds;
        }

        if (params.Statics) {
            extend(params.Statics, classify);
        }

        if (params.Implements) {
            interfaces(params.Implements, classify);
            delete classify.prototype.Implements;
        }
        
        delete classify.prototype.Statics;

        return classify;
    }

    Classify.Abstract = Abstract;
    Classify.Interface = Interface;
    Classify.Singleton = Singleton;

    return Classify;
});
