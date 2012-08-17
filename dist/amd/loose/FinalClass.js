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
     * Function to create a final class.
     * This function can be called with various formats.
     *
     * @param {Function|Object} arg1 A class to extend or an object/function to obtain the members
     * @param {Function|Object} arg2 Object/function to obtain the members
     *
     * @return {Function} The constructor
     */
    FinalClass.create = function (arg1, arg2) {
        return Class.create.call(createFinalClass, arg1, arg2);
    };

    return FinalClass;
});
