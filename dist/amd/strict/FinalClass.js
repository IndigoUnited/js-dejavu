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

    return function FinalClass(params) {

        var def = Class(params);
        def[$class].finalClass = true;

        return def;
    };
});
