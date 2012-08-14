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

//>>includeStart('strict', pragmas.strict);
    checkObjectPrototype();

    var random = randomAccessor('FinalClassWrapper'),
        $class = '$class_' + random;

//>>includeEnd('strict');
    return function FinalClass(params) {

        var def = new Class(params);
//>>includeStart('strict', pragmas.strict);
        def[$class].finalClass = true;
//>>includeEnd('strict');

        return def;
    };
});
