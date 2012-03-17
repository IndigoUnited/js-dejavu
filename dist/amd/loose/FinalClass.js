/*jslint sloppy:true,newcap:true*/
/*global define*/

define([
    './Class'
], function FinalClassWrapper(
    Class
) {

    return function FinalClass(params) {

        var def = Class(params);

        return def;
    };
});
