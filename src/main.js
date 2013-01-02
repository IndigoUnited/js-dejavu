define([
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    './instanceOf',
    './inspect',
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
    dejavu.inspect = inspect;
    dejavu.options = options;

//>>includeStart('strict', pragmas.strict);
    dejavu.mode = 'strict';
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    dejavu.mode = 'loose';
//>>excludeEnd('strict');

    return dejavu;
});
