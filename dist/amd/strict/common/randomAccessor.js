/*global define,console*/

define(function () {

    "use strict";

    var random = new Date().getTime() + '_' + Math.floor((Math.random() * 100000000 + 1)),
        nrAccesses = 0;

    function randomAccessor() {

        if (nrAccesses > 5) {
            throw new Error('Can\'t access random identifier.');
        }

        nrAccesses += 1;

        return random;
    }

    return randomAccessor;
});
