/*global define,module,exports,window,global*/

define([
//>>includeStart('strict', pragmas.strict);
    'amd-utils/lang/isFunction',
//>>includeEnd('strict');
    './Class',
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
    "use strict";

//>>includeEnd('strict');
    var Classify = {},
        target;

    Classify.Class = Class;
    Classify.AbstractClass = AbstractClass;
    Classify.Interface = Interface;
    Classify.FinalClass = FinalClass;
    Classify.instanceOf = instanceOf;

    if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports) {
        module.exports = Classify;
    } else {
        target = (typeof window !== 'undefined' && window.navigator && window.document) ? window : global;
        if (!target) {
            throw new Error('Could not grab global object.');
        }
        target.Classify = Classify;
   }

//>>includeStart('strict', pragmas.strict);
    if (isFunction(Object.freeze)) {
        Object.freeze(Classify);
    }

//>>includeEnd('strict');
});
