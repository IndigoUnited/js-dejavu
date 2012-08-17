/**
 * Module/Class description.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define(['./marcelo'], function (Marcelo) {

    'use strict';

    return Marcelo.extend(function ($super) {
        return {
            _test: 2,

            initialize: function () {
                this._test = 10;
            },

            run: function () {
                console.log("andre run", this._test);
                $super.run.call(this);
            }
        };
    });
});