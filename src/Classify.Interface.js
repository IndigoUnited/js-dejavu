/*jslint sloppy: true*/
/*global define*/

define(function () {

    function Interface(methods) {

        if (!methods.Name) {
            methods.Name = 'Unnamed';
        }

        function extend(target, source) {
            var k;
            for (k in source) {
                if (source.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }

        function InterfaceConstructor() {
            extend(this, methods);
        }

        if (methods.Extends) {
            Interface.prototype = methods.Extends;
        }

        return new InterfaceConstructor();
    }

    return Interface;
});