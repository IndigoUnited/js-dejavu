/*jslint sloppy:true,newcap:true*/
/*global define*/

define([
    './Class',
    './common/randomAccessor',
    './common/checkObjectPrototype'
], function FinalClassWrapper(
    Class,
    randomAccessor,
    checkObjectPrototype
) {
    checkObjectPrototype();

    var random = randomAccessor(),
        $class = '$class_' + random;

    return function FinalClass(params) {

        var def = Class(params);
        def[$class].finalClass = true;

        return def;
    };
});
