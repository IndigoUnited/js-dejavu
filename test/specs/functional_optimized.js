/*jshint strict:false*/

define(global.modules, function (Class, AbstractClass, Interface, FinalClass, instanceOf, hasDefineProperty) {

    // We don't declare strict mode to ensure some micro validations to pass
    //'use strict';

    var expect = global.expect;

    // TODO: remove this once mocha fixes it (https://github.com/visionmedia/mocha/issues/502)
    beforeEach(function (done) {
        setTimeout(done, 0);
    });

    describe('Functional:', function () {

        describe('Instantiation of a simple Class', function () {

            var SomeClass = Class.declare(function () { return {}; }),
                Example = Class.declare(function () {
                    return {
                        some: 'property',
                        someOther: null,
                        someDate: new Date(),
                        someClass: SomeClass,
                        someInstance: new SomeClass(),
                        someRegExp: /some/ig,
                        options: {
                            option1: 'property'
                        },
                        someArray: ['some'],
                        initialize: function () {
                            this.someOther = 'property';
                        },
                        method1: function () {
                            this.some = 'test';
                        }.$bound(),
                        method2: function () {
                            this.some = 'test2';
                        }.$bound(),
                        method3: function () {
                            this.some = 'test3';
                        }.$bound(),
                        _method4: function () {
                            this.some = 'test4';
                        }.$bound(),
                        __method5: function () {
                            this.some = 'test5';
                        }.$bound(),
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
                            foo: 'bar',
                            otherClass: SomeClass,
                            otherInstance: new SomeClass()
                        },
                        $constants: {
                            SOME_CONST: 'const'
                        },
                        $statics: {
                            staticMethod: function () {},
                            staticSome: 'property'
                        }
                    };
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

            it('should have 1 static methods, 1 static property and 1 constant', function () {

                expect(Example.staticMethod).to.be.a('function');
                expect(Example).to.have.property('staticMethod');
                expect(Example.staticSome).to.be.equal('property');
                expect(Example).to.have.property('staticSome');
                expect(Example.SOME_CONST).to.be.equal('const');
                expect(Example).to.have.property('SOME_CONST');

            });

            it('should have run the initialize method', function () {

                expect(example.someOther).to.be.equal('property');

            });

            it('should not have the $statics property', function () {

                return expect(example.$statics).to.be.equal(undefined);

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

                expect(example.someClass).to.be.equal(example2.someClass);
                expect(example.someInstance).to.not.be.equal(example2.someInstance);
                expect(instanceOf(example.someInstance, SomeClass)).to.be.equal(true);
                expect(instanceOf(example2.someInstance, SomeClass)).to.be.equal(true);

                expect(example.otherClass).to.be.equal(example2.otherClass);
                expect(example.otherInstance).to.not.be.equal(example2.otherInstance);
                expect(instanceOf(example.otherInstance, SomeClass)).to.be.equal(true);
                expect(instanceOf(example2.otherInstance, SomeClass)).to.be.equal(true);

                expect(example.someRegExp).to.not.be.equal(example2.someRegExp);
                expect(example.someRegExp.toString()).to.be.equal(example2.someRegExp.toString());

            });

            it('should have bound the methods into the instance context', function () {

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

        describe('Instantiation of a simple inheritance setup', function () {

            var Person = Class.declare(function () {
                return {
                    status: null,
                    initialize: function () {
                        this.status = 'alive';
                    }
                };
            }),
                Andre = Class.declare(Person, function ($super) {
                    return {
                        $name: 'André'
                    };
                }),
                SuperAndre = Class.declare(Andre, function ($super) {
                    return {
                        $name: 'SuperAndre'
                    };
                }),
                PersonAbstract = AbstractClass.declare(function () {
                    return {
                        status: null,
                        initialize: function () {
                            this.status = 'alive';
                        }
                    };
                }),
                AndreAbstract = AbstractClass.declare(PersonAbstract, function ($super) {
                    return {
                        $name: 'André'
                    };
                }),
                SuperAndre2 = Class.declare(AndreAbstract, function ($super) {
                    return {
                        $name: 'SuperAndre'
                    };
                }),
                ProtectedPerson = Class.declare(function () {
                    return {
                        status: null,
                        _initialize: function () {
                            this.status = 'alive';
                        }
                    };
                }),
                PrivatePerson = Class.declare(function () {
                    return {
                        __initialize: function () {}
                    };
                }),
                FreakPerson = Class.declare(function () {
                    return {
                        $extends: ProtectedPerson
                    };
                }),
                NerdPerson = Class.declare(function () {
                    return {
                        $extends: PrivatePerson
                    };
                }),
                ComplexProtectedPerson = ProtectedPerson.extend(function ($super) {
                    return {
                        initialize: function () {
                            $super.initialize.call(this);
                        }
                    };
                });

            it('should invoke the parent constructor automatically if no constructor was defined', function () {

                var andre = new Andre(),
                    superAndre = new SuperAndre(),
                    superAndre2 = new SuperAndre2();

                expect(andre.status).to.be.equal('alive');
                expect(superAndre.status).to.be.equal('alive');
                expect(superAndre2.status).to.be.equal('alive');

            });

            if (/strict/.test(global.build) && hasDefineProperty) {
                it('should throw an error if inheriting from a private/protected constructor', function () {

                    expect(function () {
                        return new NerdPerson();
                    }).to.throwException(/is private/);

                });

                it('should throw an error if inheriting from a private/protected constructor', function () {

                    expect(function () {
                        return new FreakPerson();
                    }).to.throwException(/is protected/);

                });
            }

            it('should run the parent constructor even if its defined as protected', function () {

                var person = new ComplexProtectedPerson();

                expect(person.status).to.be.equal('alive');

            });


            it('should work with .extend()', function () {

                var person = new ComplexProtectedPerson();
                expect(person).to.be.an(ComplexProtectedPerson);
                expect(person).to.be.an(ProtectedPerson);

            });

            it('should run the parent constructor even if its defined as protected', function () {

                var person = new ComplexProtectedPerson();

                expect(person.status).to.be.equal('alive');

            });

        });

        describe('$super()', function () {

            var SomeClass = Class.declare(function () {
                return {
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
                };
            }),
                OtherClass = Class.declare(SomeClass, function ($super, $self, $parent) {
                    return {
                        _lastName: null,
                        initialize: function () {
                            $super.initialize.call(this);
                            this._lastName = 'cruz';
                        },
                        getFullName: function () {
                            return $super.getFullName.call(this) + ' ' + this._lastName;
                        },
                        $statics: {
                            getFruit: function () {
                                return 'hot ' + $parent.getFruit.call(this);
                            }
                        }
                    };
                }),
                HiClass = Class.declare(OtherClass, function ($super, $self, $parent) {
                    return {
                        getFullName: function () {
                            return 'hi ' + $super.getFullName.call(this);
                        },
                        $statics: {
                            getFruit: function () {
                                return 'hi ' + $parent.getFruit.call(this);
                            }
                        }
                    };
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

        describe('$self', function () {

            var SomeClass = Class.declare(function ($self) {
                return {
                    $name: 'SomeClass',
                    initialize: function () {
                        $self._fruit = 'orange';
                    },
                    getFruit: function () {
                        return $self.getFruitStatic();
                    },
                    $statics: {
                        _fruit: 'potato',
                        getFruitStatic: function () {
                            return this._fruit;
                        },
                        setFruitStatic: function (fruit) {
                            $self._fruit = fruit;
                        }
                    }
                };
            }),
                OtherClass = Class.declare(SomeClass, function ($super, $self, $parent) {
                    return {
                        $name: 'OtherClass',
                        initialize: function () {
                            $super.initialize.call(this);
                        },
                        getFruit: function () {
                            return $self.getFruitStatic();
                        },
                        $statics: {
                            _fruit: 'potato',
                            getFruitStatic: function () {
                                return this._fruit;
                            }
                        }
                    };
                });

            it('should give access to the static layer of itself', function () {

                expect((new SomeClass()).getFruit()).to.be.equal('orange');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect((new OtherClass()).getFruit()).to.be.equal('potato');
                expect(OtherClass.getFruitStatic()).to.be.equal('potato');

                OtherClass.setFruitStatic('carrot');
                expect(SomeClass.getFruitStatic()).to.be.equal('carrot');
                expect(OtherClass.getFruitStatic()).to.be.equal('potato');

                SomeClass.setFruitStatic('carrot');

            });

        });

        describe('$static', function () {

            var SomeClass = Class.declare(function () {
                return {
                    initialize: function () {
                        this.$static._fruit = 'orange';
                    },
                    getFruit: function () {
                        return this.$static.getFruitStatic();
                    },
                    $statics: {
                        _fruit: 'potato',
                        getFruitStatic: function () {
                            return this._fruit;
                        },
                        setFruitStatic: function (fruit) {
                            this._fruit = fruit;
                        },
                        setFruitStatic2: function (fruit) {
                            this.$static._fruit = fruit;
                        }
                    }
                };
            }),
                OtherClass = Class.declare(SomeClass, function ($super) {
                    return {
                        initialize: function () {
                            $super.initialize.call(this);
                        },
                        getFruit: function () {
                            return this.$static.getFruitStatic();
                        },
                        $statics: {
                            _fruit: 'potato',
                            getFruitStatic: function () {
                                return this._fruit;
                            }
                        }
                    };
                });

            it('should give access the static layer of itself (using late binding)', function () {

                expect(new SomeClass().getFruit()).to.be.equal('orange');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(new OtherClass().getFruit()).to.be.equal('orange');
                expect(OtherClass.getFruitStatic()).to.be.equal('orange');

                OtherClass.setFruitStatic('carrot');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(OtherClass.getFruitStatic()).to.be.equal('carrot');

                OtherClass.setFruitStatic2('banana');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(OtherClass.getFruitStatic()).to.be.equal('banana');

                SomeClass.setFruitStatic('carrot');

            });

        });

        describe('Instantiation of inheritance Cat -> Pet', function () {

            var Pet = Class.declare(function ($self) {
                return {
                    $name: 'Pet',
                    name: 'Pet',
                    position: 0,
                    initialize: function () {
                        $self.nrPets += 1;
                        $self.dummy = 'dummy';
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
                };
            }),
                Cat,
                pet = new Pet(),
                cat;

            Cat = Class.declare(Pet, function ($super) {
                return {
                    $name: 'Cat',
                    initialize: function () {
                        this.name = 'Cat';
                        $super.initialize.call(this);
                    },
                    walk: function () {
                        this.position += 1;
                        $super.walk.call(this);
                    },
                    $statics: {
                        getMaxAge: function () {
                            return 20;
                        }
                    }
                };
            });

            cat = new Cat();

            pet.walk();
            cat.walk();

            it('should be an instance of Pet and Cat', function () {

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

                var SomeImplementation = Class.declare(function () {
                    return {
                        $implements: [Interface.declare({ method1: function () {}})],
                        method1: function () {}
                    };
                }),
                    someImplementation = new SomeImplementation();

                return expect(someImplementation.$implements).to.be.equal(undefined);
            });

        });

        describe('Instantiation of Concrete Classes that extend Abstract Classes', function () {

            it('should not have the $abstracts property', function () {

                var tmp = AbstractClass.declare(function () { return { $abstracts: { method1: function () {} }}; }),
                    SomeImplementation = Class.declare(tmp, function ($super) {
                        return {
                            method1: function () {}
                        };
                    }),
                    someImplementation = new SomeImplementation();

                return expect(someImplementation.$abstracts).to.be.equal(undefined);
            });

        });

        if (/strict/.test(global.build)) {

            describe('Extending final classes', function () {

                it('should throw an error', function () {

                    expect(function () {
                        var tmp = FinalClass.declare(function () { return {}; });

                        return Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        });
                    }).to.throwException(/cannot inherit from final/);

                    expect(function () {
                        var tmp = FinalClass.declare(function () { return {}; });

                        return AbstractClass.declare(function () {
                            return {
                                $extends: tmp
                            };
                        });
                    }).to.throwException(/cannot inherit from final/);
                });

            });
        }

        describe('Defining a Concrete/Abstract Classes that implements $interfaces', function () {

            var SomeInterface = Interface.declare({
                $constants: {
                    SOME: 'foo'
                }
            }),
                SomeClass = Class.declare(function () {
                    return {
                        $name: 'SomeClass',
                        $implements: SomeInterface
                    };
                }),
                OtherClass = Class.declare(function () {
                    return {
                        $name: 'OtherClass',
                        $extends: SomeClass
                    };
                }),
                SomeOtherClass = Class.declare(SomeClass, function ($super) {
                    return {
                        $name: 'SomeOtherClass',
                        $implements: SomeInterface
                    };
                }),
                SomeAbstractClass = AbstractClass.declare(function () {
                    return {
                        $name: 'SomeAbstractClass',
                        $implements: SomeInterface
                    };
                }),
                OtherAbstractClass = AbstractClass.declare(function () {
                    return {
                        $name: 'OtherAbstractClass',
                        $extends: SomeAbstractClass
                    };
                }),
                SomeOtherAbstractClass = Class.declare(SomeAbstractClass, function ($super) {
                    return {
                        $name: 'SomeOtherAbstractClass',
                        $implements: SomeInterface
                    };
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

                var CommonMixin = AbstractClass.declare(function () {
                    return {
                        method1: function () {}
                    };
                });

                (function () {
                    var SomeImplementation = Class.declare(function () {
                        return {
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
                        };
                    }),
                        OtherImplementation = Class.declare(function () {
                            return {
                                $borrows: [Class.declare({
                                    method1: function () {},
                                    method2: function () {},
                                    some: 'property'
                                }), { method3: function () {} }]
                            };
                        }),
                        EvenOtherImplementation = Class.declare(function () {
                            return {
                                $borrows: Class.declare({
                                    method1: function () {},
                                    method2: function () {},
                                    some: 'property'
                                })
                            };
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
                    var SomeImplementation = Class.declare(function () {
                        return {
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
                        };
                    }),
                        someImplementation = new SomeImplementation();


                    expect(someImplementation.method1()).to.be.a('function');
                    expect(someImplementation.method2()).to.be.a('function');
                    expect(someImplementation.some()).to.be.equal('property');

                }());

                (function () {
                    var SomeImplementation = Class.declare(function () {
                        return {
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
                        };
                    }),
                        someImplementation = new SomeImplementation();


                    expect(someImplementation.method1()).to.be.a('function');
                    expect(someImplementation.method2()).to.be.a('function');
                    expect(someImplementation.some()).to.be.equal('property');

                }());

                expect(function () {
                    var SomeClass = Class.declare(function () { return {}; }),
                        Common1 = Class.declare(SomeClass, function ($super) {
                            return {
                                $borrows: CommonMixin
                            };
                        }),
                        Common2 = Class.declare(SomeClass, function ($super) {
                            return {
                                $borrows: CommonMixin
                            };
                        }),
                        common1 = new Common1(),
                        common2  = new Common2();
                }).to.not.throwException();

                expect(function () {
                    var SomeClass = Class.declare(function () {
                        return {
                            _protectedProp: 'foo',
                            _privateProp: 'bar'
                        };
                    }),
                        Common1 = Class.declare(function () {
                            return {
                                $extends: SomeClass
                            };
                        }),
                        Common2 = Class.declare(SomeClass, function ($super) {
                            return {
                                accessProtected: function (inst) {
                                    return inst._protectedProp;
                                },
                                accessPrivate: function (inst) {
                                    return inst._protectedProp;
                                }
                            };
                        }),
                        common1 = new Common1(),
                        common2  = new Common2();

                    common2.accessProtected(common1);
                }).to.not.throwException();

            });

            it('should grab the borrowed members, respecting the precedence order and not replace self methods', function () {

                var SomeMixin = Class.declare(function () {
                    return {
                        method1: function () {},
                        $statics: {
                            staticMethod1: function () {}
                        }
                    };
                }),
                    OtherMixin = Class.declare(function () {
                        return {
                            method1: function () {},
                            $statics: {
                                staticMethod1: function () {}
                            }
                        };
                    }),
                    SomeClass = Class.declare(function () {
                        return {
                            $borrows: [SomeMixin, OtherMixin]
                        };
                    }),
                    OtherClass = Class.declare(function () {
                        return {
                            $borrows: [OtherMixin, SomeMixin]
                        };
                    }),
                    method1 = function () {
                        return 'foo';
                    },
                    method2 = function () {
                        return 'bar';
                    },
                    SomeOtherClass = Class.declare(function () {
                        return {
                            $borrows: [SomeMixin, OtherMixin],
                            method1: method1,
                            $statics: {
                                staticMethod1: method2
                            }
                        };
                    }),
                    someClass = new SomeClass(),
                    otherClass = new OtherClass(),
                    someOtherClass = new SomeOtherClass();

                expect(someClass.method1.$wrapped).to.be.equal(OtherMixin.prototype.method1.$wrapped);
                expect(SomeClass.staticMethod1.$wrapped).to.be.equal(OtherMixin.staticMethod1.$wrapped);
                expect(otherClass.method1.$wrapped).to.be.equal(SomeMixin.prototype.method1.$wrapped);
                expect(OtherClass.staticMethod1.$wrapped).to.be.equal(SomeMixin.staticMethod1.$wrapped);
                expect(someOtherClass.method1()).to.be.equal('foo');
                expect(SomeOtherClass.staticMethod1()).to.be.equal('bar');

            });

            it('should not grab the initialize method of any class/object', function () {

                var initialize = function () {
                    this.some = 'test';
                },
                    SomeImplementation = Class.declare(function () {
                        return {
                            $borrows: { initialize: function () { this.some = 'nooo'; }, method1: function () {} },
                            some: 'property',
                            initialize: initialize
                        };
                    }),
                    OtherImplementation = Class.declare(function () {
                        return {
                            $borrows: Class.declare({ initialize: function () { this.some = 'nooo'; } }),
                            some: 'property'
                        };
                    }),
                    someImplementation = new SomeImplementation(),
                    otherImplementation = new OtherImplementation();

                expect(someImplementation.some).to.be.equal('test');
                expect(otherImplementation.some).to.be.equal('property');

            });

            it('should have passed the specified binds correctly', function () {

                var SomeImplementation = Class.declare(function () {
                        return {
                            $borrows: Class.declare({
                                method1: function () {
                                    this.some = 'test';
                                }.$bound(),
                                method2: function () {
                                    this.some = 'test2';
                                }.$bound()
                            }),
                            some: 'property'
                        };
                    }),
                    OtherImplementation = Class.declare(function () {
                        return {
                            $borrows: Class.declare({
                                method1: function () {
                                    this.some = 'test';
                                }.$bound()
                            }),
                            method2: function () {
                                this.some = 'test2';
                            }.$bound(),
                            some: 'property'
                        };
                    }),
                    SomeOtherImplementation = Class.declare(function () {
                        return {
                            $borrows: [Class.declare({
                                method2: function () {}.$bound()
                            }), Class.declare({
                                method2: function () {}.$bound()
                            })],
                            method1: function () {
                                this.some = 'test';
                            }.$bound(),
                            method2: function () {
                                this.some = 'test2';
                            },
                            some: 'property'
                        };
                    }),
                    AbstractUsageImplementation = (function () {
                        var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    method1: function () {}.$bound()
                                }
                            };
                        });

                        return Class.declare(tmp, function ($super) {
                            return {
                                method1: function () {
                                    this.some = 'test';
                                },
                                method2: function () {
                                    this.some = 'test2';
                                }.$bound(),
                                some: 'property'
                            };
                        });
                    }()),
                    OtherAbstractUsageImplementation = (function () {
                        var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    method1: function () {}.$bound()
                                },
                                method2: function () {
                                    this.some = 'test2';
                                }.$bound()
                            };
                        });

                        return Class.declare(tmp, function ($super) {
                            return {
                                method1: function () {
                                    this.some = 'test';
                                },
                                some: 'property'
                            };
                        });
                    }()),
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

                var SomeClass = Class.declare(function () {
                    return {
                        $finals: {
                            foo: 'bar',
                            someFunction: function () {
                                return this.foo;
                            }
                        }
                    };
                }),
                    someClass = new SomeClass();

                expect(someClass.foo).to.be.equal('bar');
                expect(someClass.someFunction()).to.be.equal('bar');

            });

        });

        describe('Constants', function () {

            var SomeClass = Class.declare(function () {
                return {
                    $constants: {
                        FOO: 'bar'
                    }
                };
            }),
                SomeInterface = Interface.declare({
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

            var SomeClass = Class.declare(function ($self) {
                return {
                    __privateMethod: function () {
                        this.__privateProperty = 'test';
                    }.$bound(),
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
                        return $self.__SOME;
                    },
                    getConst2: function () {
                        return this.$static.__SOME;
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
                };
            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should not be available in the prototype', function () {

                    expect(SomeClass.prototype.__func).to.be.equal(undefined);
                    expect(SomeClass.prototype.__prop).to.be.equal(undefined);

                });

            }

            it('should not be copied to the childs constructor if they are static', function () {

                expect((function () {
                    var OtherClass = Class.declare(function () {
                        return {
                            $extends: SomeClass
                        };
                    });
                    return OtherClass.__funcStatic;
                }())).to.be.equal(undefined);

                expect((function () {
                    var OtherClass = Class.declare(function () {
                        return {
                            $extends: SomeClass
                        };
                    });
                    return OtherClass.__propStatic;
                }())).to.be.equal(undefined);

                expect((function () {
                    var OtherClass = Class.declare(function () {
                        return {
                            $extends: SomeClass
                        };
                    });
                    return OtherClass.__SOME;
                }())).to.be.equal(undefined);

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should only be available to self', function () {

                    expect((function () {
                        var OtherClass = Class.declare(function () {
                            return {
                                $extends: SomeClass
                            };
                        });
                        return OtherClass.__funcStatic;
                    }())).to.be.equal(undefined);

                    expect((function () {
                        var OtherClass = Class.declare(function () {
                            return {
                                $extends: SomeClass
                            };
                        });
                        return OtherClass.__propStatic;
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                some: function () {
                                    this.__privateMethod();
                                }
                            };
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                some: function () {
                                    SomeClass.__funcStatic();
                                }
                            };
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                $statics: {
                                    some: function () {
                                        this.__funcStatic();
                                    }
                                }
                            };
                        });
                        OtherClass.some();
                    }).to.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                some: function () {
                                    return this.__privateProperty;
                                }
                            };
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                some: function () {
                                    return SomeClass.__propStatic;
                                }
                            };
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect((function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                $statics: {
                                    some: function () {
                                        return this.__privateProperty;
                                    }
                                }
                            };
                        });
                        return OtherClass.some();
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                __test: function () {}
                            };
                        });
                        return new OtherClass().callTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                $statics: {
                                    __test: function () {}
                                }
                            };
                        });
                        OtherClass.callTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                __test: 'some'
                            };
                        });
                        return new OtherClass().accessTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                $statics: {
                                    __test: 'some'
                                }
                            };
                        });
                        return OtherClass.accessTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var tmp = Class.declare(function () {
                                return {
                                    initialize: function () {
                                        this.__test();
                                    }
                                };
                            }),
                            OtherClass = Class.declare(tmp, function ($super) {
                                return {
                                    __test: function () {}

                                };
                            });

                        return new OtherClass();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var tmp = Class.declare(function () {
                                return {
                                    initialize: function () {
                                        this.__test = 'test';
                                    }
                                };
                            }),
                            OtherClass = Class.declare(tmp, function ($super) {
                                return {
                                    __test: 'some'
                                };
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
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                getProp: function () {
                                    return $super.getProp.call(this);
                                }
                            };
                        });

                        return (new OtherClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        (new SomeClass()).getProp2();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                getProp2: function () {
                                    return $super.getProp2.call(this);
                                }
                            };
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

                    expect(function () {
                        var SomeTestClass = Class.declare(function () {
                            return {
                                __someVar: 'foo',
                                __someMethod: function () {},
                                test: function () {
                                    return this.__someVar;
                                },
                                test2: function () {
                                    this.__someMethod();
                                }
                            };
                        }), OtherClass = Class.declare(function () {
                            return {
                                $borrows: SomeTestClass
                            };
                        }),
                            myOtherClass = new OtherClass();

                        myOtherClass.test();
                        myOtherClass.test2();
                    }).to.not.throwException();

                    // This was commented out because under strict was temporarly removed
                    /*expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                __someVar: 'foo',
                                exec: function (func) {
                                    func();
                                }
                            };
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return someClass.__someVar;
                        });
                    }).to.throwException(/access private/);

                    expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                __someFunc: function () {},
                                exec: function (func) {
                                    func();
                                }
                            };
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return someClass.__someFunc;
                        });
                    }).to.throwException(/access private/);

                    expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                $statics: {
                                    __someVar: 'foo'
                                },
                                exec: function (func) {
                                    func();
                                }
                            };
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return SomeClass.__someVar;
                        });
                    }).to.throwException(/access private/);

                    expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                $statics: {
                                    __someFunc: function () {}
                                },
                                exec: function (func) {
                                    func();
                                }
                            };
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return SomeClass.__someFunc;
                        });
                    }).to.throwException(/access private/);*/

                });

                it('cannot be overrided', function () {

                    expect(function () {
                        return Class.declare(SomeClass, function ($super) {
                            return {
                                __getProp: function () {}
                            };
                        });
                    }).to.throwException(/override private/);

                    expect(function () {
                        return Class.declare(SomeClass, function ($super) {
                            return {
                                __privateProperty: 'foo'
                            };
                        });
                    }).to.throwException(/override private/);

                });

            }

        });

        describe('Protected members', function () {

            var SomeClass = Class.declare(function ($self) {
                return {
                    _protectedMethod: function () {
                        this._protectedProperty = 'test';
                    }.$bound(),
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
                        return $self._SOME;
                    },
                    getConst2: function () {
                        return this.$static._SOME;
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
                };
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
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                some: function () {
                                    this._protectedMethod();
                                }
                            };
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super, $self, $parent) {
                            return {
                                some: function () {
                                    $self._funcStatic();
                                }
                            };
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                $statics: {
                                    some: function () {
                                        this._funcStatic();
                                    }
                                }
                            };
                        });
                        OtherClass.some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                some: function () {
                                    return this._protectedProperty;
                                }
                            };
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect((function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                $statics: {
                                    some: function () {
                                        return this._protectedProperty;
                                    }
                                }
                            };
                        });
                        return OtherClass.some();
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                _test: function () {}
                            };
                        });
                        return new OtherClass().callTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                $statics: {
                                    _test: function () {}
                                }
                            };
                        });
                        OtherClass.callTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                _test: 'some'
                            };
                        });
                        return new OtherClass().accessTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                $statics: {
                                    _test: 'some'
                                }
                            };
                        });
                        return OtherClass.accessTest();
                    }).to.not.throwException();

                    expect(function () {
                        var tmp = Class.declare(function () {
                                return {
                                    initialize: function () {
                                        this._test();
                                    }
                                };
                            }),
                            OtherClass = Class.declare(tmp, function ($super) {
                                return {
                                    _test: function () {}
                                };
                            });

                        return new OtherClass();
                    }).to.not.throwException();

                    expect(function () {
                        var tmp = Class.declare(function () {
                                return {
                                    initialize: function () {
                                        this._test = 'test';
                                    }
                                };
                            }),
                            OtherClass = Class.declare(tmp, function ($super) {
                                return {
                                    _test: 'some'
                                };
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
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                getProp: function () {
                                    return $super.getProp.call(this);
                                }
                            };
                        });

                        return (new OtherClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        (new SomeClass()).getProp2();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {
                                getProp2: function () {
                                    return $super.getProp2.call(this);
                                }
                            };
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

                    expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                _someVar: 'foo',
                                _someMethod: function () {},
                                test: function () {
                                    return this._someVar;
                                },
                                test2: function () {
                                    this._someMethod();
                                }
                            };
                        }), OtherClass = Class.declare(function () {
                            return {
                                $borrows: SomeClass
                            };
                        }),
                            myOtherClass = new OtherClass();

                        myOtherClass.test();
                        myOtherClass.test2();
                    }).to.not.throwException();

                    // This was commented out because under strict was temorarly removed
                    /*expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                _someVar: 'foo',
                                exec: function (func) {
                                    func();
                                }
                            };
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return someClass._someVar;
                        });
                    }).to.throwException(/access protected/);

                    expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                _someFunc: function () {},
                                exec: function (func) {
                                    func();
                                }
                            };
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return someClass._someFunc;
                        });
                    }).to.throwException(/access protected/);

                    expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                $statics: {
                                    _someVar: 'foo'
                                },
                                exec: function (func) {
                                    func();
                                }
                            };
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return SomeClass._someVar;
                        });
                    }).to.throwException(/access protected/);

                    expect(function () {
                        var SomeClass = Class.declare(function () {
                            return {
                                $statics: {
                                    _someFunc: function () {}
                                },
                                exec: function (func) {
                                    func();
                                }
                            };
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return SomeClass._someFunc;
                        });
                    }).to.throwException(/access protected/);*/

                });

            }

            it('should work well with $super()', function () {

                var OtherClass = Class.declare(SomeClass, function ($super, $self, $parent) {
                        return {
                            _getFruit: function () {
                                return 'hot ' + $super._getFruit.call(this);
                            },
                            $statics: {
                                _getFruitStatic: function () {
                                    return 'hot ' + $parent._getFruitStatic.call(this);
                                }
                            }
                        };
                    }),
                    HiClass = Class.declare(OtherClass, function ($super, $self, $parent) {
                        return {
                            _getFruit: function () {
                                return 'hi ' + $super._getFruit.call(this);
                            },
                            $statics: {
                                _getFruitStatic: function () {
                                    return 'hi ' + $parent._getFruitStatic.call(this);
                                }
                            }
                        };
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

                var Class1 = Class.declare(function () { return {}; }),
                    Class2 = AbstractClass.declare(function () { return {}; }),
                    Class3 = Class.declare(function () { return { $extends: Class1 }; }),
                    Class4 = Class.declare(function () { return { $extends: Class2 }; }),
                    Class5 = AbstractClass.declare(function () { return { $extends: Class1 }; }),
                    Class6 = Class.declare(function () { return { $extends: Class5 }; });

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

                var Interface1 = Interface.declare({}),
                    Interface2 = Interface.declare({}),
                    Interface3 = Interface.declare({}),
                    Interface4 = Interface.declare({ $extends: Interface3 }),
                    Interface5 = Interface.declare({ $extends: [Interface4, Interface1] }),
                    Interface6 = Interface5.extend({}),

                    Class1 = Class.declare(function () { return { $implements: Interface1 }; }),
                    Class2 = AbstractClass.declare(function () { return { $implements: [Interface1, Interface2] }; }),
                    Class3 = Class.declare(function () { return { $extends: Class1 }; }),
                    Class4 = Class.declare(function () { return { $extends: Class2 }; }),
                    Class5 = AbstractClass.declare(Class1, function ($super) { return { $implements: Interface3 }; }),
                    Class6 = Class.declare(function () { return { $extends: Class5 }; }),
                    Class7 = Class.declare(function () { return { $implements: [Interface2, Interface5] }; }),
                    Class8 = Class.declare(function () { return { $implements: Interface6 }; });

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
                expect(instanceOf(new Class8(), Interface5)).to.be.equal(true);

                expect(instanceOf(new Class1(), Interface2)).to.be.equal(false);
                expect(instanceOf(new Class6(), Interface4)).to.be.equal(false);

            });

        });

        describe('Anonymous functions that where bound', function () {

            var context = {},
                SomeClass = Class.declare(function () {
                    return {
                        simpleMethod: function () {
                            var func = this.$bind(function () {
                                return this;
                            });

                            return func.call(context);
                        },
                        boundTwice: function () {
                            return this.$bind(this.$bind(function () { }));
                        },
                        boundOfNamed: function () {
                            return this.$bind(this.simpleMethod);
                        },
                        someMethod: function () {
                            var func = this.$bind(function () {
                                this._protectedProperty = 'dummy';
                                this.__privateProperty = 'dummy',
                                this._protectedMethod();
                                this.__privateMethod();
                            });

                            func.call(context);
                        },
                        someMethod2: function () {
                            var func = function (x) {
                                return x;
                            }.$bind(this, 'foo');

                            return func.call(context);
                        },
                        getProtectedProperty: function () {
                            return this._protectedProperty;
                        },
                        getPrivateProperty: function () {
                            return this.__privateProperty;
                        },
                        _protectedProperty: 'some',
                        __privateProperty: 'other',
                        _protectedMethod: function () {},
                        __privateMethod: function () {},

                        $statics: {
                            simpleMethodStatic: function () {
                                var func = this.$bind(function () {
                                    return this;
                                });

                                return func.call(context);
                            },
                            someMethodStatic: function () {
                                var func = this.$bind(function () {
                                    this._protectedPropertyStatic = 'dummy';
                                    this.__privatePropertyStatic = 'dummy',
                                    this._protectedMethodStatic();
                                    this.__privateMethodStatic();
                                });

                                func.call(context);
                            },
                            someMethod2Static: function () {
                                var func = function (x) {
                                    return x;
                                }.$bind(this, 'foo');

                                return func.call(context);
                            },
                            getProtectedPropertyStatic: function () {
                                return this._protectedPropertyStatic;
                            },
                            getPrivatePropertyStatic: function () {
                                return this.__privatePropertyStatic;
                            },
                            _protectedPropertyStatic: 'some',
                            __privatePropertyStatic: 'other',
                            _protectedMethodStatic: function () {},
                            __privateMethodStatic: function () {}
                        }
                    };
                }),
                someClass = new SomeClass(),
                ReplicaClass = Class.declare(function () {
                    return {
                        simpleMethod: function () {
                            var func = function () {
                                return this;
                            }.$bind(this);

                            return func.call(context);
                        },
                        boundTwice: function () {
                            return function () {}.$bind(this).$bind(this);
                        },
                        boundOfNamed: function () {
                            return this.$bind(this.simpleMethod);
                        },
                        someMethod: function () {
                            var func = function () {
                                this._protectedProperty = 'dummy';
                                this.__privateProperty = 'dummy',
                                this._protectedMethod();
                                this.__privateMethod();
                            }.$bind(this);

                            func.call(context);
                        },
                        someMethod2: function () {
                            var func = function (x) {
                                return x;
                            }.$bind(this, 'foo');

                            return func.call(context);
                        },
                        getProtectedProperty: function () {
                            return this._protectedProperty;
                        },
                        getPrivateProperty: function () {
                            return this.__privateProperty;
                        },
                        _protectedProperty: 'some',
                        __privateProperty: 'other',
                        _protectedMethod: function () {},
                        __privateMethod: function () {},

                        $statics: {
                            simpleMethodStatic: function () {
                                var func = function () {
                                    return this;
                                }.$bind(this);

                                return func.call(context);
                            },
                            someMethodStatic: function () {
                                var func = function () {
                                    this._protectedPropertyStatic = 'dummy';
                                    this.__privatePropertyStatic = 'dummy',
                                    this._protectedMethodStatic();
                                    this.__privateMethodStatic();
                                }.$bind(this);

                                func.call(context);
                            },
                            someMethod2Static: function () {
                                var func = function (x) {
                                    return x;
                                }.$bind(this, 'foo');

                                return func.call(context);
                            },
                            getProtectedPropertyStatic: function () {
                                return this._protectedPropertyStatic;
                            },
                            getPrivatePropertyStatic: function () {
                                return this.__privatePropertyStatic;
                            },
                            _protectedPropertyStatic: 'some',
                            __privatePropertyStatic: 'other',
                            _protectedMethodStatic: function () {},
                            __privateMethodStatic: function () {}
                        }
                    };
                }),
                replicaClass = new ReplicaClass();

            if (/strict/.test(global.build))  {
                it('should throw an error if the function is not anonymous', function () {

                    expect(function () {
                        someClass.boundOfNamed();
                    }).to.throwException(/not anonymous/);

                    expect(function () {
                        replicaClass.boundOfNamed();
                    }).to.throwException(/not anonymous/);

                });

                it('should throw an error if bound twice', function () {

                    expect(function () {
                        someClass.boundOfNamed();
                    }).to.throwException(/not anonymous/);

                    expect(function () {
                        replicaClass.boundOfNamed();
                    }).to.throwException(/not anonymous/);

                });
            }

            it('should have access to the right context', function () {

                expect(someClass.simpleMethod()).to.equal(someClass);
                expect(SomeClass.simpleMethodStatic()).to.equal(SomeClass);

                expect(replicaClass.simpleMethod()).to.equal(replicaClass);
                expect(ReplicaClass.simpleMethodStatic()).to.equal(ReplicaClass);

            });

            it('should curl the parameters', function () {

                expect(someClass.someMethod2()).to.equal('foo');
                expect(SomeClass.someMethod2Static()).to.equal('foo');

                expect(replicaClass.someMethod2()).to.equal('foo');
                expect(ReplicaClass.someMethod2Static()).to.equal('foo');

            });

            it('should have access to private/protected members', function () {

                expect(function () {
                    someClass.someMethod();
                }).to.not.throwException();

                expect(someClass.getProtectedProperty()).to.equal('dummy');
                expect(someClass.getPrivateProperty()).to.equal('dummy');

                expect(function () {
                    SomeClass.someMethodStatic();
                }).to.not.throwException();

                expect(SomeClass.getProtectedPropertyStatic()).to.equal('dummy');
                expect(SomeClass.getPrivatePropertyStatic()).to.equal('dummy');

                expect(function () {
                    replicaClass.someMethod();
                }).to.not.throwException();

                expect(replicaClass.getProtectedProperty()).to.equal('dummy');
                expect(replicaClass.getPrivateProperty()).to.equal('dummy');

                expect(function () {
                    ReplicaClass.someMethodStatic();
                }).to.not.throwException();

                expect(ReplicaClass.getProtectedPropertyStatic()).to.equal('dummy');
                expect(ReplicaClass.getPrivatePropertyStatic()).to.equal('dummy');

            });

        });

        describe('Singletons', function () {

            var Singleton = Class.declare(function () {
                return {
                    foo: null,
                    _initialize: function () {
                        this.foo = 'bar';
                    },

                    $statics: {
                        getInstance: function () {
                            return new Singleton();
                        }
                    }
                };
            }),
                Singleton2 = Class.declare(function () {
                    return {
                        foo: null,
                        __initialize: function () {
                            this.foo = 'bar';
                        },

                        $statics: {
                            getInstance: function () {
                                return new Singleton2();
                            }
                        }
                    };
                }),
                SubSingleton = Class.declare(function () {
                    return {
                        $extends: Singleton
                    };
                }),
                SubSingleton2 = Class.declare(function () {
                    return {
                        $extends: Singleton2
                    };
                }),
                OtherSubSingleton = Class.declare(SubSingleton, function ($super) {
                    return {
                        $statics: {
                            getInstance: function () {
                                return new OtherSubSingleton();
                            }
                        }
                    };
                }),
                OtherSubSingleton2 = Class.declare(SubSingleton2, function ($super) {
                    return {
                        $statics: {
                            getInstance: function () {
                                return new OtherSubSingleton2();
                            }
                        }
                    };
                });

            it('should be accomplished with protected constructors', function () {

                expect(function () {
                    return Singleton.getInstance();
                }).to.not.throwException();

                expect(function () {
                    return SubSingleton2.getInstance();
                }).to.not.throwException();

                expect(function () {
                    return OtherSubSingleton.getInstance();
                }).to.not.throwException();

            });

            it('should be accomplished with private constructors', function () {

                expect(function () {
                    return Singleton2.getInstance();
                }).to.not.throwException();

                expect(function () {
                    return SubSingleton2.getInstance();
                }).to.not.throwException();

                expect(function () {
                    return OtherSubSingleton2.getInstance();
                }).to.not.throwException();

            });

        });
    });

});
