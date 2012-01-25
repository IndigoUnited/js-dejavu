/*jslint sloppy: true*/
/*global define*/

define(function () {

    function Interface(methods) {

        if (!methods) {
            throw new Error("Classify.Interface constructor called with no arguments, but expects at least 1");
        }

        if (!methods.Name) {
            methods.Name = "Unnamed";
        }

        if (methods.Name && typeof methods.Name !== "string") {
            throw new Error("Classify.Interface's property 'Name' must be a String");
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