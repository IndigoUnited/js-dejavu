define([
//>>includeStart('strict', pragmas.strict);
    'amd-utils/lang/isFunction',
//>>includeEnd('strict');
    './Class',
    './AbstractClass',
    './Interface',
    './FinalClass',
    './instanceOf',
    './options'
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

    'use strict';

//>>includeStart('regular', pragmas.regular);
    var dejavu = {},
        target;
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

    if (isFunction(Object.freeze)) {
        Object.freeze(dejavu);
    }
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    dejavu.mode = 'loose';
//>>excludeEnd('strict');

    return dejavu;
});
