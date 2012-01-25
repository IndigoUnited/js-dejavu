/*jslint sloppy: true, nomen: true*/
/*global define*/

define(['Trinity/Classify', 'Utils/Object/mixIn', 'require'], function (Classify, mixIn, require) {

    function Singleton(params) {

        var originalInitialize = params.initialize,
            ClassDef;

        // TODO: classify should be a dependency

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

            __instance: null,    // Privar variable that holds the instance

            /**
             * Returns the instance.
             * You can pass any arbitrary arguments.
             * Those will be passed to the constructor if the instance is not yet created.
             * 
             * @return {Object} The instance
             */
            getInstance: function () {

                if (this.__instance === null) {
                    this.prototype.$initializing = true;
                    this.__instance = new this;
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
        var Classify = require('Trinity/Classify');
        Singleton(params);
        ClassDef = Classify(params);
        return ClassDef;
    }
});
