/*global define,console*/

define(['amd-utils/lang/isFunction'], function (isFunction) {

    'use strict';

    function printWarning(message) {

        if (typeof console !== 'undefined' && isFunction(console.warn)) {
            console.warn(message);
        }

    }

    return printWarning;
});
