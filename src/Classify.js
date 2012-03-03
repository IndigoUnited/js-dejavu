define([
    './Class',
    './AbstractClass',
    './Interface',
    'instanceOf'
], function (
    Class,
    AbstractClass,
    Interface,
    instanceOf
) {
    var Classify = {},
        target = (typeof window !== 'undefined' && window.navigator && window.document) ? window : global;

    Classify.Class = Class;
    Classify.AbstractClass = AbstractClass;
    Classify.Interface = Interface;
    Classify.instanceOf = instanceOf;

    target.Classify = Classify;
});