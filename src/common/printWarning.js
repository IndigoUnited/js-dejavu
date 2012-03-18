//>>includeStart('strict', pragmas.strict);
/*global define,console*/

define(['Utils/lang/isFunction'], function (isFunction) {

    "use strict";

    function printWarning(message) {

        if (typeof console !== 'undefined' && isFunction(console.warn)) {
            console.warn(message);
        }

    }

    return printWarning;
});
//>>includeEnd('strict');
