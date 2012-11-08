if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

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

    var dejavu = {};

    dejavu.Class = Class;
    dejavu.AbstractClass = AbstractClass;
    dejavu.Interface = Interface;
    dejavu.FinalClass = FinalClass;
    dejavu.instanceOf = instanceOf;
    dejavu.options = options;

    dejavu.mode = 'strict';

    return dejavu;
});
