define(['amd-utils/lang/isFunction'], function (isFunction) {

    'use strict';

    /**
     * Simple function to print warning in the console only if the console is available.
     *
     * @param {String} message The message to print
     */
    function printWarning(message) {
        if (typeof console !== 'undefined' && isFunction(console.warn)) {
            console.warn(message);
        }

    }

    return printWarning;
});
