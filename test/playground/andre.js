/**
 * Module/Class description.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define(['dejavu/Class', './marcelo'], function (Class, Marcelo) {

    'use strict';

    var SomeModule = {
        $extends: Marcelo,
        _test: 2,

        initialize: function () {
            this._test = 10;
        },

        run: function () {
            console.log("andre run", this._test);
            this.$super();
        }
    };

    return new Class(SomeModule);
});