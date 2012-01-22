define(['Classify'], function(Classify){
    'use strict';

    Classify.Interface = function (methods) {

        if (!methods) {
            throw new Error("Classify.Interface constructor called with no arguments, but expects at least 1")
        }

        if (!methods.Name) {
            throw new Error("Classify.Interface expects property Name in arguments");
        }

        if (methods.Name && typeof methods.Name !== "string") {
            throw new Error("Classify.Interface's property 'Name' must be a String")
        }

        function extend(target, source) {
            var k;
            for (k in source) {
                if (source.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }

        function Interface () {
            extend(this, methods);
        }

        if (methods.Extends) {
            Interface.prototype = methods.Extends;
        }

        return new Interface();
    };

    return Classify.Interface;
});