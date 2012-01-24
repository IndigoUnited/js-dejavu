/*jslint sloppy:true nomen: true*/
/*global require,describe,it,beforeEach,__dirname*/

var requirejs = require('../vendor/r.js/dist/r.js'),
    expect = require('../vendor/chai').expect;

requirejs.config({
    baseUrl: __dirname,
    paths: {
        'Trinity/Classify': '../dist/Classify'
    },
    nodeRequire: require
});

requirejs(['Trinity/Classify'], function (Classify) {

    describe('Simple instanciation of Example class', function () {

        var Example = Classify({
            Binds: ['method1'],
            some: 'property',
            initialize: function () {
                this.someOther = 'property';
            },
            method1: function () {},
            method2: function () {},
            Statics: {
                staticMethod: function () {},
                staticSome: 'property'
            }
        }),
            example = new Example();

        it('should return an instance of Example', function () {
            expect(example).to.be['instanceof'](Example);
            expect(example).to.be.a('object');
        });

        it('should have 2 methods', function () {
            expect(example.method1).to.be.a('function');
            expect(example).to.not.have.ownProperty('method1');
            expect(example.method2).to.be.a('function');
            expect(example).to.not.have.ownProperty('method2');
        });

        it('should have 1 property', function () {
            expect(example.some).to.be.equal('property');
            expect(example).to.not.have.ownProperty('some');
        });

        it('should have 2 static methods', function () {
            expect(Example.staticMethod).to.be.a('function');
            expect(Example.staticSome).to.be.equal('property');
        });

        it('should have run the initialize method', function () {
            expect(example.someOther).to.be.equal('property');
        });

        it('should not have Binds property', function () {
            expect(example.Binds).to.be.not.ok;
        });

        it('should not have Statics property', function () {
            expect(example.Statics).to.be.not.ok;
        });
    });

    describe('Simple inheritance of Cat -> Pet)', function () {

        var Pet = Classify({
            _name: 'Pet',
            _position: 0,
            initialize: function () {
                Pet._nrPets += 1;
            },
            walk: function () {
                this._position += 1;
            },
            getName: function () {
                return this._name;
            },
            getPosition: function () {
                return this._position;
            },
            Statics: {
                _nrPets: 0,
                getNrPets: function () {
                    return this._nrPets;
                }
            }
        }),

            Cat = Classify({
                Extends: Pet,
                initialize: function () {
                    this._name = 'Cat';
                    Cat.Super.initialize.call(this);
                },
                walk: function () {
                    this._position += 1;
                    Cat.Super.walk.call(this);
                }
            }),
            pet = new Pet(),
            cat = new Cat();

        pet.walk();
        cat.walk();

        it('should be an instance of Pet', function () {
            expect(pet).to.be['instanceof'](Pet);
            expect(cat).to.be['instanceof'](Pet);
            expect(cat).to.be['instanceof'](Cat);
        });

        it('should exist 2 pets', function () {
            expect(Pet.getNrPets()).to.be.equal(2);
        });

        it('should be at the right position', function () {
            expect(pet.getPosition()).to.be.equal(1);
            expect(cat.getPosition()).to.be.equal(2);
        });

        it('should have the right name', function () {
            expect(pet.getName()).to.be.equal('Pet');
            expect(cat.getName()).to.be.equal('Cat');
        });
    });

    describe('Simple interface usage', function () {

        var SomeInterface = Classify.Interface({        // Simple interface
            someMethod: function () {},
            otherMethod: function () {},
            Statics: {
                staticMethod: function () {}
            }
        }),
            OtherInterface = Classify.Interface({       // Other interface with different methods
                extraMethod: function () {},
                Statics: {
                    extraStaticMethod: function () {}
                }
            }),
            ExtendInterface = Classify.Interface({      // Interface that extends another
                Extends: SomeInterface,
                extraMethod: function () {},
                Statics: {
                    extraStaticMethod: function () {}
                }
            }),
            RepeatedInterface = Classify.Interface({    // Interface that repeats other ones methods
                someMethod: function () {},
                Statics: {
                    staticMethod: function () {}
                }
            });

        it('should not have the Implements property', function () {

            var SomeImplementation = Classify({
                Implements: SomeInterface,
                someMethod: function () {},
                otherMethod: function () {},
                Statics: {
                    staticMethod: function () {}
                }
            }),
                someImplementation = new SomeImplementation();

            expect(someImplementation.Implements).to.be.not.ok;
        });

        it('should throw an exception', function () {

            expect(Classify({
                Implements: SomeInterface
            })).to["throw"](Error);

            expect(Classify({
                Implements: SomeInterface,
                someMethod: function () {},
                otherMethod: function () {}
            })).to["throw"](Error);
        });
    });
});
