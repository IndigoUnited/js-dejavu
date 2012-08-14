define([
    './Class'
], function FinalClassWrapper(
    Class
) {

    'use strict';

    /*jshint newcap:false*/

    return function FinalClass(params) {

        var def = Class(params);

        return def;
    };
});
