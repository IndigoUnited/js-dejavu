if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

/*jshint regexp:false*/

define([], function () {

    'use strict';

    /**
     * Check if a function has no body.
     *
     * @param {Function} func The function
     *
     * @return {Boolean} True if it's empty, false otherwise
     */
    function isFunctionEmpty(func) {
        return (/^function\s*\([^\(]*\)\s*\{\s*(["']use strict["'];)?\s*\}$/m).test(func.toString());
    }

    return isFunctionEmpty;
});
