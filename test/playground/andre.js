/**
 * Module/Class description.
 */
define(['dejavu/Class', './marcelo'], function (Class, Marcelo) {

    'use strict';

    return Class.declare(Marcelo, function ($super) {
        return {
            _test: 2,

            initialize: function () {
                this._test = 10;
            },

            run: function () {
                console.log('andre run', this._test);
                $super.run.call(this);
            }
        };
    });
});