/**
 *
 * Blueprint - Sugar syntax for Prototypal Inheritance
 *
 * @author Luis Couto
 * @contact lcouto87@gmail.com
 * @version 0.2
 *
 * @license
 *     Copyright (c) 2012 André Cruz, Luís Couto, Marcelo Conceição
 *
 *     Permission is hereby granted, free of charge, to any person obtaining a copy
 *     of this software and associated documentation files (the "Software"), to deal
 *     in the Software without restriction, including without limitation the rights
 *     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *     copies of the Software, and to permit persons to whom the Software is furnished
 *     to do so, subject to the following conditions:
 *
 *     The above copyright notice and this permission notice shall be included in all
 *     copies or substantial portions of the Software.
 *
 *     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *     THE SOFTWARE.
 *
 * @copyright 2012 André Cruz, Luís Couto, Marcelo Conceição
 *
 * @example
 *      var Example = Classify({
 *          Extends : ParentBlueprint,
 *          Borrows : [Mixin1, Mixin2],
 *          Binds   : ['method1', 'method2'],
 *          Statics : {
 *              staticMethod1 : function(){},
 *              staticMethod2 : function(){},
 *              staticMethod3 : function(){},
 *          },
 *          initialize : function () {},
 *          method1 : function () {},
 *          method2 : function () {},
 *          method3 : function () {}
 *      });
 * @param {Object} methods Object
 * @returns Function
 */

define('Classify', function (){

    function Classify(methods) {
        'use strict';

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

            var i = arr.length - 1,
                constructorBck;

            for (i; i >= 0; i -= 1) {
                if (arr[i].prototype && arr[i].prototype.constructor) {
                    constructorBck = arr[i].prototype.constructor;
                    delete arr[i].prototype.constructor;
                    extend(arr[i].prototype, target.prototype);
                    arr[i].prototype.constructor = constructorBck;
                } else {
                    extend(arr[i].prototype || arr[i], target.prototype);
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

            }, i = arr.length - 1;

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



        function interfaces(arr, target){
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

    Classify.Singleton = require('Classify.Singleton');
    Classify.Interface = require('Classify.Interface');
    Classify.Abstract = require('Classify.Abstract');

    return Classify;
});