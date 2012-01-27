/*jslint sloppy: true nomen: true evil: true, newcap:true*/
/*global define*/

define([
    'Trinity/Classify',
    // <checks>
    'Utils/Lang/isFunction',
    'Utils/Lang/isObject',
    // </checks>
    'require'
], function (
    Classify,
    // <checks>
    isFunction,
    isObject,
    // </checks>
    require
) {

    function Abstract(params) {

        // <checks>
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        var abstracts = params.Abstracts || {},
            hasMethods = false,
            key;

        for (key in abstracts) {
            if (abstracts.hasOwnProperty(key) && isFunction(abstracts[key])) {
                hasMethods = true;
                break;
            }
        }

        if (!hasMethods) {
            throw new Error('Abstract classes expect at least one abstract method.');
        }
        // </checks>

        /*jslint vars: true*/
        var originalInitialize = params.initialize;
        /*jstlint vars: false*/

        // Override the constructor
        function initialize() {

            if (initialize.caller !== this.$constructor) {
                throw new Error('An abstract class cannot be instantiated.');
            }

            originalInitialize.apply(this, arguments);
        }
        params.initialize = initialize;
    }

    // We need to return a closure in order to solve the requirejs circular dependency
    return function (params) {
        Classify = require('Trinity/Classify');
        params.$abstract = true;
        Abstract(params);
        var def = Classify(params);
        return def;
    };
});