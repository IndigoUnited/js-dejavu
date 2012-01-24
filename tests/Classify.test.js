var requirejs = require('requirejs'),
    should = require('chai').should(),
    expect = require('chai').expect;

requirejs.config({
    baseUrl: __dirname,
    paths: {
        "Trinity/Classify": "../dist/Classify"
    },
    nodeRequire: require
});

requirejs(['Trinity/Classify'], function(Classify) {
    var Example = Classify({
        method1: function() {},
        method2: function() {}
    }),
        example = new Example();

    describe('Classify instanciation', function() {

        it('should return an instance of', function() {
            // Pick one of the syntaxes
            // More info => http://chaijs.com/

            expect(example).to.be.instanceof(Example);
            example.should.be.instanceof(Example);
        });

        it('should return an object', function() {
            // Pick one of the syntaxes
            // More info => http://chaijs.com/

            expect(example).to.be.a('object');
            example.should.be.a('object');
        });

    });

});
