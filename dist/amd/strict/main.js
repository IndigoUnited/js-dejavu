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

    dejavu.mode = 'strict';

    return dejavu;
});
