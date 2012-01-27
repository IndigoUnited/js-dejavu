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
define('Trinity/Classify', ['Classify.Abstract', 'Classify.Interface'], function (Abstract, Interface) {

    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @returns {Function} The constructor
     */

    function Classify(params) {

        var classify = params.initialize;

        /**
         * Extends an object with another given object.
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

                for (k in curr.prototype) {

                    if ((k !== 'Name' && k !== 'Statics') && !target.prototype.hasOwnProperty(k)) {
                        throw new Error('Class does not implements Interface ' + curr.Name + ' correctly, ' + k + ' was not found.');
                    }

                    if (k === 'Statics') {
                        if (!target.prototype.hasOwnProperty(k)) {
                            throw new Error('Class does not implements Interface ' + curr.Name + ' correctly, static methods missing.');
                        }

                        for (m in curr.prototype.Statics) {
                            if (!target.prototype.Statics.hasOwnProperty(m)) {
                                throw new Error('Class does not implements Interface ' + curr.Name + ' correctly, static method ' + m + ' was not found');
                            }
                        }
                    }
                }
            }
        }

        if (params.Extends) {

            classify = classify || params.Extends.prototype.initialize;

            classify.Super = params.Extends.prototype;
            classify.prototype = clone(classify.Super);

            extend(params, classify.prototype);
            delete classify.prototype.Extends;
        } else {
            classify = classify || function () {};
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

    return Classify;
});
