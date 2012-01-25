
define('Classify.Abstract',[],function(){

    function Abstract(methods) {};
    return Abstract;

});
/*jslint sloppy: true*/
/*global define*/

define('Classify.Interface',[],function () {

    function Interface(methods) {

        if (!methods.Name) {
            methods.Name = 'Unnamed';
        }

        function extend(target, source) {

            var k;

            for (k in source) {
                if (source.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }

        function InterfaceConstructor() {
            extend(this, methods);
        }

        if (methods.Extends) {
            Interface.prototype = methods.Extends;
        }

        // TODO: Make a way to test if a class implements an interface
        return new InterfaceConstructor();
    }

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

/*jslint sloppy: true nomen: true evil: true*/
/*global define*/

define('Classify.Singleton',['Trinity/Classify', 'Utils/Object/mixIn', 'require'], function (Classify, mixIn, require) {

    function Singleton(params) {

        var originalInitialize = params.initialize;

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

            $singleton: true,    // We hold this in order to inform that we have a singleton
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
                    // TODO: We are using eval here.. I couldn't make this work with new Function
                    //       Think of a better way to curry the params of getInstance to the constructor
                    eval("that.__instance = new that(" + params.join() + ");");
                    delete this.prototype.$initializing;
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
        return Classify(params);
    };
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
define('Trinity/Classify', ['Classify.Abstract', 'Classify.Interface', 'Classify.Singleton'], function (Abstract, Interface, Singleton) {


    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @returns {Function} The constructor
     */

    function Classify(params) {

        var initialize = params.initialize || function () {},
            classify = initialize;

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

            for (i = implementations.length - 1; i >= 0; i -= 1) {
                curr = implementations[i];

                for (k in curr) {
                    if (curr.hasOwnProperty(k)) {
                        if ((k !== 'Name' && k !== 'Statics') && !target.prototype.hasOwnProperty(k)) {
                            throw new Error('Class does not implements Interface ' + curr.Name + ' correctly, ' + k + ' was not found');
                        }

                        if (k === 'Statics') {
                            if (!target.prototype.hasOwnProperty(k)) {
                                throw new Error('Class does not implements Interface ' + curr.Name + ' correctly, ' + k + 'object was not found');
                            }

                            for (m in curr.Statics) {
                                if (curr.Statics.hasOwnProperty(m)) {
                                    if (!target.hasOwnProperty(m)) {
                                        throw new Error('Class does not implements Interface ' + curr.Name + ' correctly, static method ' + k + '  was not found');
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (params.Extends) {

            // If the user is not defining a singleton but extends one..
            if ((!params.Statics || !params.Statics.$singleton) && params.Extends.$singleton) {
                classify = function () {
                    this.$initializing = true;
                    initialize.apply(this, arguments);
                    delete this.$initializing;
                };
            }

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
            extend(params.Statics, classify);   // We can't delete the Statics yet
        }

        if (params.Implements) {
            interfaces(params.Implements, classify);
            delete classify.prototype.Implements;
        }

        if (params.Statics) {
            delete classify.prototype.Statics;  // Delete it now
        }

        return classify;
    }

    Classify.Abstract = Abstract;
    Classify.Interface = Interface;
    Classify.Singleton = Singleton;

    return Classify;
});
