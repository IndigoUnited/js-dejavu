/*jslint sloppy: true, nomen: true*/
/*global define*/

define(['Trinity/Classify', 'Utils/Object/mixIn', 'require'], function (Classify, mixIn, require) {

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
                    // TODO: We are using eval here.. I couldn't make this work with new Function
                    //       Think of a better way to curry the params of getInstance to the constructor
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
