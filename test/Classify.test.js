/*jslint sloppy:true nomen: true, newcap:true*/
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
            return expect(example.Binds).to.not.be.ok;
        });

        it('should not have Statics property', function () {
            return expect(example.Statics).to.not.be.ok;
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

        it('should not have the Extends property', function () {
            return expect(cat.Extends).to.not.be.ok;
        });

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

    describe('Simple inheritance without constructor', function () {

        var Person = Classify({
            initialize: function () {
                this._status = 'alive';
            }
        }),
            Andre = Classify({
                Extends: Person,
                _name: 'André'
            }),
            SuperAndre = Classify({
                Extends: Andre,
                _name: 'SuperAndre'
            });

        it('should invoke the parent constructor automatically', function () {
            var andre = new Andre(),
                superAndre = new SuperAndre();

            expect(andre._status).to.be.equal('alive');
            expect(superAndre._status).to.be.equal('alive');
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
            ExtendedInterface = Classify.Interface({    // Interface that extends another
                Extends: SomeInterface,
                extraMethod: function () {},
                Statics: {
                    extraStaticMethod: function () {}
                }
            }),
            RepeatedInterface = Classify.Interface({    // Interface that repeats other ones methods
                someMethod: function () {},
                someProperty: 'test',
                Statics: {
                    someStaticProperty: 'test',
                    staticMethod: function () {}
                }
            });

        it('should not have the Implements property', function () {

            var SomeImplementation = Classify({
                Implements: [SomeInterface],
                someMethod: function () {},
                otherMethod: function () {},
                Statics: {
                    staticMethod: function () {}
                }
            }),
                someImplementation = new SomeImplementation();

            return expect(someImplementation.Implements).to.not.be.ok;
        });

        it('should throw error on incomplete implementations', function () {

            expect(function () {
                return Classify({
                    Implements: [SomeInterface]
                });
            }).to['throw'](Error);

            expect(function () {
                return Classify({
                    Implements: [SomeInterface],
                    someMethod: function () {},
                    otherMethod: function () {},
                    Statics: {
                        weirdStaticMethod: function () {}
                    }
                });
            }).to['throw'](Error);

            expect(function () {
                return Classify({
                    Implements: [ExtendedInterface],
                    extraMethod: function () {},
                    Statics: {
                        extraStaticMethod: function () {}
                    }
                });
            }).to['throw'](Error);

            expect(function () {
                return Classify({
                    Implements: [ExtendedInterface],
                    someMethod: function () {},
                    otherMethod: function () {},
                    Statics: {
                        staticMethod: function () {}
                    }
                });
            }).to['throw'](Error);

            expect(function () {
                return Classify({
                    Implements: [SomeInterface, OtherInterface],
                    someMethod: function () {},
                    otherMethod: function () {},
                    Statics: {
                        staticMethod: function () {}
                    }
                });
            }).to['throw'](Error);

            expect(function () {
                return Classify({
                    Implements: [SomeInterface, OtherInterface],
                    extraMethod: function () {},
                    Statics: {
                        extraStaticMethod: function () {}
                    }
                });
            }).to['throw'](Error);
        });

        it('should not throw error on complete implementations', function () {

            expect(function () {
                return Classify({
                    Implements: [SomeInterface],
                    someMethod: function () {},
                    otherMethod: function () {},
                    Statics: {
                        staticMethod: function () {}
                    }
                });
            }).to.not['throw'](Error);

            expect(function () {
                return Classify({
                    Implements: [ExtendedInterface],
                    someMethod: function () {},
                    otherMethod: function () {},
                    extraMethod: function () {},
                    Statics: {
                        staticMethod: function () {},
                        extraStaticMethod: function () {}
                    }
                });
            }).to.not['throw'](Error);

            expect(function () {
                return Classify({
                    Implements: [SomeInterface, OtherInterface, RepeatedInterface],
                    someMethod: function () {},
                    otherMethod: function () {},
                    extraMethod: function () {},
                    Statics: {
                        staticMethod: function () {},
                        extraStaticMethod: function () {}
                    }
                });
            }).to.not['throw'](Error);
        });
    });

    describe('Abstract classes', function () {

        var AbstractExample = Classify.Abstract({
            initialize: function () {},
            Abstracts: {
                abstractMethod: function () {}
            }
        });

        it('should throw an error if no abstract methods are defined', function () {

            expect(function () {
                return Classify.Abstract({
                    initialize: function () {}
                });
            }).to["throw"](Error);

            expect(function () {
                return Classify.Abstract({
                    initialize: function () {},
                    Abstracts: {}
                });
            }).to["throw"](Error);

            expect(function () {
                return Classify.Abstract({
                    initialize: function () {},
                    Abstracts: {
                        dummy: "property"
                    }
                });
            }).to["throw"](Error);
        });

        it('should throw an error while using new or its constructor', function () {
            expect(function () { return new AbstractExample(); }).to["throw"](Error);
            expect(function () { AbstractExample.prototype.initialize(); }).to["throw"](Error);
        });

        it('should let concrete implementations invoke it\'s contructor', function () {

            expect(function () {
                return Classify({
                    Extends: AbstractExample,
                    initialize: function () {
                        AbstractExample.Super.initialize.call(this);
                    },
                    abstractMethod: function () {}
                });
            }).to.not["throw"](Error);
        });
    });

    describe('Concrete classes', function () {

        it('should throw error if they define abstract methods', function () {

            expect(function () {
                return Classify({
                    Abstracts: {}
                });
            }).to["throw"](Error);

            expect(function () {
                return Classify({
                    Abstracts: {
                        method1: function () {}
                    }
                });
            }).to["throw"](Error);
        });

        it('should not have Abstracts property while extending an abstract class', function () {

//             expect(function () {
//                return Classify({
//                    Extends: AbstractExample,
//                    Abstracts: {}
//                });
//            }).to.not["throw"](Error);
        });
    });
});
