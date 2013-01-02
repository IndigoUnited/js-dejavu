define([
], function (
) {

    'use strict';

    function inspect(target) {
        // TODO: Should inspect do something more?
        //       If the code is not optimized, they will see wrappers when clicking in functions
        //       they will also see some strange things like $bind and $static.
        //       But I think it does not compensate to add extra bytes to the code to support it
        return target;
    }

    inspect.rewriteConsole = function () {};

    return inspect;
});