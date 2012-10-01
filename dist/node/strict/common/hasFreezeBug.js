if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['amd-utils/lang/isFunction'], function (isFunction) {

    'use strict';

    /**
     * Checks if the browser has Object.freeze bug.
     *
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=744494
     *
     * @return {Boolean} True if it has, false otherwise
     */
    function checkHasFreezeBug() {
        if (!isFunction(Object.freeze)) {
            return false;
        }

        // Create a constructor
        var A = function () {},
            a;

        A.prototype.foo = '';
        Object.freeze(A.prototype);   // Freeze prototype

        // Create an instance
        a = new A();

        try {
            a.foo = 'baz';            // Throws a['foo'] is read only
            if (a.foo !== 'baz') {    // Or fails silently in at least IE9
                return true;
            }
        } catch (e) {
            return true;
        }

        return false;
    }

    return checkHasFreezeBug();
});
