/*global define*/

define(['Utils/lang/isFunction'], function (isFunction) {

    "use strict";

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
