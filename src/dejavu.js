define([
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    './instanceOf',
    './options'
], function (
    Class,
    AbstractClass,
    Interface,
    FinalClass,
    instanceOf,
    options
) {

    'use strict';

//>>includeStart('regular', pragmas.regular);
    var dejavu = {},
        target = window;
//>>includeEnd('regular');
//>>excludeStart('regular', pragmas.regular);
    var dejavu = {};
//>>excludeEnd('regular');

    dejavu.Class = Class;
    dejavu.AbstractClass = AbstractClass;
    dejavu.Interface = Interface;
    dejavu.FinalClass = FinalClass;
    dejavu.instanceOf = instanceOf;
    dejavu.options = options;

//>>includeStart('strict', pragmas.strict);
    dejavu.mode = 'strict';
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    dejavu.mode = 'loose';
//>>excludeEnd('strict');
//>>includeStart('regular', pragmas.regular);
    target.dejavu = dejavu;
//>>includeEnd('regular');
});
