/*jshint strict:false*/

define([
    './Class'
], function FinalClassWrapper(
    Class
) {

    return function FinalClass(params) {

        var def = new Class(params);

        return def;
    };
});
