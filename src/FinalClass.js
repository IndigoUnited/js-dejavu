//>>includeStart('strict', pragmas.strict);
/*jshint laxcomma:true*/

//>>includeEnd('strict');
define([
    './Class'
//>>includeStart('strict', pragmas.strict);
    , './common/randomAccessor'
    , './common/checkObjectPrototype'
//>>includeEnd('strict');
], function FinalClassWrapper(
    Class
//>>includeStart('strict', pragmas.strict);
    , randomAccessor
    , checkObjectPrototype
//>>includeEnd('strict');
) {

    'use strict';

    /*jshint newcap:false*/

//>>includeStart('strict', pragmas.strict);
    checkObjectPrototype();

    var random = randomAccessor('FinalClassWrapper'),
        $class = '$class_' + random;

//>>includeEnd('strict');
    function FinalClass(params) {

        var def = Class(params);
//>>includeStart('strict', pragmas.strict);
        def[$class].finalClass = true;
//>>includeEnd('strict');

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
