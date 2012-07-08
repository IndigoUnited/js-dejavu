/*global global*/

define([
//>>includeStart('strict', pragmas.strict);
    'amd-utils/lang/isFunction',
//>>includeEnd('strict');
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    'instanceOf'
], function (
//>>includeStart('strict', pragmas.strict);
    isFunction,
//>>includeEnd('strict');
    Class,
    AbstractClass,
    Interface,
    FinalClass,
    instanceOf
) {

//>>includeStart('strict', pragmas.strict);
    'use strict';

//>>includeEnd('strict');
    var dejavu = {},
        target;

    dejavu.Class = Class;
    dejavu.AbstractClass = AbstractClass;
    dejavu.Interface = Interface;
    dejavu.FinalClass = FinalClass;
    dejavu.instanceOf = instanceOf;

    if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports) {
        module.exports = dejavu;
    } else {
        target = (typeof window !== 'undefined' && window.navigator && window.document) ? window : global;
        if (!target) {
            throw new Error('Could not grab global object.');
        }
        target.dejavu = dejavu;
    }

//>>includeStart('strict', pragmas.strict);
    if (isFunction(Object.freeze)) {
        Object.freeze(dejavu);
    }

//>>includeEnd('strict');
});
