/*jslint sloppy:true, newcap:true, nomen:true*/
/*global global,define,describe,it*/

define(global.modules, function (Class, AbstractClass, Interface, instanceOf, hasDefineProperty) {

    var expect = global.expect;

    // Uncomment the lines bellow to test a modified object prototype
    //Object.prototype.youShouldNotDoThis = function (a, b) {};
    //Object.prototype.youShouldNotDoThisAlso = 'some';

    describe('Functional:', function () {

        describe('Instantiation of a simple Class', function () {

            var Example = Class({
                Binds: ['method1', 'method2', 'method3', '_method4', '__method5'],
                some: 'property',
                someOther: null,
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

                return expect(example.Statics).to.be.equal(undefined);

            });

            it('should not have Binds property', function () {

                return expect(example.Binds).to.be.equal(undefined);

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
                    Extends: Person,
                    name: 'André'
                }),
                SuperAndre = Class({
                    Extends: Andre,
                    name: 'SuperAndre'
                }),
                PersonAbstract = AbstractClass({
                    status: null,
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

        describe('$super()', function () {

            var SomeClass = Class({
                _firstName: null,
                initialize: function () {
                    this._firstName = 'andre';
                },
                getFullName: function () {
                    return this._firstName;
                },
                Statics: {
                    _fruit: 'potato',
                    getFruit: function () {
                        return this._fruit;
                    }
                }
            }),
                OtherClass = Class({
                    Extends: SomeClass,
                    _lastName: null,
                    initialize: function () {
                        this.$super();
                        this._lastName = 'cruz';
                    },
                    getFullName: function () {
                        return this.$super() + ' ' + this._lastName;
                    },
                    Statics: {
                        getFruit: function () {
                            return 'hot ' + this.$super();
                        }
                    }
                }),
                HiClass = Class({
                    Extends: OtherClass,
                    getFullName: function () {
                        return 'hi ' + this.$super();
                    },
                    Statics: {
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
                initialize: function () {
                    this.$self()._fruit = 'orange';
                },
                getFruit: function () {
                    return this.$self().getFruitStatic();
                },
                Statics: {
                    _fruit: 'potato',
                    getFruitStatic: function () {
                        return this._fruit;
                    }
                }
            }),
                OtherClass = Class({
                    Extends: SomeClass,
                    initialize: function () {
                        this.$super();
                    },
                    getFruit: function () {
                        return this.$self().getFruitStatic();
                    },
                    Statics: {
                        _fruit: 'potato',
                        getFruitStatic: function () {
                            return this._fruit;
                        }
                    }
                });

            it('should give access the static layer of itself', function () {

                expect(new SomeClass().getFruit()).to.be.equal('orange');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(new OtherClass().getFruit()).to.be.equal('potato');
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
                Statics: {
                    _fruit: 'potato',
                    getFruitStatic: function () {
                        return this._fruit;
                    }
                }
            }),
                OtherClass = Class({
                    Extends: SomeClass,
                    initialize: function () {
                        this.$super();
                    },
                    getFruit: function () {
                        return this.$static().getFruitStatic();
                    },
                    Statics: {
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
                Statics: {
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
                Extends: Pet,
                initialize: function () {
                    this.name = 'Cat';
                    this.$super();
                },
                walk: function () {
                    this.position += 1;
                    this.$super();
                },
                Statics: {
                    getMaxAge: function () {
                        return 20;
                    }
                }
            });

            cat = new Cat();

            pet.walk();
            cat.walk();

            it('should be an instance of Pet', function () {

                expect(pet).to.be.a(Pet);
                expect(cat).to.be.a(Pet);
                expect(cat).to.be.a(Cat);

            });

            it('should not have the Extends property', function () {

                return expect(cat.Extends).to.be.equal(undefined);

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

            it('should not have the Implements property', function () {

                var SomeImplementation = Class({
                    Implements: [Interface({ method1: function () {}})],
                    method1: function () {}
                }),
                    someImplementation = new SomeImplementation();

                return expect(someImplementation.Implements).to.be.equal(undefined);
            });

        });

        describe('Instantiation of Concrete Classes that extend Abstract Classes', function () {

            it('should not have the Abstracts property', function () {

                var SomeImplementation = Class({
                    Extends: AbstractClass({ Abstracts: { method1: function () {} }}),
                    method1: function () {}
                }),
                    someImplementation = new SomeImplementation();

                return expect(someImplementation.Abstracts).to.be.equal(undefined);
            });

        });

        describe('Defining a Concrete/Abstract Classes that use Borrows (mixins)', function () {

            it('should grab the borrowed members to their own', function () {

                (function () {
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
                            Borrows: Class({
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
                    
                }());
                
                (function () {
                    var SomeImplementation = Class({
                        Borrows: {
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
                        Borrows: {
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
                    method2 = function () {},
                    SomeOtherClass = Class({
                        Borrows: [SomeMixin, OtherMixin],
                        method1: method1,
                        Statics: {
                            staticMethod1: method2
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
                expect(SomeOtherClass.staticMethod1).to.be.equal(method2);

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
                        Borrows: Class({ initialize: function () { this.some = 'nooo'; } }),
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

        describe('Private members', function () {

            var SomeClass = Class({
                Binds: ['__privateMethod'],
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
                accessStatic: function () {
                    return SomeClass.__propStatic();
                },
                __getProp: function () {
                    this.__privateMethod();
                    return this.__privateProperty;
                },
                Statics: {
                    callTest: function () {
                        this.__test();
                    },
                    accessTest: function () {
                        return this.__test;
                    },
                    __funcStatic: function () {},
                    __propStatic: 'property'
                }
            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should not be available in the prototype', function () {

                    expect(SomeClass.prototype.__func).to.be.equal(undefined);
                    expect(SomeClass.prototype.__prop).to.be.equal(undefined);

                });

            }

            it('should not be copied to the constructor if they are static', function () {

                expect((function () {
                    var OtherClass = Class({
                        Extends: SomeClass
                    });
                    return OtherClass.__funcStatic;
                }())).to.be.equal(undefined);

                expect((function () {
                    var OtherClass = Class({
                        Extends: SomeClass
                    });
                    return OtherClass.__propStatic;
                }())).to.be.equal(undefined);

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should only be available to self', function () {

                    expect((function () {
                        var OtherClass = Class({
                            Extends: SomeClass
                        });
                        return OtherClass.__funcStatic;
                    }())).to.be.equal(undefined);

                    expect((function () {
                        var OtherClass = Class({
                            Extends: SomeClass
                        });
                        return OtherClass.__propStatic;
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            some: function () {
                                this.__privateMethod();
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            some: function () {
                                SomeClass.__funcStatic();
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            Statics: {
                                some: function () {
                                    this.__funcStatic();
                                }
                            }
                        });
                        OtherClass.some();
                    }).to.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            some: function () {
                                return this.__privateProperty;
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            some: function () {
                                return SomeClass.__propStatic;
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect((function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            Statics: {
                                some: function () {
                                    return this.__privateProperty;
                                }
                            }
                        });
                        return OtherClass.some();
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            __test: function () {}
                        });
                        return new OtherClass().callTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            Statics: {
                                __test: function () {}
                            }
                        });
                        OtherClass.callTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            __test: 'some'
                        });
                        return new OtherClass().accessTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            Statics: {
                                __test: 'some'
                            }
                        });
                        return OtherClass.accessTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: Class({
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
                            Extends: Class({
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
                        (new SomeClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
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
                            Extends: SomeClass,
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

                });

                it('cannot be overrided', function () {

                    expect(function () {
                        return Class({
                            Extends: SomeClass,
                            __getProp: function () {}
                        });
                    }).to.throwException(/override private/);

                    expect(function () {
                        return Class({
                            Extends: SomeClass,
                            __privateProperty: 'foo'
                        });
                    }).to.throwException(/override private/);

                });

            }

        });

        describe('Protected members', function () {

            var SomeClass = Class({
                Binds: ['_protectedMethod'],
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
                Statics: {
                    callTest: function () {
                        this._test();
                    },
                    accessTest: function () {
                        return this._test;
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
                            Extends: SomeClass,
                            some: function () {
                                this._protectedMethod();
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            some: function () {
                                this.$self()._funcStatic();
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            Statics: {
                                some: function () {
                                    this._funcStatic();
                                }
                            }
                        });
                        OtherClass.some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            some: function () {
                                return this._protectedProperty;
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect((function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            Statics: {
                                some: function () {
                                    return this._protectedProperty;
                                }
                            }
                        });
                        return OtherClass.some();
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            _test: function () {}
                        });
                        return new OtherClass().callTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            Statics: {
                                _test: function () {}
                            }
                        });
                        OtherClass.callTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            _test: 'some'
                        });
                        return new OtherClass().accessTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
                            Statics: {
                                _test: 'some'
                            }
                        });
                        return OtherClass.accessTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: Class({
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
                            Extends: Class({
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
                        (new SomeClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class({
                            Extends: SomeClass,
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
                            Extends: SomeClass,
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

                });

            }

            it('should work well with $super()', function () {

                var OtherClass = Class({
                        Extends: SomeClass,
                        _getFruit: function () {
                            return 'hot ' + this.$super();
                        },
                        Statics: {
                            _getFruitStatic: function () {
                                return 'hot ' + this.$super();
                            }
                        }
                    }),
                    HiClass = Class({
                        Extends: OtherClass,
                        _getFruit: function () {
                            return 'hi ' + this.$super();
                        },
                        Statics: {
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
                    Class3 = Class({ Extends: Class1 }),
                    Class4 = Class({ Extends: Class2 }),
                    Class5 = AbstractClass({ Extends: Class1 }),
                    Class6 = Class({ Extends: Class5 });

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
                    Interface5 = Interface({ Extends: [Interface4, Interface1] }),
                    Class1 = Class({ Implements: Interface1 }),
                    Class2 = AbstractClass({ Implements: [Interface1, Interface2] }),
                    Class3 = Class({ Extends: Class1 }),
                    Class4 = Class({ Extends: Class2 }),
                    Class5 = AbstractClass({ Extends: Class1, Implements: Interface3 }),
                    Class6 = Class({ Extends: Class5 }),
                    Class7 = Class({ Implements: [Interface2, Interface5] });

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
