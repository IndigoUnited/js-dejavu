/*jslint sloppy:true*/
/*global define,module,exports,window,global*/

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
        target;

    Classify.Class = Class;
    Classify.AbstractClass = AbstractClass;
    Classify.Interface = Interface;
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
});
