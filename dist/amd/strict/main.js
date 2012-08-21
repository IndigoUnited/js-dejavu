/*global global,module*/

define([
    'amd-utils/lang/isFunction',
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    './instanceOf'
], function (
    isFunction,
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

    if (isFunction(Object.freeze)) {
        Object.freeze(dejavu);
    }

    return dejavu;
});
