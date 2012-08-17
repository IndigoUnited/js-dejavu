/**
 * Module/Class description.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define(['dejavu/Class'], function (Class) {

    'use strict';

    return Class.create({
        __a: 4,

        run: function () {
            console.log('base run', this.__a);
        }
    });
});