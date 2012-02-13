/*jslint sloppy:true newcap:true*/
/*global global,define,describe,it*/

define(global.modules, function (Class, AbstractClass, Interface, instanceOf) {

    var expect = global.expect;

    // Uncomment the lines bellow to test a modified object prototype
    //Object.prototype.youShouldNotDoThis = function (a, b) {};
    //Object.prototype.youShouldNotDoThisAlso = 'some';

    describe('Functional:', function () {

        describe('Instantiation of a simple Class', function () {

            var Example = Class({
                Binds: ['method1', 'method2', 'method3'],
                some: 'property',
                options: {
                    option1: 'property'
                },
                someArray: ['some'],
                initialize: function () {
                    this.someOther = 'property';
                },
                method1: function () {
                    this.some = 'test';
                },
                method2: function () {
                    this.some = 'test2';
                },
                method3: function () {
                    this.some = 'test3';
                },
                test: function () {
                    this.some = 'test';
                    this.options.option1 = 'test';
                    this.someArray.push('other');
                },
                Statics: {
                    staticMethod: function () {},
                    staticSome: 'property'
                }
            }),
                example = new Example(),
                example2 = new Example();

            it('should return a valid instance', function () {

                expect(example).to.be.an(Example);
                expect(example).to.be.a('object');

            });

            it('should have 4 methods', function () {

                expect(example.method1).to.be.a('function');
                expect(example.method1).to.not.be.equal(Example.prototype.method1);    // Because it was bound
                expect(example.method2).to.be.a('function');
                expect(example.method2).to.not.be.equal(Example.prototype.method);     // Because it was bound
                expect(example.method3).to.be.a('function');
                expect(example.method3).to.not.be.equal(Example.prototype.method3);    // Because it was bound
                expect(example.test).to.be.a('function');
                expect(example.test).to.be.equal(Example.prototype.test);

            });

            it('should have 3 properties', function () {

                expect(example.some).to.be.equal('property');
                expect(example.some).to.be.equal(Example.prototype.some);
                expect(example.options).to.be.a('object');
                expect(example.options).to.not.be.equal(Example.prototype.options);       // Because it was reseted to be independent
                expect(example.someArray).to.be.an('array');
                expect(example.someArray).to.not.be.equal(Example.prototype.someArray);   // Because it was reseted to be independent

            });

            it('should have 1 static methods and 1 static property', function () {

                expect(Example.staticMethod).to.be.a('function');
                expect(Example).to.have.property('staticMethod');
                expect(Example.staticSome).to.be.equal('property');
                expect(Example).to.have.property('staticSome');

            });

            it('should have run the initialize method', function () {

                expect(example.someOther).to.be.equal('property');

            });

            it('should not have Statics property', function () {

                return expect(example.Statics).to.not.be.ok;

            });

            it('should not have Binds property', function () {

                return expect(example.Binds).to.not.be.ok;

            });

            it('should not share properties with other instances', function () {

                example2.test();

                expect(example2.some).to.be.equal('test');
                expect(example.some).to.be.equal('property');
                expect(example2.options.option1).to.be.equal('test');
                expect(example.options.option1).to.be.equal('property');
                expect(example2.someArray.length).to.be.equal(2);
                expect(example.someArray.length).to.be.equal(1);

            });

            it('should have bound the methods into the instance context specified in Binds', function () {

                example.method1.call(this);
                expect(example.some).to.be.equal('test');
                example.method2.apply(this, arguments);

                expect(example.some).to.be.equal('test2');
                example.method3();
                expect(example.some).to.be.equal('test3');
                example2.method1.call(this);
                expect(example2.some).to.be.equal('test');
                example2.method2.apply(this, arguments);
                expect(example2.some).to.be.equal('test2');
                example2.method3();
                expect(example2.some).to.be.equal('test3');

            });
        });

        describe('Instantiation of inheritance without constructor', function () {

            var Person = Class({
                initialize: function () {
                    this.status = 'alive';
                }
            }),
                Andre = Class({
                    Extends: Person,
                    name: 'André'
                }),
                SuperAndre = Class({
                    Extends: Andre,
                    name: 'SuperAndre'
                }),
                PersonAbstract = AbstractClass({
                    initialize: function () {
                        this.status = 'alive';
                    }
                }),
                AndreAbstract = AbstractClass({
                    Extends: PersonAbstract,
                    name: 'André'
                }),
                SuperAndre2 = Class({
                    Extends: AndreAbstract,
                    name: 'SuperAndre'
                });

            it('should invoke the parent constructor automatically', function () {

                var andre = new Andre(),
                    superAndre = new SuperAndre(),
                    superAndre2 = new SuperAndre2();

                expect(andre.status).to.be.equal('alive');
                expect(superAndre.status).to.be.equal('alive');
                expect(superAndre2.status).to.be.equal('alive');

            });

        });

        describe('Instantiation of inheritance Cat -> Pet', function () {

            var Pet = Class({
                name: 'Pet',
                position: 0,
                initialize: function () {
                    Pet.nrPets += 1;
                },
                walk: function () {
                    this.position += 1;
                },
                getName: function () {
                    return this.name;
                },
                getPosition: function () {
                    return this.position;
                },
                Statics: {
                    nrPets: 0,
                    getNrPets: function () {
                        return this.nrPets;
                    },
                    getMaxAge: function () {
                        return 50;
                    }
                }
            }),
                Cat = Class({
                    Extends: Pet,
                    initialize: function () {
                        this.name = 'Cat';
                        Cat.Super.initialize.call(this);
                    },
                    walk: function () {
                        this.position += 1;
                        Cat.Super.walk.call(this);
                    },
                    Statics: {
                        getMaxAge: function () {
                            return 20;
                        }
                    }
                }),
                pet = new Pet(),
                cat = new Cat();

            pet.walk();
            cat.walk();

            it('should be an instance of Pet', function () {

                expect(pet).to.be.a(Pet);
                expect(cat).to.be.a(Pet);
                expect(cat).to.be.a(Cat);

            });

            it('should not have the Extends property', function () {

                return expect(cat.Extends).to.not.be.ok;

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

            it('should have inherited the static members', function () {

                expect(Cat.getNrPets).to.be.a('function');
                return expect(Cat.nrPets).to.be.ok;

            });

            it('should not have inherited already defined static methods', function () {

                expect(Pet.getMaxAge()).to.be.equal(50);
                expect(Cat.getMaxAge()).to.be.equal(20);

            });

        });

        describe('Instantiation of Concrete Classes that implement Interfaces', function () {

            it('should not have the Implements property', function () {

                var SomeImplementation = Class({
                    Implements: [Interface({ method1: function () {}})],
                    method1: function () {}
                }),
                    someImplementation = new SomeImplementation();

                return expect(someImplementation.Implements).to.not.be.ok;
            });

        });

        describe('Instantiation of Concrete Classes that extend Abstract Classes', function () {

            it('should not have the Abstracts property', function () {

                var SomeImplementation = Class({
                    Extends: AbstractClass({ Abstracts: { method1: function () {} }}),
                    method1: function () {}
                }),
                    someImplementation = new SomeImplementation();

                return expect(someImplementation.Abstracts).to.not.be.ok;
            });

        });

        describe('Defining a Concrete/Abstract Classes that use Borrows (mixins)', function () {

            it('should grab the borrowed members to their own', function () {

                var SomeImplementation = Class({
                    Borrows: {
                        method1: function () {},
                        method2: function () {},
                        some: 'property'
                    }
                }),
                    OtherImplementation = Class({
                        Borrows: [Class({
                            method1: function () {},
                            method2: function () {},
                            some: 'property'
                        }), { method3: function () {} }]
                    }),
                    EvenOtherImplementation = Class({
                        Borrows: new Class({
                            method1: function () {},
                            method2: function () {},
                            some: 'property'
                        })
                    }),
                    someImplementation = new SomeImplementation(),
                    otherImplementation = new OtherImplementation(),
                    evenOtherImplementation = new EvenOtherImplementation();

                expect(SomeImplementation.prototype.method1).to.be.a('function');
                expect(SomeImplementation.prototype.method2).to.be.a('function');
                expect(SomeImplementation.prototype.some).to.be.equal('property');
                expect(OtherImplementation.prototype.method1).to.be.a('function');
                expect(OtherImplementation.prototype.method2).to.be.a('function');
                expect(OtherImplementation.prototype.method3).to.be.a('function');
                expect(OtherImplementation.prototype.some).to.be.equal('property');
                expect(EvenOtherImplementation.prototype.method1).to.be.a('function');
                expect(EvenOtherImplementation.prototype.method2).to.be.a('function');
                expect(EvenOtherImplementation.prototype.some).to.be.equal('property');

                expect(someImplementation.method1).to.be.a('function');
                expect(someImplementation.method2).to.be.a('function');
                expect(someImplementation.some).to.be.equal('property');
                expect(otherImplementation.method1).to.be.a('function');
                expect(otherImplementation.method2).to.be.a('function');
                expect(otherImplementation.method3).to.be.a('function');
                expect(otherImplementation.some).to.be.equal('property');
                expect(evenOtherImplementation.method1).to.be.a('function');
                expect(evenOtherImplementation.method2).to.be.a('function');
                expect(evenOtherImplementation.some).to.be.equal('property');

            });

            it('should grab the borrowed members respecting the precedence order and not replace methods', function () {

                var SomeMixin = {
                    method1: function () {},
                    Statics: {
                        staticMethod1: function () {}
                    }
                },
                    OtherMixin = Class({
                        method1: function () {},
                        Statics: {
                            staticMethod1: function () {}
                        }
                    }),
                    SomeClass = Class({
                        Borrows: [SomeMixin, OtherMixin]
                    }),
                    OtherClass = Class({
                        Borrows: [OtherMixin, SomeMixin]
                    }),
                    method1 = function () {},
                    SomeOtherClass = Class({
                        Borrows: [SomeMixin, OtherMixin],
                        method1: method1,
                        Statics: {
                            staticMethod1: method1
                        }
                    }),
                    someClass = new SomeClass(),
                    otherClass = new OtherClass(),
                    someOtherClass = new SomeOtherClass();

                expect(someClass.method1).to.be.equal(OtherMixin.prototype.method1);
                expect(SomeClass.staticMethod1).to.be.equal(OtherMixin.staticMethod1);
                expect(otherClass.method1).to.be.equal(SomeMixin.method1);
                expect(OtherClass.staticMethod1).to.be.equal(SomeMixin.Statics.staticMethod1);
                expect(someOtherClass.method1).to.be.equal(method1);
                expect(SomeOtherClass.staticMethod1).to.be.equal(method1);

            });

            it('should not grab the initialize method of any class/object', function () {

                var initialize = function () {
                    this.some = 'test';
                },
                    SomeImplementation = Class({
                        Borrows: { initialize: function () { this.some = 'nooo'; }, method1: function () {} },
                        some: 'property',
                        initialize: initialize
                    }),
                    OtherImplementation = Class({
                        Borrows: new Class({ initialize: function () { this.some = 'nooo'; } }),
                        some: 'property'
                    }),
                    someImplementation = new SomeImplementation(),
                    otherImplementation = new OtherImplementation();

                expect(someImplementation.some).to.be.equal('test');
                expect(otherImplementation.some).to.be.equal('property');

            });

            it('should have passed the specified binds correctly', function () {

                var SomeImplementation = Class({
                        Borrows: Class({
                            Binds: ['method1', 'method2'],
                            method1: function () {
                                this.some = 'test';
                            },
                            method2: function () {
                                this.some = 'test2';
                            }
                        }),
                        some: 'property'
                    }),
                    OtherImplementation = Class({
                        Binds: ['method2'],
                        Borrows: Class({
                            Binds: ['method1'],
                            method1: function () {
                                this.some = 'test';
                            }
                        }),
                        method2: function () {
                            this.some = 'test2';
                        },
                        some: 'property'
                    }),
                    SomeOtherImplementation = Class({
                        Binds: ['method1'],
                        Borrows: [Class({
                            Binds: ['method2'],
                            method2: function () {}
                        }), Class({
                            Binds: ['method2'],
                            method2: function () {}
                        })],
                        method1: function () {
                            this.some = 'test';
                        },
                        method2: function () {
                            this.some = 'test2';
                        },
                        some: 'property'
                    }),
                    AbstractUsageImplementation = Class({
                        Binds: ['method2'],
                        Extends: AbstractClass({
                            Binds: ['method1'],
                            Abstracts: {
                                method1: function () {}
                            }
                        }),
                        method1: function () {
                            this.some = 'test';
                        },
                        method2: function () {
                            this.some = 'test2';
                        },
                        some: 'property'
                    }),
                    OtherAbstractUsageImplementation = Class({
                        Extends: AbstractClass({
                            Binds: ['method1', 'method2'],
                            Abstracts: {
                                method1: function () {}
                            },
                            method2: function () {
                                this.some = 'test2';
                            }
                        }),
                        method1: function () {
                            this.some = 'test';
                        },
                        some: 'property'
                    }),
                    someImplementation = new SomeImplementation(),
                    otherImplementation = new OtherImplementation(),
                    someOtherImplementation = new SomeOtherImplementation(),
                    abstractUsageImplementation = new AbstractUsageImplementation(),
                    otherAbstractUsageImplementation = new OtherAbstractUsageImplementation();

                someImplementation.method1.call(this);
                expect(someImplementation.some).to.be.equal('test');
                someImplementation.method2.call(this);
                expect(someImplementation.some).to.be.equal('test2');
                someImplementation.method1();
                expect(someImplementation.some).to.be.equal('test');
                someImplementation.method2();
                expect(someImplementation.some).to.be.equal('test2');

                otherImplementation.method1.call(this);
                expect(otherImplementation.some).to.be.equal('test');
                otherImplementation.method2.call(this);
                expect(otherImplementation.some).to.be.equal('test2');
                otherImplementation.method1();
                expect(otherImplementation.some).to.be.equal('test');
                otherImplementation.method2();
                expect(otherImplementation.some).to.be.equal('test2');

                someOtherImplementation.method1.call(this);
                expect(someOtherImplementation.some).to.be.equal('test');
                someOtherImplementation.method2.call(this);
                expect(someOtherImplementation.some).to.be.equal('test2');
                someOtherImplementation.method1();
                expect(someOtherImplementation.some).to.be.equal('test');
                someOtherImplementation.method2();
                expect(someOtherImplementation.some).to.be.equal('test2');

                abstractUsageImplementation.method1.call(this);
                expect(abstractUsageImplementation.some).to.be.equal('test');
                abstractUsageImplementation.method2.call(this);
                expect(abstractUsageImplementation.some).to.be.equal('test2');
                abstractUsageImplementation.method1();
                expect(abstractUsageImplementation.some).to.be.equal('test');
                abstractUsageImplementation.method2();
                expect(abstractUsageImplementation.some).to.be.equal('test2');

                otherAbstractUsageImplementation.method1.call(this);
                expect(otherAbstractUsageImplementation.some).to.be.equal('test');
                otherAbstractUsageImplementation.method2.call(this);
                expect(otherAbstractUsageImplementation.some).to.be.equal('test2');
                otherAbstractUsageImplementation.method1();
                expect(otherAbstractUsageImplementation.some).to.be.equal('test');
                otherAbstractUsageImplementation.method2();
                expect(otherAbstractUsageImplementation.some).to.be.equal('test2');
            });

        });

        describe('instanceOf', function () {

            it('should work the same was as native instanceof works (for normal classes)', function () {

                var Class1 = Class({}),
                    Class2 = AbstractClass({}),
                    Class3 = Class({ Extends: Class1 }),
                    Class4 = Class({ Extends: Class2 }),
                    Class5 = AbstractClass({ Extends: Class1 }),
                    Class6 = Class({ Extends: Class5 });

                expect(instanceOf(new Class1(), Class1)).to.equal(true);
                expect(instanceOf(new Class3(), Class3)).to.equal(true);
                expect(instanceOf(new Class3(), Class1)).to.equal(true);
                expect(instanceOf(new Class4(), Class4)).to.equal(true);
                expect(instanceOf(new Class4(), Class2)).to.equal(true);
                expect(instanceOf(new Class6(), Class6)).to.equal(true);
                expect(instanceOf(new Class6(), Class5)).to.equal(true);
                expect(instanceOf(new Class6(), Class1)).to.equal(true);

                expect(instanceOf(new Class3(), Class2)).to.equal(false);
                expect(instanceOf(new Class4(), Class1)).to.equal(false);
                expect(instanceOf(new Class6(), Class2)).to.equal(false);

            });

            it('should work with interfaces as well', function () {

                var Interface1 = Interface({}),
                    Interface2 = Interface({}),
                    Interface3 = Interface({}),
                    Interface4 = Interface({}),
                    Interface5 = Interface({ Extends: [Interface4, Interface1] }),
                    Class1 = Class({ Implements: Interface1 }),
                    Class2 = AbstractClass({ Implements: [Interface1, Interface2] }),
                    Class3 = Class({ Extends: Class1 }),
                    Class4 = Class({ Extends: Class2 }),
                    Class5 = AbstractClass({ Extends: Class1, Implements: Interface3 }),
                    Class6 = Class({ Extends: Class5 }),
                    Class7 = Class({ Implements: [Interface2, Interface5] });

                expect(instanceOf(new Class1(), Interface1)).to.equal(true);
                expect(instanceOf(new Class3(), Interface1)).to.equal(true);
                expect(instanceOf(new Class4(), Interface1)).to.equal(true);
                expect(instanceOf(new Class4(), Interface2)).to.equal(true);
                expect(instanceOf(new Class6(), Interface3)).to.equal(true);
                expect(instanceOf(new Class6(), Interface1)).to.equal(true);
                expect(instanceOf(new Class7(), Interface5)).to.equal(true);
                expect(instanceOf(new Class7(), Interface2)).to.equal(true);
                expect(instanceOf(new Class7(), Interface4)).to.equal(true);
                expect(instanceOf(new Class7(), Interface1)).to.equal(true);
            });

        });
    });

});
