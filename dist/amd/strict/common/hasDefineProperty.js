/*jslint sloppy:true*/
/*global define*/

define(['Utils/lang/isFunction'], function (isFunction) {

    var hasDefineProperty = (function () {

        if (!isFunction(Object.defineProperty)) {
            return false;
        }

        // Avoid IE8 bug
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            return false;
        }

        return true;
    }());

    return hasDefineProperty;
});
