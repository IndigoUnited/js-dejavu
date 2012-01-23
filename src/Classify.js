/*jslint sloppy: true */
/*global define */

/**
 * Classify - Sugar syntax for Prototypal Inheritance
 *
 * @author Luís Couto <lcouto87@gmail.com>
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
 *          initialize: function () {},
 *          method1: function () {},
 *          method2: function () {},
 *          method3: function () {}
 *      });
 */
define("Trinity/Classify", ["Classify.Abstract", "Classify.Interface", "Classify.Singleton"], function (Abstract, Singleton, Interface) {

    /**
     * Create a class definition.
     * 
     * @param {Object} params An object containing methods and properties
     * 
     * @returns Function
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
         * Borrows the properties and methods of various source objects to the target
         *
         * @private
         * 
         * @param {Array}  sources Array of objects that will give their methods
         * @param {Object} target  Target that will receive the methods
         */
        function borrows(sources, target) {

            var i = sources.length - 1,
                constructorBck;

            for (i; i >= 0; i -= 1) {
                if (sources[i].prototype && sources[i].prototype.constructor) {
                    constructorBck = sources[i].prototype.constructor;
                    delete sources[i].prototype.constructor;
                    extend(sources[i].prototype, target.prototype);
                    sources[i].prototype.constructor = constructorBck;
                } else {
                    extend(sources[i].prototype || sources[i], target.prototype);
                }
            }
        }

        /**
         * Fixes the context in given methods.
         *
         * @private
         * 
         * @param {Array} fns The array of functions to be binded
         * @param {Object} context The context that will be bound
         * @param {Object} target The target class that will have these methods
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
         * Copies the given object into a freshly created empty function's prototype
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
         * 
         */
        function interfaces(interfaces, target) {

            var i = interfaces.length - 1,
                k;

            for (i; i >= 0; i -= 1) {
                for (k in interfaces[i]) {
                    if (!target.hasOwnProperty(k) && (k !== "Extends" || k !== "Name")) {
                        throw new Error("Class does not implements Interface " + arr[i].Name + "correctly");
                    }
                }
            }
        }

        classify = params.initialize || function () {};

        if (params.Extends) {
            classify.Parent = params.Extends.prototype;
            classify.prototype = clone(classify.Parent);
            extend(params, classify.prototype);
        } else {
            classify.prototype = params;
        }

        classify.prototype.constructor = classify;

        if (params.Borrows) {
            borrows(params.Borrows, classify);
        }

        if (params.Binds) {
            binds(params.Binds, classify, classify.prototype);
        }

        if (params.Statics) {
            extend(params.Statics, classify);
            delete classify.prototype.Static;
        }

        if (params.Implements) {
            interfaces(params.Implements, this);
        }

        return classify;
    }

    Classify.Abstract = Abstract;
    Classify.Interface = Interface;
    Classify.Singleton = Singleton;

    return Classify;
});
