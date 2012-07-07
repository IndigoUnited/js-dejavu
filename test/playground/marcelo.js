/*jslint browser:true, devel:true, nomen:true*/
/*global define*/

/**
 * Module/Class description.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define(['dejavu/Class', './base'], function (Class, Base) {

    "use strict";

    var SomeModule = {
        $extends: Base,

        run: function () {
            this._test = 2;
            console.log("marcelo run", this._test);
            this.$super();
        }
    };

    return new Class(SomeModule);
});