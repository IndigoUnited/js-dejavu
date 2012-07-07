/*jslint browser:true, devel:true, nomen:true, sloppy: true*/
/*global define*/

/**
 * Module/Class description.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define(['dejavu/Class'], function (Class) {

    var SomeModule = {
        __a: 4,

        run: function () {
            console.log("base run", this.__a);
        }
    };

    return new Class(SomeModule);
});