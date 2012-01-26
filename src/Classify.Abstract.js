/*jslint sloppy: true nomen: true evil: true, newcap:true*/
/*global define*/

define(['Trinity/Classify', 'require'], function (Classify, require) {

    function Abstract(params) {

        var originalInitialize = params.initialize;

        // Override the constructor
        function initialize() {

            if (this.$initializing) {
                originalInitialize.apply(this, arguments);
            } else {
                throw new Error("An abstract class cannot be instantiated.");
            }
        }
        params.initialize = initialize;
    }

    // We need to return a closure in order to solve the requirejs circular dependency
    return function (params) {
        Classify = require('Trinity/Classify');
        Abstract(params);
        var def = Classify(params);
        def.$abstract = true;
        return def;
    };
});