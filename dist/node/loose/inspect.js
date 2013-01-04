if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
], function (
) {

    'use strict';

    var prev;

    function inspect(target) {
        // TODO: Should inspect do something more?
        //       If the code is not optimized, they will see wrappers when clicking in functions
        //       and also some strange things like $bind and $static.
        //       But I think it does not compensate the extra bytes to support it
        return target;
    }

    inspect.rewriteConsole = function () {};

    // Add inspect method to the console
    if (typeof console === 'object') {
        prev = console.inspect || console.log;
        console.inspect = function () {
            var args = [],
                length = arguments.length,
                x;

            for (x = 0; x < length; x += 1) {
                args[x] = inspect(arguments[x]);
            }

            prev.apply(console, args);
        };
    }
});