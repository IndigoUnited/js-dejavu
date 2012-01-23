
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
            throw new Error("Classify.Interface expects property Name in arguments");
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
define('Classify.Singleton',[],function () {

    function Singleton (methods) {};
    return Singleton;

});

/*jslint sloppy: true */
/*global define */

/**
 * Classify - Sugar syntax for Prototypal Inheritance
 *
 * @author Luís Couto
 * @contact lcouto87@gmail.com
 * @version 1.0.0
 *
 * @example
 *      var Example = Classify({
 *          Implements : [oneInterface, twoInterface],
 *          Extends: ParentClassify,
 *          Borrows: [Mixin1, Mixin2],
 *          Binds: ['method1', 'method2'],
 *          Statics: {
 *              staticMethod1: function(){},
 *              staticMethod2: function(){},
 *              staticMethod3: function(){},
 *          },
 *          initialize: function () {},
 *          method1: function () {},
 *          method2: function () {},
 *          method3: function () {}
 *      });
 *
 * @param {Object} methods Object
 * @returns Function
 */

define("Trinity/Classify", ["Classify.Abstract", "Classify.Interface", "Classify.Singleton"], function (Abstract, Singleton, Interface) {

    function Classify(methods) {

        var classify;



        /**
         * Extends an object with another given object
         *
         * @private
         *
         * @param {Object} target Object's that will get the new methods
         * @returns undefined
         */

        function extend(methods, target) {
            var k;
            for (k in methods) {
                if (methods.hasOwnProperty(k)) {
                    target[k] = methods[k];
                }
            }
        }



        /**
         * For an Array of Objects, add their methods/properties to
         * target's prototype
         *
         * @private
         * @param {Array} arr Array of objects that will give their methods
         * @param {Object} Target that will receive the methods
         * @returns undefined
         */

        function borrows(arr, target) {

            var i = 0,
                len = arr.length,
                constructorBck,
                current;

            for (i; i < len; i += 1) {
                current = arr[i];
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
         * Fixes the context in given methods
         *
         * @private
         * @param {Function}
         * @returns function handler with fixed context
         */

        function binds(arr, context, target) {
            var proxy = function (func) {

                if (Function.prototype.bind) {
                    return func.bind(context);
                }

                return function () {
                    return func.apply(context, arguments);
                };

            },
                i = arr.length - 1;

            for (i; i >= 0; i -= 1) {
                target[arr[i]] = proxy(target[arr[i]], classify);
            }
        }



        /**
         * Copies the given object into a freshly
         * created empty function's prototype
         *
         * @private
         * @param {Object} o Object
         * @returns {Function} Instance
         * @type Function
         */

        function clone(o) {
            function F() {}
            F.prototype = o;
            return new F();
        }



        function interfaces(arr, target) {
            var i = arr.length - 1,
                k;

            for (i; i >= 0; i -= 1) {
                for (k in arr[i]) {
                    if (!(target.hasOwnProperty(k)) && (k !== "Extends" || k !== "Name")) {
                        throw new Error("Class does not implements Interface " + arr[i].Name + "correctly");
                    }
                }
            }
        }


        classify = methods.initialize || function classify() {};

        if (methods.Extends) {
            classify.Parent = methods.Extends.prototype;
            classify.prototype = clone(classify.Parent);
            extend(methods, classify.prototype);
        } else {
            classify.prototype = methods;
        }

        classify.prototype.constructor = classify;

        if (methods.Borrows) {
            borrows(methods.Borrows, classify);
        }

        if (methods.Binds) {
            binds(methods.Binds, classify, classify.prototype);
        }

        if (methods.Statics) {
            extend(methods.Statics, classify);
            delete classify.prototype.Static;
        }

        if (methods.Implements) {
            interfaces(methods.Implements, this);
        }



        return classify;

    }


    Classify.Abstract = Abstract;
    Classify.Interface = Interface;
    Classify.Singleton = Singleton;

    return Classify;
});
