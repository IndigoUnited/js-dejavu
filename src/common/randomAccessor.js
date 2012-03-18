//>>includeStart('strict', pragmas.strict);
/*jslint sloppy:true*/
/*global define,console*/

define(function () {

    var random = new Date().getTime() + '_' + Math.floor((Math.random() * 100000000 + 1)),
        nrAccesses = 0;

    function randomAccessor() {

        if (nrAccesses > 5) {
            throw new Error('Can\'t access random identifier.');
        }

        nrAccesses++;
        return random;
    }

    return randomAccessor;
});
//>>includeEnd('strict');
