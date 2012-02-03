/*jslint sloppy: true nomen: true evil: true, newcap:true*/
/*global define*/

define([
    'Utils/object/hasOwn',
    './Class',
    'require'
], function (
    hasOwn,
    Class,
    require
) {

    // We need to return a closure in order to solve the requirejs circular dependency

    /**
     * Create an abstract class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    return function (params) {

        Class = require('./Class');

        var def;

        // Handle abstract methods
        if (hasOwn(params, 'Abstracts')) {
            delete params.Abstracts;
        }

        // Create the class definition
        def = Class(params);

        return def;
    };
});