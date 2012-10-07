/*jslint browser:true, devel:true, nomen:true*/
/*globals define*/

/**
 * EventsEmitter abstract class.
 *
 * This class is declared as abstract because it does not work on its own.
 * Instead it should be mixed in to provide pub/sub mechanism to any class.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define([
    'amd/strict/AbstractClass',
    'amd/strict/Interface',
    'amd-utils/lang/toArray'
], function (AbstractClass, Interface, toArray) {

    'use strict';

    var SubscriberInterface = Interface.declare({
        addListener: function () {},
        removeListener: function () {}
    }),
        Dummy = AbstractClass.declare({
            $implements: SubscriberInterface
        }),
        EventsEmitter = AbstractClass.declare({
            $extends: Dummy,

            addListener: function (name, fn, context) {},
            removeListener: function (name, fn) {}
        }),
        DirectEventsEmitter = AbstractClass.declare({
            $implements: SubscriberInterface,

            addListener: function (name, fn, context) {},
            removeListener: function (name, fn) {}
        });

    return {
        EventsEmitter: EventsEmitter,
        DirectEventsEmitter: DirectEventsEmitter
    };
});
