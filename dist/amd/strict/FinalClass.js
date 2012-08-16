/*jshint laxcomma:true*/

define([
    './Class'
    , './common/randomAccessor'
    , './common/checkObjectPrototype'
], function FinalClassWrapper(
    Class
    , randomAccessor
    , checkObjectPrototype
) {

    'use strict';

    /*jshint newcap:false*/

    checkObjectPrototype();

    var random = randomAccessor('FinalClassWrapper'),
        $class = '$class_' + random;

    function FinalClass(params) {

        var def = Class(params);
        def[$class].finalClass = true;

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
