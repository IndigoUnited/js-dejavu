/*jslint sloppy:true nomen:true newcap:true*/
/*global require,describe,it,navigator,document,__dirname,window*/

var requirejs,
    modules = ['Trinity/Classify'],
    expectAlias;

if (!(typeof window !== 'undefined' && navigator && document)) { // Test if we are at command line

    requirejs = require('../vendor/r.js/dist/r.js');

    requirejs.config({
        baseUrl: __dirname,
        paths: {
            'Trinity/Classify': '../dist/Classify'
        },
        nodeRequire: require
    });

    var define = requirejs;
    modules.push('../vendor/expect.js/expect.js');
} else {
    /*jslint undef:true*/
    expectAlias = expect;
    /*jslint undef:false*/
}

define(modules, function (Classify, expect) {

    if (expectAlias) {
        expect = expectAlias;
    }

    describe('Simple instantiation of a Class', function () {

        var Example = Classify({
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
            expect(example.method2).to.not.be.equal(Example.prototype.method);    // Because it was bound
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

            return expect(example.Statics).to.not.be.ok;

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

        var Person = Classify({
            initialize: function () {
                this.status = 'alive';
            }
        }),
            Andre = Classify({
                Extends: Person,
                name: 'André'
            }),
            SuperAndre = Classify({
                Extends: Andre,
                name: 'SuperAndre'
            }),
            PersonAbstract = Classify.Abstract({
                initialize: function () {
                    this.status = 'alive';
                }
            }),
            AndreAbstract = Classify.Abstract({
                Extends: PersonAbstract,
                name: 'André'
            }),
            SuperAndre2 = Classify({
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

        var Pet = Classify({
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
            Cat = Classify({
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

        it('should have inherited the static methods', function () {

            expect(Cat.getNrPets).to.be.a('function');

        });

        it('should not have inherited already defined static methods', function () {

            expect(Pet.getMaxAge()).to.be.equal(50);
            expect(Cat.getMaxAge()).to.be.equal(20);

        });

    });

    describe('Instantiation of Concrete Classes that implement Interfaces', function () {

        it('should not have the Implements property', function () {

            var SomeImplementation = Classify({
                Implements: [Classify.Interface({ method1: function () {} })],
                method1: function () {}
            }),
                someImplementation = new SomeImplementation();

            return expect(someImplementation.Implements).to.not.be.ok;
        });
    });

    describe('Instantiation of Concrete Classes that extend Abstract Classes', function () {

        it('should not have the Abstracts property', function () {

            var SomeImplementation = Classify({
                Extends: Classify.Abstract({ Abstracts: { method1: function () {} }}),
                method1: function () {}
            }),
                someImplementation = new SomeImplementation();

            return expect(someImplementation.Abstracts).to.not.be.ok;
        });

    });

});
