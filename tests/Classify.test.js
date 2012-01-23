var requirejs = require('requirejs');

requirejs.config({
    paths : {
        "Trinity/Classify": "../dist/Classify"
    },
    nodeRequire: require
});

requirejs(['Trinity/Classify'], function (Classify) {
    //foo and bar are loaded according to requirejs
    //config, but if not found, then node's require
    //is used to load the module.
    console.log(arguments);
});