/**
 * Module/Class description.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define(['dejavu/Class', './base'], function (Class, Base) {

    'use strict';

    var SomeModule = {
        $extends: Base,

        run: function () {
            console.log('marcelo run');
            this.$super();
        }
    };

    return new Class(SomeModule);
});