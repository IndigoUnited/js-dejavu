/*global global,module*/

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

    var dejavu = {};

    dejavu.Class = Class;
    dejavu.AbstractClass = AbstractClass;
    dejavu.Interface = Interface;
    dejavu.FinalClass = FinalClass;
    dejavu.instanceOf = instanceOf;

    return dejavu;
});
