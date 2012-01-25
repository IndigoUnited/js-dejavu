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
