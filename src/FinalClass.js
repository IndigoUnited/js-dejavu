/*jslint sloppy:true,newcap:true*/
/*global define*/

define([
//>>includeStart('strict', pragmas.strict);
    './Class',
    './common/randomAccessor',
    './common/checkObjectPrototype'
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    './Class'
//>>excludeEnd('strict');
], function FinalClassWrapper(
//>>includeStart('strict', pragmas.strict);
    Class,
    randomAccessor,
    checkObjectPrototype
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    Class
//>>excludeEnd('strict');
) {
//>>includeStart('strict', pragmas.strict);
    checkObjectPrototype();

    var random = randomAccessor(),
        $class = '$class_' + random;
//>>includeEnd('strict');

    return function FinalClass(params) {

        var def = Class(params);
//>>includeStart('strict', pragmas.strict);
        def[$class].finalClass = true;
//>>includeEnd('strict');

        return def;
    };
});
