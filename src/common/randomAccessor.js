//>>includeStart('strict', pragmas.strict);
/*jslint sloppy:true*/
/*global define,console*/

define(['Utils/array/contains'], function (contains) {

    var random = new Date().getTime() + '_' + Math.floor((Math.random() * 100000000 + 1)),
        nrAccesses = 0;

    function randomAccessor() {

        var caller = randomAccessor.caller || arguments.callee.caller || arguments.caller,
            allowed = ['ClassWrapper', 'InterfaceWrapper', 'AbstractClassWrapper', 'isntanceOfWrapper'];

        if ((caller.name && !contains(allowed, caller.name)) || nrAccesses > 4) {
            throw new Error('Can\'t access random identifier.');
        } {
            nrAccesses++;
            return random;
        }
    }

    return randomAccessor;
});
//>>includeEnd('strict');
