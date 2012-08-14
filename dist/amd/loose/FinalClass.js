define([
    './Class'
], function FinalClassWrapper(
    Class
) {

    'use strict';

    return function FinalClass(params) {

        var def = new Class(params);

        return def;
    };
});
