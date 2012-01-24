var requirejs = require('requirejs'),
    assert = require('assert');

requirejs.config({
    baseUrl: __dirname,
    paths : {
        "Trinity/Classify": "../dist/Classify"
    },
    nodeRequire: require
});

requirejs(['Trinity/Classify'], function (Classify) {
    //foo and bar are loaded according to requirejs
    //config, but if not found, then node's require
    //is used to load the module.

    describe('Array', function(){
      describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert([0,1,2].indexOf(1), 1, "should return 1");
            assert([0,1,2].indexOf(5), 2, "should return -1");
        });
      })
    });

});