/**
 * Module/Class description.
 */
define(['dejavu'], function (dejavu) {

    'use strict';

    return dejavu.Class.declare({
        __a: 4,

        run: function () {
            console.log('base run', this.__a);
        }
    });
});