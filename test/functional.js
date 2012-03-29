/*jslint sloppy:true, newcap:true, nomen:true*/
/*global global,define,describe,it*/

define(global.modules, function (Class, AbstractClass, Interface, FinalClass, instanceOf, hasDefineProperty) {

    var expect = global.expect;

    describe('Functional:', function () {

        describe('Instantiation of a simple Class', function () {

            var Example = Class({
                $binds: ['method1', 'method2', 'method3', '_method4', '__method5'],
                some: 'property',
                someOther: null,
                someDate: new Date(),
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
                _method4: function () {
                    this.some = 'test4';
                },
                __method5: function () {
                    this.some = 'test5';
                },
                method4: function () {
                    return this._method4;
                },
                method5: function () {
                    return this.__method5;
                },
                test: function () {
                    this.some = 'test';
                    this.options.option1 = 'test';
                    this.someArray.push('other');
                },
                $finals: {
                    foo: 'bar'
                },
                $constants: {
                    SOME_CONST: 'bar'
                },
                $statics: {
                    staticMethod: function () {},
                    staticSome: 'property'
                }
            }),
                example = new Example(),
                example2 = new Example();

            it('should return a valid instance', function () {
                expect(instanceOf(example, Example)).to.be.equal(true);
                expect(example).to.be.an('object');
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

            it('should not have the $statics property', function () {

                return expect(example.$statics).to.be.equal(undefined);

            });

            it('should not have the $binds property', function () {

                return expect(example.$binds).to.be.equal(undefined);

            });

            it('should not have the $finals property', function () {

                return expect(example.$finals).to.be.equal(undefined);

            });

            it('should not have the $constants property', function () {

                return expect(example.$constants).to.be.equal(undefined);

            });

            it('should not share properties with other instances', function () {

                example2.test();

                expect(example2.some).to.be.equal('test');
                expect(example.some).to.be.equal('property');
                expect(example2.options.option1).to.be.equal('test');
                expect(example.options.option1).to.be.equal('property');
                expect(example2.someArray.length).to.be.equal(2);
                expect(example.someArray.length).to.be.equal(1);
                expect(example.someDate).to.not.be.equal(example2.someDate);

            });

            it('should have bound the methods into the instance context specified in $binds', function () {

                example.method1.call(this);
                expect(example.some).to.be.equal('test');
                example.method2.apply(this, arguments);

                expect(example.some).to.be.equal('test2');
                example.method3();
                expect(example.some).to.be.equal('test3');
                example2.method1.call(this);
                expect(example2.some).to.be.equal('test');
                example2.method2.apply(this);
                expect(example2.some).to.be.equal('test2');
                example2.method3();
                expect(example2.some).to.be.equal('test3');
                example2.method4().call(this);
                expect(example2.some).to.be.equal('test4');
                example2.method5().call(this);
                expect(example2.some).to.be.equal('test5');
            });
        });

        describe('Instantiation of inheritance without constructor', function () {

            var Person = Class({
                status: null,
                initialize: function () {
                    this.status = 'alive';
                }
            }),
                Andre = Class({
                    $extends: Person,
                    $name: 'André'
                }),
                SuperAndre = Class({
                    $extends: Andre,
                    $name: 'SuperAndre'
                }),
                PersonAbstract = AbstractClass({
                    status: null,
                    initialize: function () {
                        this.status = 'alive';
                    }
                }),
                AndreAbstract = AbstractClass({
                    $extends: PersonAbstract,
                    $name: 'André'
                }),
                SuperAndre2 = Class({
                    $extends: AndreAbstract,
                    $name: 'SuperAndre'
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

        describe('$super()', function () {

            var SomeClass = Class({
                _firstName: null,
                initialize: function () {
                    this._firstName = 'andre';
                },
                getFullName: function () {
                    return this._firstName;
                },
                $statics: {
                    _fruit: 'potato',
                    getFruit: function () {
                        return this._fruit;
                    }
                }
            }),
                OtherClass = Class({
                    $extends: SomeClass,
                    _lastName: null,
                    initialize: function () {
                        this.$super();
                        this._lastName = 'cruz';
                    },
                    getFullName: function () {
                        return this.$super() + ' ' + this._lastName;
                    },
                    $statics: {
                        getFruit: function () {
                            return 'hot ' + this.$super();
                        }
                    }
                }),
                HiClass = Class({
                    $extends: OtherClass,
                    getFullName: function () {
                        return 'hi ' + this.$super();
                    },
                    $statics: {
                        getFruit: function () {
                            return 'hi ' + this.$super();
                        }
                    }
                });

            it('should call the parent method', function () {

                expect(new OtherClass().getFullName()).to.be.equal('andre cruz');
                expect(new HiClass().getFullName()).to.be.equal('hi andre cruz');

            });

            it('should work the same way with static methods', function () {

                expect(OtherClass.getFruit()).to.be.equal('hot potato');
                expect(HiClass.getFruit()).to.be.equal('hi hot potato');

            });

        });

        describe('$self()', function () {

            var SomeClass = Class({
                $name: 'SomeClass',
                initialize: function () {
                    this.$self()._fruit = 'orange';
                },
                getFruit: function () {
                    return this.$self().getFruitStatic();
                },
                $statics: {
                    _fruit: 'potato',
                    getFruitStatic: function () {
                        return this._fruit;
                    }
                }
            }),
                OtherClass = Class({
                    $name: 'OtherClass',
                    $extends: SomeClass,
                    initialize: function () {
                        this.$super();
                    },
                    getFruit: function () {
                        return this.$self().getFruitStatic();
                    },
                    $statics: {
                        _fruit: 'potato',
                        getFruitStatic: function () {
                            return this._fruit;
                        }
                    }
                });

            it('should give access to the static layer of itself', function () {

                expect((new SomeClass()).getFruit()).to.be.equal('orange');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect((new OtherClass()).getFruit()).to.be.equal('potato');
                expect(OtherClass.getFruitStatic()).to.be.equal('potato');
            });

        });

        describe('$static()', function () {

            var SomeClass = Class({
                initialize: function () {
                    this.$static()._fruit = 'orange';
                },
                getFruit: function () {
                    return this.$static().getFruitStatic();
                },
                $statics: {
                    _fruit: 'potato',
                    getFruitStatic: function () {
                        return this._fruit;
                    }
                }
            }),
                OtherClass = Class({
                    $extends: SomeClass,
                    initialize: function () {
                        this.$super();
                    },
                    getFruit: function () {
                        return this.$static().getFruitStatic();
                    },
                    $statics: {
                        _fruit: 'potato',
                        getFruitStatic: function () {
                            return this._fruit;
                        }
                    }
                });

            it('should give access the static layer of itself (using late binding)', function () {

                expect(new SomeClass().getFruit()).to.be.equal('orange');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(new OtherClass().getFruit()).to.be.equal('orange');
                expect(OtherClass.getFruitStatic()).to.be.equal('orange');

            });

        });

        describe('Instantiation of inheritance Cat -> Pet', function () {

            var Pet = Class({
                $name: 'Pet',
                name: 'Pet',
                position: 0,
                initialize: function () {
                    this.$self().nrPets += 1;
                    this.$self().dummy = 'dummy';
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
                $statics: {
                    nrPets: 0,
                    dummy: 'test',
                    getNrPets: function () {
                        return this.nrPets;
                    },
                    getMaxAge: function () {
                        return 50;
                    }
                }
            }),
                Cat,
                pet = new Pet(),
                cat;

            Cat = Class({
                $name: 'Cat',
                $extends: Pet,
                initialize: function () {
                    this.name = 'Cat';
                    this.$super();
                },
                walk: function () {
                    this.position += 1;
                    this.$super();
                },
                $statics: {
                    getMaxAge: function () {
                        return 20;
                    }
                }
            });

            cat = new Cat();

            pet.walk();
            cat.walk();

            it('should be an instance of Pet', function () {

                expect(instanceOf(pet, Pet)).to.be.equal(true);
                expect(instanceOf(cat, Pet)).to.be.equal(true);
                expect(instanceOf(cat, Cat)).to.be.equal(true);

            });

            it('should not have the $extends property', function () {

                return expect(cat.$extends).to.be.equal(undefined);

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

            it('should have inherited the static members correctly', function () {

                expect(Cat.getNrPets).to.be.a('function');
                expect(Cat.dummy).to.be.equal('test');
                return expect(Cat.nrPets).to.be.ok;

            });

            it('should not have inherited already defined static methods', function () {

                expect(Pet.getMaxAge()).to.be.equal(50);
                expect(Cat.getMaxAge()).to.be.equal(20);

            });

        });

        describe('Instantiation of Concrete Classes that implement Interfaces', function () {

            it('should not have the $implements property', function () {

                var SomeImplementation = Class({
                    $implements: [Interface({ method1: function () {}})],
                    method1: function () {}
                }),
                    someImplementation = new SomeImplementation();

                return expect(someImplementation.$implements).to.be.equal(undefined);
            });

        });

        describe('Instantiation of Concrete Classes that extend Abstract Classes', function () {

            it('should not have the $abstracts property', function () {

                var SomeImplementation = Class({
                    $extends: AbstractClass({ $abstracts: { method1: function () {} }}),
                    method1: function () {}
                }),
                    someImplementation = new SomeImplementation();

                return expect(someImplementation.$abstracts).to.be.equal(undefined);
            });

        });

        if (/strict/.test(global.build)) {

            describe('Extending final classes', function () {

                it('should throw an error', function () {

                    expect(function () {
                        return Class({
                            $extends: FinalClass({})
                        });
                    }).to.throwException(/cannot inherit from final/);

                    expect(function () {
                        return AbstractClass({
                            $extends: FinalClass({})
                        });
                    }).to.throwException(/cannot inherit from final/);
                });

            });
        }

        describe('Defining a Concrete/Abstract Classes that implements $interfaces', function () {

            var SomeInterface = Interface({
                $constants: {
                    SOME: 'foo'
                }
            }),
                SomeClass = Class({
                    $name: "SomeClass",
                    $implements: SomeInterface
                }),
                OtherClass = Class({
                    $name: "OtherClass",
                    $extends: SomeClass
                }),
                SomeOtherClass = Class({
                    $name: "SomeOtherClass",
                    $extends: SomeClass,
                    $implements: SomeInterface
                }),
                SomeAbstractClass = AbstractClass({
                    $name: "SomeAbstractClass",
                    $implements: SomeInterface
                }),
                OtherAbstractClass = AbstractClass({
                    $name: "OtherAbstractClass",
                    $extends: SomeAbstractClass
                }),
                SomeOtherAbstractClass = Class({
                    $name: "SomeOtherAbstractClass",
                    $extends: SomeAbstractClass,
                    $implements: SomeInterface
                });

            it('should inherit the interface constants', function () {

                expect(SomeClass.SOME).to.be.equal('foo');
                expect(OtherClass.SOME).to.be.equal('foo');
                expect(SomeOtherClass.SOME).to.be.equal('foo');
                expect(SomeAbstractClass.SOME).to.be.equal('foo');
                expect(OtherAbstractClass.SOME).to.be.equal('foo');
                expect(SomeOtherAbstractClass.SOME).to.be.equal('foo');

            });
        });

        describe('Defining a Concrete/Abstract Classes that use $borrows (mixins)', function () {

            it('should grab the borrowed members to their own', function () {

                (function () {
                    var SomeImplementation = Class({
                        $borrows: {
                            method1: function () {},
                            method2: function () {},
                            some: 'property',
                            $finals: {
                                finalProp: 'test',
                                finalFunc: function () {}
                            },
                            $constants: {
                                FOO: 'bar'
                            }
                        }
                    }),
                        OtherImplementation = Class({
                            $borrows: [Class({
                                method1: function () {},
                                method2: function () {},
                                some: 'property'
                            }), { method3: function () {} }]
                        }),
                        EvenOtherImplementation = Class({
                            $borrows: Class({
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

                    expect(someImplementation.finalProp).to.equal('test');
                    expect(someImplementation.finalFunc).to.be.a('function');
                    expect(SomeImplementation.FOO).to.equal('bar');

                }());

                (function () {
                    var SomeImplementation = Class({
                        $borrows: {
                            _method1: function () {},
                            _method2: function () {},
                            _some: 'property'
                        },
                        method1: function () {
                            return this._method1;
                        },
                        method2: function () {
                            return this._method2;
                        },
                        some: function () {
                            return this._some;
                        }
                    }),
                        someImplementation = new SomeImplementation();


                    expect(someImplementation.method1()).to.be.a('function');
                    expect(someImplementation.method2()).to.be.a('function');
                    expect(someImplementation.some()).to.be.equal('property');

                }());

                (function () {
                    var SomeImplementation = Class({
                        $borrows: {
                            __method1: function () {},
                            __method2: function () {},
                            __some: 'property'
                        },
                        method1: function () {
                            return this.__method1;
                        },
                        method2: function () {
                            return this.__method2;
                        },
                        some: function () {
                            return this.__some;
                        }
                    }),
                        someImplementation = new SomeImplementation();


                    expect(someImplementation.method1()).to.be.a('function');
                    expect(someImplementation.method2()).to.be.a('function');
                    expect(someImplementation.some()).to.be.equal('property');

                }());
            });

            it('should grab the borrowed members, respecting the precedence order and not replace self methods', function () {

                var SomeMixin = Class({
                    method1: function () {},
                    $statics: {
                        staticMethod1: function () {}
                    }
                }),
                    OtherMixin = Class({
                        method1: function () {},
                        $statics: {
                            staticMethod1: function () {}
                        }
                    }),
                    SomeClass = Class({
                        $borrows: [SomeMixin, OtherMixin]
                    }),
                    OtherClass = Class({
                        $borrows: [OtherMixin, SomeMixin]
                    }),
                    method1 = function () {
                        return 'foo';
                    },
                    method2 = function () {
                        return 'bar';
                    },
                    SomeOtherClass = Class({
                        $borrows: [SomeMixin, OtherMixin],
                        method1: method1,
                        $statics: {
                            staticMethod1: method2
                        }
                    }),
                    someClass = new SomeClass(),
                    otherClass = new OtherClass(),
                    someOtherClass = new SomeOtherClass();

                expect(someClass.method1).to.be.equal(OtherMixin.prototype.method1);
                expect(SomeClass.staticMethod1).to.be.equal(OtherMixin.staticMethod1);
                expect(otherClass.method1).to.be.equal(SomeMixin.prototype.method1);
                expect(OtherClass.staticMethod1).to.be.equal(SomeMixin.staticMethod1);
                expect(someOtherClass.method1()).to.be.equal('foo');
                expect(SomeOtherClass.staticMethod1()).to.be.equal('bar');

            });

            it('should not grab the initialize method of any class/object', function () {

                var initialize = function () {
                    this.some = 'test';
                },
                    SomeImplementation = Class({
                        $borrows: { initialize: function () { this.some = 'nooo'; }, method1: function () {} },
                        some: 'property',
                        initialize: initialize
                    }),
                    OtherImplementation = Class({
                        $borrows: Class({ initialize: function () { this.some = 'nooo'; } }),
                        some: 'property'
                    }),
                    someImplementation = new SomeImplementation(),
                    otherImplementation = new OtherImplementation();

                expect(someImplementation.some).to.be.equal('test');
                expect(otherImplementation.some).to.be.equal('property');

            });

            it('should have passed the specified binds correctly', function () {

                var SomeImplementation = Class({
                        $borrows: Class({
                            $binds: ['method1', 'method2'],
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
                        $binds: ['method2'],
                        $borrows: Class({
                            $binds: ['method1'],
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
                        $binds: ['method1'],
                        $borrows: [Class({
                            $binds: ['method2'],
                            method2: function () {}
                        }), Class({
                            $binds: ['method2'],
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
                        $binds: ['method2'],
                        $extends: AbstractClass({
                            $binds: ['method1'],
                            $abstracts: {
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
                        $extends: AbstractClass({
                            $binds: ['method1', 'method2'],
                            $abstracts: {
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

        describe('Final members', function () {

            it('should be accessible just as normal parameter/function', function () {

                var SomeClass = Class({
                    $finals: {
                        foo: 'bar',
                        someFunction: function () {
                            return this.foo;
                        }
                    }
                }),
                    someClass = new SomeClass();

                expect(someClass.foo).to.be.equal('bar');
                expect(someClass.someFunction()).to.be.equal('bar');

            });

        });

        describe('Constants', function () {

            var SomeClass = Class({
                $constants: {
                    FOO: 'bar'
                }
            }),
                SomeInterface = Interface({
                    $constants: {
                        FOO: 'bar'
                    }
                });

            it('should be accessible in a similiar way as static members', function () {
                expect(SomeClass.FOO).to.be.equal('bar');
                expect(SomeInterface.FOO).to.be.equal('bar');
            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should throw an error while attempting to change their values', function () {

                    expect(function () {
                        SomeClass.FOO = 'test';
                    }).to.throwException(/constant property/);

                    expect(function () {
                        SomeInterface.FOO = 'test';
                    }).to.throwException(/constant property/);

                });
            }

        });

        describe('Private members', function () {

            var SomeClass = Class({
                $binds: ['__privateMethod'],
                __privateMethod: function () {
                    this.__privateProperty = 'test';
                },
                __privateProperty: 'property',
                setProp: function () {
                    this.__privateMethod();
                },
                getProp: function () {
                    return this.__privateProperty;
                },
                getProp2: function () {
                    return this.__getProp();
                },
                getMethod: function () {
                    return this.__privateMethod;
                },
                callTest: function () {
                    this.__test();
                },
                accessTest: function () {
                    return this.__test;
                },
                callStatic: function () {
                    return SomeClass.__funcStatic();
                },
                accessStaticProp: function () {
                    return SomeClass.__propStatic;
                },
                accessStaticFunc: function () {
                    return SomeClass.__funcStatic();
                },
                getConst: function () {
                    return this.$self().__SOME;
                },
                getConst2: function () {
                    return this.$static().__SOME;
                },
                getConst3: function () {
                    return SomeClass.__SOME;
                },
                __getProp: function () {
                    this.__privateMethod();
                    return this.__privateProperty;
                },
                $statics: {
                    callTest: function () {
                        this.__test();
                    },
                    accessTest: function () {
                        return this.__test;
                    },
                    accessConst: function () {
                        return this.__SOME;
                    },
                    __funcStatic: function () {},
                    __propStatic: 'property'
                },
                $constants: {
                    __SOME: 'foo'
                }
            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should not be available in the prototype', function () {

                    expect(SomeClass.prototype.__func).to.be.equal(undefined);
                    expect(SomeClass.prototype.__prop).to.be.equal(undefined);

                });

            }

            it('should not be copied to the childs constructor if they are static', function () {

                expect((function () {
                    var OtherClass = Class({
                        $extends: SomeClass
                    });
                    return OtherClass.__funcStatic;
                }())).to.be.equal(undefined);

                expect((function () {
                    var OtherClass = Class({
                        $extends: SomeClass
                    });
                    return OtherClass.__propStatic;
                }())).to.be.equal(undefined);

                expect((function () {
                    var OtherClass = Class({
                        $extends: SomeClass
                    });
                    return OtherClass.__SOME;
                }())).to.be.equal(undefined);

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should only be available to self', function () {

                    expect((function () {
                        var OtherClass = Class({
                            $extends: SomeClass
                        });
                        return OtherClass.__funcStatic;
                    }())).to.be.equal(undefined);

                    expect((function () {
                        var OtherClass = Class({
                            $extends: SomeClass
                        });
                        return OtherClass.__propStatic;
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            some: function () {
                                this.__privateMethod();
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            some: function () {
                                SomeClass.__funcStatic();
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            $statics: {
                                some: function () {
                                    this.__funcStatic();
                                }
                            }
                        });
                        OtherClass.some();
                    }).to.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            some: function () {
                                return this.__privateProperty;
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            some: function () {
                                return SomeClass.__propStatic;
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect((function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            $statics: {
                                some: function () {
                                    return this.__privateProperty;
                                }
                            }
                        });
                        return OtherClass.some();
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            __test: function () {}
                        });
                        return new OtherClass().callTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            $statics: {
                                __test: function () {}
                            }
                        });
                        OtherClass.callTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            __test: 'some'
                        });
                        return new OtherClass().accessTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            $statics: {
                                __test: 'some'
                            }
                        });
                        return OtherClass.accessTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: Class({
                                initialize: function () {
                                    this.__test();
                                }
                            }),
                            __test: function () {}
                        });

                        return new OtherClass();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: Class({
                                initialize: function () {
                                    this.__test = 'test';
                                }
                            }),
                            __test: 'some'
                        });
                        return new OtherClass();
                    }).to.throwException(/set private/);

                    expect(function () {
                        (new SomeClass()).__privateMethod();
                    }).to.throwException(/access private/);

                    expect(function () {
                        (new SomeClass()).__privateProperty();
                    }).to.throwException(/access private/);

                    expect(function () {
                        SomeClass.__funcStatic();
                    }).to.throwException(/access private/);

                    expect(function () {
                        return SomeClass.__propStatic;
                    }).to.throwException(/access private/);

                    expect(function () {
                        return SomeClass.__SOME;
                    }).to.throwException(/access private/);

                    expect(function () {
                        (new SomeClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            getProp: function () {
                                return this.$super();
                            }
                        });

                        return (new OtherClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        (new SomeClass()).getProp2();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            getProp2: function () {
                                return this.$super();
                            }
                        });

                        return (new OtherClass()).getProp2();
                    }).to.not.throwException();

                    expect((function () {
                        var test = new SomeClass();
                        test.setProp();
                        return test.getProp();
                    }())).to.be.equal('test');

                    expect(function () {
                        return (new SomeClass()).accessStaticProp();
                    }).to.not.throwException();

                    expect(function () {
                        return (new SomeClass()).accessStaticFunc();
                    }).to.not.throwException();

                    expect((function () {
                        return SomeClass.accessConst();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst2();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst3();
                    }())).to.be.equal('foo');

                });

                it('cannot be overrided', function () {

                    expect(function () {
                        return Class({
                            $extends: SomeClass,
                            __getProp: function () {}
                        });
                    }).to.throwException(/override private/);

                    expect(function () {
                        return Class({
                            $extends: SomeClass,
                            __privateProperty: 'foo'
                        });
                    }).to.throwException(/override private/);

                });

            }

        });

        describe('Protected members', function () {

            var SomeClass = Class({
                $binds: ['_protectedMethod'],
                _protectedMethod: function () {
                    this._protectedProperty = 'test';
                },
                _protectedProperty: 'property',
                setProp: function () {
                    this._protectedMethod();
                },
                getProp: function () {
                    return this._protectedProperty;
                },
                getProp2: function () {
                    return this._getProp();
                },
                getMethod: function () {
                    return this._protectedMethod;
                },
                callTest: function () {
                    this._test();
                },
                accessTest: function () {
                    return this._test;
                },
                _getProp: function () {
                    this._protectedMethod();
                    return this._protectedProperty;
                },
                getFruit: function () {
                    return this._getFruit();
                },
                _getFruit: function () {
                    return 'potato';
                },
                getConst: function () {
                    return this.$self()._SOME;
                },
                getConst2: function () {
                    return this.$static()._SOME;
                },
                getConst3: function () {
                    return SomeClass._SOME;
                },
                $statics: {
                    callTest: function () {
                        this._test();
                    },
                    accessTest: function () {
                        return this._test;
                    },
                    accessConst: function () {
                        return this._SOME;
                    },
                    _funcStatic: function () {
                        return 'potato';
                    },
                    _propStatic: 'property',
                    getFruitStatic: function () {
                        return this._getFruitStatic();
                    },
                    _getFruitStatic: function () {
                        return 'potato';
                    }
                },
                $constants: {
                    _SOME: 'foo'
                }
            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should not be available in the prototype', function () {

                    expect(SomeClass.prototype._func).to.be.equal(undefined);
                    expect(SomeClass.prototype._prop).to.be.equal(undefined);

                });

            }

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should only be available to derived classes', function () {

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            some: function () {
                                this._protectedMethod();
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            some: function () {
                                this.$self()._funcStatic();
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            $statics: {
                                some: function () {
                                    this._funcStatic();
                                }
                            }
                        });
                        OtherClass.some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            some: function () {
                                return this._protectedProperty;
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect((function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            $statics: {
                                some: function () {
                                    return this._protectedProperty;
                                }
                            }
                        });
                        return OtherClass.some();
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            _test: function () {}
                        });
                        return new OtherClass().callTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            $statics: {
                                _test: function () {}
                            }
                        });
                        OtherClass.callTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            _test: 'some'
                        });
                        return new OtherClass().accessTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            $statics: {
                                _test: 'some'
                            }
                        });
                        return OtherClass.accessTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: Class({
                                initialize: function () {
                                    this._test();
                                }
                            }),
                            _test: function () {}
                        });

                        return new OtherClass();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: Class({
                                initialize: function () {
                                    this._test = 'test';
                                }
                            }),
                            _test: 'some'
                        });
                        return new OtherClass();
                    }).to.not.throwException();

                    expect(function () {
                        (new SomeClass())._protectedMethod();
                    }).to.throwException(/access protected/);

                    expect(function () {
                        return (new SomeClass())._protectedProperty;
                    }).to.throwException(/access protected/);

                    expect(function () {
                        SomeClass._funcStatic();
                    }).to.throwException(/access protected/);

                    expect(function () {
                        return SomeClass._propStatic;
                    }).to.throwException(/access protected/);

                    expect(function () {
                        return SomeClass._SOME;
                    }).to.throwException(/access protected/);

                    expect(function () {
                        (new SomeClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            getProp: function () {
                                return this.$super();
                            }
                        });

                        return (new OtherClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        (new SomeClass()).getProp2();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            $extends: SomeClass,
                            getProp2: function () {
                                return this.$super();
                            }
                        });

                        return (new OtherClass()).getProp2();
                    }).to.not.throwException();

                    expect((function () {
                        var test = new SomeClass();
                        test.setProp();
                        return test.getProp();
                    }())).to.be.equal('test');

                    expect((function () {
                        return SomeClass.accessConst();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst2();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst3();
                    }())).to.be.equal('foo');

                });

            }

            it('should work well with $super()', function () {

                var OtherClass = Class({
                        $extends: SomeClass,
                        _getFruit: function () {
                            return 'hot ' + this.$super();
                        },
                        $statics: {
                            _getFruitStatic: function () {
                                return 'hot ' + this.$super();
                            }
                        }
                    }),
                    HiClass = Class({
                        $extends: OtherClass,
                        _getFruit: function () {
                            return 'hi ' + this.$super();
                        },
                        $statics: {
                            _getFruitStatic: function () {
                                return 'hi ' + this.$super();
                            }
                        }
                    }),
                    other = new OtherClass(),
                    hi = new HiClass();

                expect(other.getFruit()).to.be.equal('hot potato');
                expect(hi.getFruit()).to.be.equal('hi hot potato');
                expect(OtherClass.getFruitStatic()).to.be.equal('hot potato');
                expect(HiClass.getFruitStatic()).to.be.equal('hi hot potato');
            });

        });

        describe('instanceOf', function () {

            it('should work the same was as native instanceof works (for normal classes)', function () {

                var Class1 = Class({}),
                    Class2 = AbstractClass({}),
                    Class3 = Class({ $extends: Class1 }),
                    Class4 = Class({ $extends: Class2 }),
                    Class5 = AbstractClass({ $extends: Class1 }),
                    Class6 = Class({ $extends: Class5 });

                expect(instanceOf(new Class1(), Class1)).to.be.equal(true);
                expect(instanceOf(new Class3(), Class3)).to.be.equal(true);
                expect(instanceOf(new Class3(), Class1)).to.be.equal(true);
                expect(instanceOf(new Class4(), Class4)).to.be.equal(true);
                expect(instanceOf(new Class4(), Class2)).to.be.equal(true);
                expect(instanceOf(new Class6(), Class6)).to.be.equal(true);
                expect(instanceOf(new Class6(), Class5)).to.be.equal(true);
                expect(instanceOf(new Class6(), Class1)).to.be.equal(true);

                expect(instanceOf(new Class3(), Class2)).to.be.equal(false);
                expect(instanceOf(new Class4(), Class1)).to.be.equal(false);
                expect(instanceOf(new Class6(), Class2)).to.be.equal(false);

            });

            it('should work with interfaces as well', function () {

                var Interface1 = Interface({}),
                    Interface2 = Interface({}),
                    Interface3 = Interface({}),
                    Interface4 = Interface({}),
                    Interface5 = Interface({ $extends: [Interface4, Interface1] }),
                    Class1 = Class({ $implements: Interface1 }),
                    Class2 = AbstractClass({ $implements: [Interface1, Interface2] }),
                    Class3 = Class({ $extends: Class1 }),
                    Class4 = Class({ $extends: Class2 }),
                    Class5 = AbstractClass({ $extends: Class1, $implements: Interface3 }),
                    Class6 = Class({ $extends: Class5 }),
                    Class7 = Class({ $implements: [Interface2, Interface5] });

                expect(instanceOf(new Class1(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class3(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class4(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class4(), Interface2)).to.be.equal(true);
                expect(instanceOf(new Class6(), Interface3)).to.be.equal(true);
                expect(instanceOf(new Class6(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class7(), Interface5)).to.be.equal(true);
                expect(instanceOf(new Class7(), Interface2)).to.be.equal(true);
                expect(instanceOf(new Class7(), Interface4)).to.be.equal(true);
                expect(instanceOf(new Class7(), Interface1)).to.be.equal(true);

                expect(instanceOf(new Class1(), Interface2)).to.be.equal(false);
                expect(instanceOf(new Class6(), Interface4)).to.be.equal(false);

            });

        });
    });

});
