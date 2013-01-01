define([
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    './instanceOf',
//>>includeStart('strict', pragmas.strict);
    './inspect',
//>>includeEnd('strict');
    './options'
], function (
    Class,
    AbstractClass,
    Interface,
    FinalClass,
    instanceOf,
    inspect,
    options
) {

    'use strict';

    var dejavu = {};

    dejavu.Class = Class;
    dejavu.AbstractClass = AbstractClass;
    dejavu.Interface = Interface;
    dejavu.FinalClass = FinalClass;
    dejavu.instanceOf = instanceOf;
//>>includeStart('strict', pragmas.strict);
    dejavu.inspect = inspect;
//>>includeEnd('strict');
    dejavu.options = options;

//>>includeStart('strict', pragmas.strict);
    dejavu.mode = 'strict';
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    dejavu.mode = 'loose';
//>>excludeEnd('strict');
//>>includeStart('regular', pragmas.regular);
    window.dejavu = dejavu;
//>>includeEnd('regular');
});
