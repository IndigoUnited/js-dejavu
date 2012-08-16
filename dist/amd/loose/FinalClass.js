define([
    './Class'
], function FinalClassWrapper(
    Class
) {

    'use strict';

    /*jshint newcap:false*/

    function FinalClass(params) {

        var def = Class(params);

        return def;
    }

    /**
     * Function to create an abstract class.
     * This function can be called with various formats.
     *
     * @param {Function|Object} arg1 A class to extend or an object/function to obtain the members
     * @param {Function|Object} arg2 Object/function to obtain the members
     *
     * @return {Function} The constructor
     */
    FinalClass.create = function (arg1, arg2) {
        return Class.create.call(FinalClass, arg1, arg2);
    };

    return FinalClass;
});
