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
            return expect(example.Binds).to.be.not.ok;
        });

        it('should not have Statics property', function () {
            return expect(example.Statics).to.be.not.ok;
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

    describe('Simple inheritance without constructor', function () {

        var Person = Classify({
            initialize: function () {
                this._status = 'alive';
            }
        }),
            Andre = Classify({
                Extends: Person,
                _name: 'André'
            });

        it('should invoke the parent constructor automatically', function () {
            var andre = new Andre();

            expect(andre._status).to.be.equal('alive');
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
                Statics: {
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

            return expect(someImplementation.Implements).to.be.not.ok;
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
                    Implements: [SomeInterface, OtherInterface],
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

    describe('Singleton usage', function () {

        var Singleton = Classify.Singleton({
            initialize: function (property) {
                this._some = property || 'property';
            },
            Statics: {
                someMethod: function () {}
            }
        }),
            ComplexSingleton = Classify.Singleton({
                Extends: Singleton,
                initialize: function (property) {
                    this._someOther = 'property';
                    ComplexSingleton.Super.initialize.call(this, property);
                }
            }),
            InheritFromSingleton = Classify({
                Extends: Singleton,
                initialize: function (property) {
                    this._someOther = 'property';
                    InheritFromSingleton.Super.initialize.call(this, property);
                }
            });

        it('should throw error invoking the constructor.', function () {
            expect(function () { return new Singleton(); }).to['throw'](Error);
        });

        it('should merge static methods', function () {
            expect(Singleton.someMethod).to.be.a('function');
        });

        it('should have getInstance() and unsetInstance() static methods', function () {
            expect(Singleton.getInstance).to.be.a('function');
            expect(Singleton.unsetInstance).to.be.a('function');
        });

        it('should return a valid instance of the class and always the same', function () {
            var instance1 = Singleton.getInstance(),
                instance2 = Singleton.getInstance();
            expect(instance1).to.be['instanceof'](Singleton);
            expect(instance2).to.be['instanceof'](Singleton);
            expect(instance1).to.be.equal(instance2);
            expect(instance1._some).to.be.equal('property');
        });

        it('should erase the instance when unsetInstance() is called', function () {
            var instance1 = Singleton.getInstance(),
                instance2;
            Singleton.unsetInstance();
            (function () { return expect(Singleton.__instance).to.be.not.ok; }());
            instance2 = Singleton.getInstance();
            expect(instance2).to.be['instanceof'](Singleton);
            expect(instance1).to.be.not.equal(instance2);
        });

        it('should pass the arguments of getInstance() to the initialize()', function () {
            Singleton.unsetInstance();
            var instance = Singleton.getInstance('test');
            expect(instance._some).to.be.equal('test');
        });

        it('should work well with inheritance', function () {
            ComplexSingleton.unsetInstance();
            Singleton.unsetInstance();
            var instance = ComplexSingleton.getInstance('test');
            expect(instance).to.be['instanceof'](ComplexSingleton);
            expect(instance._some).to.be.equal('test');
            expect(instance._someOther).to.be.equal('property');
            instance = Singleton.getInstance('test');
            expect(instance).to.be['instanceof'](Singleton);
            ComplexSingleton.unsetInstance();
            Singleton.unsetInstance();
            instance = Singleton.getInstance('test');
            expect(instance).to.be['instanceof'](Singleton);
            instance = ComplexSingleton.getInstance('test');
            expect(instance).to.be['instanceof'](ComplexSingleton);
            instance = new InheritFromSingleton('test');
            expect(instance._some).to.be.equal('test');
            expect(instance._someOther).to.be.equal('property');
        });
    });
});
