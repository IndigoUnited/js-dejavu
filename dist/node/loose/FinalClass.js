if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Class'
], function FinalClassWrapper(
    Class
) {

    'use strict';

    var FinalClass = {};

    /**
     * Create a final class definition.
     *
     * @param {Object}      params        An object containing methods and properties
     * @param {Constructor} [constructor] Assume the passed constructor
     *
     * @return {Function} The constructor
     */
    function createFinalClass(params, constructor) {
        var def = Class.$create(params, constructor);

        return def;
    }

    /**
     * Function to declare a final class.
     * This function can be called with various formats.
     *
     * @param {Function|Object} arg1 A class to extend or an object/function to obtain the members
     * @param {Function|Object} arg2 Object/function to obtain the members
     *
     * @return {Function} The constructor
     */
    FinalClass.declare = function (arg1, arg2, $arg3) {
        return Class.declare.call(createFinalClass, arg1, arg2, $arg3);
    };

    return FinalClass;
});
