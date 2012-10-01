if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    './instanceOf'
], function (
    Class,
    AbstractClass,
    Interface,
    FinalClass,
    instanceOf
) {

    'use strict';

    var dejavu = {};

    dejavu.Class = Class;
    dejavu.AbstractClass = AbstractClass;
    dejavu.Interface = Interface;
    dejavu.FinalClass = FinalClass;
    dejavu.instanceOf = instanceOf;

    dejavu.mode = 'loose';

    return dejavu;
});
