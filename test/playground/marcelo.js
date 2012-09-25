/**
 * Module/Class description.
 */
define(['./base'], function (Base) {

    'use strict';

    return Base.extend(function ($super) {
        return {
            run: function () {
                console.log('marcelo run');
                $super.run.call(this);
            }.$bound()
        };
    });
});