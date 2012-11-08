# dejavu #

---

[![Build Status](https://secure.travis-ci.org/IndigoUnited/dejavu.png)](http://travis-ci.org/IndigoUnited/dejavu)

Have you ever had the feeling that you're seeing something you've already seen
before? That's the feeling you get when using `dejavu`.

If you are a developer coming from a language like PHP, Java, ActionScript 3.0,
and others, it's likely that you are already familiar with Object Oriented
Programming. However, JavaScript uses prototypal inheritance which, although
powerful and flexible, can be difficult to understand, and specially to maintain
in large projects.

`dejavu` is a library that delivers classical inheritance on top of JavaScript
prototypal inheritance, making it a breeze to move into JavaScript.



## Why another? ##

There are some libraries out there able to shim classical inheritance,
however none offers all the functionality that many programmers require.

Plus, performance and testing round-trips are really important for developers,
which is why `dejavu` is built on top of
[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD). Also, even though being one
of the most feature rich OOP libraries out there, it has one of the best
performances, rivaling with vanilla JS in production.



## Features ##

* Classical inheritance
* Abstract classes
* Interfaces
* Mixins (so you can get some sort of multiple inheritance)
* Private and protected members (access is only managed when Object.defineProperty is available)
* Static members
* Constants
* Ability to declare true singletons via protected/private constructors
* Context binding for functions (useful for functions that will be used as
  callbacks/handlers)
* Method signature checks
* Custom instanceOf with support for Interfaces
* Classes and instances are locked by default
    * Functions cannot be added, replaced or deleted
    * Properties can only be modified
* Two builds, `regular` and `AMD` based
    * `AMD` optimized for speeding up developer workflow, allowing testing
      without the need to re-compile everything into a single file
    * `regular` if you are not using `AMD` in your projects
* Two modes for each build, `strict` and `loose`
    * `strict` best in development, enforcing a lot of checks, making sure you
      don't make many typical mistakes
    * `loose` best for production, without checks, improving performance
* Possible to extend or borrow vanilla classes

Users are encouraged to declare
['use strict'](https://developer.mozilla.org/en/JavaScript/Strict_mode) while
using the `dejavu` in strict mode, otherwise some code might fail silently.

This can happen because `dejavu` uses `Object.freeze` and `Object.seal` to lock
classes and instances, guaranteeing that no one changes the behaviour of your
classes by replacing methods, etc, and possibly breaking your code, making it
really hard to pin point what's wrong.

**Do not confuse 'use strict' with the dejavu strict mode.**


## Works on ##

* IE (6+?)
* Chrome (4+?)
* Safari (3+?)
* Firefox (3.6+?)
* Opera (9+?)
* Node.js and Rhino

Since the regular build is compatible with CommonJS modules, it works well with
[Node.js](http://nodejs.org/) and
[Rhino](https://developer.mozilla.org/en-US/docs/Rhino).



## Getting started ##

The quickest way to start using `dejavu` in your project, is by simply including
`dist/regular/strict/dejavu.js` (note that this is in __strict__ mode).

If you're developing a __client-side__ app, simply put the file in some folder,
and include it in the HTML:

```
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <script type="text/javascript" src="dejavu.js"></script>
    </head>
    <body>
        <script type="text/javascript">
            'use strict';

            // declare the "Person" class
            var Person = dejavu.Class.declare({
                _name: null,

                initialize: function(name) {
                    this.setName(name);
                },

                setName: function(name) {
                    this._name = name;

                    return this;
                },

                getName: function() {
                    return this._name;
                }
            });

            // create a new instance of person
            var indigo = new Person('Marco');
            console.log('A new indigo was born,', indigo.getName());
        </script>
    </body>
</html>
```

This will make a `dejavu` global available for you.
If you're developing in __Node.js__, install it with `npm install dejavu` and use it like so:

```
// in this case, dejavu.js is in the root folder of the project
var dejavu = require('dejavu');

// declare the "Person" class
var Person = dejavu.Class.declare({
    _name: null,

    initialize: function(name) {
        this.setName(name);
    },

    setName: function(name) {
        this._name = name;

        return this;
    },

    getName: function() {
        return this._name;
    }
});

// create a new instance of person
var indigo = new Person("Marco");
console.log("A new indigo was born,", indigo.getName());
```

The default mode running will be the strict mode unless the STRICT environment variable is set to false.
Environment variables can be changed system wide or per process like so:

```
process.env.STRICT = false;
```

Read further in order to check the syntax of `dejavu`, and also to check what
is exactly supported.



## Performance ##

Since all those nice features and common rules of classic OOP degrade
performance, `dejavu` has two separates modes, for different stages in the
development.

The `strict` mode is suitable for __development__, and will do all sorts of
checks, throwing an error when you try to do something considered illegal.

**Note that if your project works in strict mode, it will work in loose mode.**

As for the `loose` mode, there is no overhead associated with checks, thus
making it suitable for __production__, since it will be more efficient and
have a __lower memory footprint and filesize__.

Finally, in order to achieve that extra edge, that puts `dejavu` next to vanilla
JS in terms of performance, you should run the optimizer that is bundled with
the library. Note that this step is completely optional, and `dejavu` will still
perform faster than the other libraries in most browsers, even if you don't run
the optimizer. The optimizer will analyse your code, and make some improvements
boosting it a bit further.

You can check the benchmarks in [jsperf](http://jsperf.com/oop-benchmark/58)
comparing `dejavu` with other OOP libraries. Note that the loose mode
is used in this test, simulating a production environment, and both the normal
and optimized versions are tested.



## Taking it to another level

If you're an [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) fan, and just
want to require specific parts of `dejavu`, you can do so.

Please note that this is only useful if you're developing something that
absolutely can't live with those extra bytes, and it will be at the expense of
having to keep closer attention to what you need exactly.

The AMD approach is usually more useful for your own code, since you don't have
to keep building your project into a monolithic file, after editing a single
line in one of the dozens of files that compose the project, thus speeding up
testing round-trips.

Still, if you really want to have a full-blown AMD set up, and by this you mean
having not only your code using an AMD philosophy, but also `dejavu` code, these
are the modules you can include:

* Interface
* AbstractClass
* Class
* FinalClass
* instanceOf
* options

Here's an example requiring `dejavu` selectively, using an AMD approach:

```
define([
    'path/to/Human',
    'path/to/TalkInterface',
    'path/to/dejavu/Class'
],
function (Human, TalkInterface, Class) {

    var Person = Class.declare({
        $extends: Human,
        $implements: [TalkInterface],

        /**
         * class constructor.
         */
        initialize: function (name) {
            // call super
            this.$super(name);

            // greet the universe
            this._say("Hi universe! I'm " + this.name);
        },

        _say: function (message) {
            // implementation
        },

    });

    return Person;
});
```

As you can see, in this case, only the `Class` module of `dejavu` is included,
which means all the other modules are not loaded.

You can find these modules in `dist/amd/strict`, for strict mode, and
`dist/amd/loose`, for loose mode.



## Syntax

### Class ###

Classes are simply defined as we can see below:

```
var Person = Class.declare({
    
    // public property
    isIndigo: null,
    
    // protected properties (starts with _)
    _name: null,
    
    // private properties (starts with __)
    __textBiography: null
    
    /**
     * Class constructor.
     */
    initialize: function () {
        
        // Call super
        this.$super();
        
        // Do other stuff
    },

    // public methods
    setName: function (name) {
        this._name = name;
    },
    
    getName: function () {
        return this._name; 
    },
    
    // protected method (starts with _)
    _getBiography: function (text) {
        return this.__composeBiography(this.__textBiography);
    },
    
    // private method (starts with __)
    __composeBiography (text) {
        return text + ' :: under the IndigoUnited License';
    }
});

```
Classes can extend other classes or abstract classes, as well as implement several interfaces.
They differ from abstract classes in the way that they can't have abstract methods.

```
var Person = Class.declare({

    // extends classes 
    $extends: SomeClass,
    
    // implements interfaces - multiple interfaces should be specified as array
    // $implements: [PersonInterface, IndigoInterface]
    
    $implements: PersonInterface
    
    // use mixins - multiple mixins should be specified as array
    $borrows: Indigo, 

    // define static properties and methos
    $statics: {
        // Some class static members
    },
    
    // define constants
    $constants: {
        FOO: 'bar'
        BAR: 'foo'
    },
});

```

### Abstract classes ###

Classes defined as abstract may not be instantiated, and any class that contains at least one abstract method must also be abstract.

Methods defined as abstract simply declare the method's signature.
When an abstract class implements an interface and doesn't implement some of its methods, those will be automatically declared as abstract.

Below there is an example of an abstract class.

```
var AbstractPerson = AbstractClass.declare({
    
    initialize: function (argument1) {
        // this is the constructor
        // calling new on an abstract class will throw an error
        // though a class that extends this abstract class will run this constructor if called
    },

    
    getName: function (name) {
        // Implementation goes here
    },

    // here you can define abstract methods
    $abstracts: {

        // you can define abstract methods
            
        $statics: {
            // you can also define abstract static methods
        }
    }
});
```

Abstract classes can extend other abstract classes or concrete classes while implementing other interfaces.

A(n) (abstract) class can extend a another one with extend function, as shown above:

```
var Person = AbstractPerson.extend({

    // class definition
});
```

### Interface definition ###

Object interfaces allow you to create code which specifies which methods a class must implement, without having to define how these methods are handled.

Below there's an example:

```
var PersonInterface = Interface.declare({

    // public methods
    setName: function (name) {},

    // protected method
    _setAge: function (age) {},
        
    // private method
    __composeBiography: function (text) {}

});
```

Interfaces can extend multiple interfaces. 

They can also define static functions signature.
Be aware that all functions must obey its base signature (see explanation later in this document).

```
var ExtendedInterface = Interface.declare({
    $extends: PersonInterface,   
    // Interfaces can extend multiple ones, just reference them in an array

    $statics: {
        // this is how you can define statics
        getBiography: function () {}
    }

});
```
Alternatively, one can extend an interface with the extend() function. The equivalent code of the shown above is:

```
var SomeEventsInterface = EventsInterface.extend(

    $statics: { 
        // this is how you can define statics
        getTotalListeners: function () {}
    }

});
```


A class that implements an interface must define all the interface methods and be compatible with their signature.

You define that a class implements an interface by specifying it in the $implements keyword.
The $implements keyword can be an interface or an array of interfaces.



### Mixins ###

A mixin is a class or object that provides a certain functionality to be reused by other classes, since all their members will be copied (expect for the initialize method).

If clashes occur with multiple mixins, that last one takes precedence.



### Binds ###

The $bound() function allows you to bind a function to the instance.
This is useful if certain functions are meant to be used as callbacks or handlers.
You don't need to bind the function manually, it will be bound for you automatically.

```
var Person = Class.declare({

    /**
     * Constructor.
     */
     initialize: function (element) {
         element.addEventListener('click', this._handleClick);
     },

    /**
     * Handles some click event.
     */
     handleClick: function () {
         console.log('is indigo');
     }.$bound()
});
```

Alternatively, one can use anonymous functions and bind them to the instanjsce to preserve the context as well as allowing private/protected methods invocations.

```
var PersonClass = Class.declare({

    /**
     * Constructor.
     */
    initialize: function (element) {
        
        // you can use the $bind
        element.addEventListener('click', function () {
        
            console.log('is indigo');
            this._doSomething();
            
        }.$bind(this)); 

        // or use the this.$bind (same behavior as above)
        element.addEventListener('keyup', this.$bind(function () {
        
                console.log('indigo key was pressed');
                this._doSomething(); 
        });
    },

    /**
     * Some protected method
     */
     _doSomething: function () {
         // ..
     }
});
```


### Constants ###

The $constants keyword allows you to defined constants.
If Object.defineProperty is available, any attempt to modify the constant value will throw an error (only in thjse strict mode).
Constants can be defined in classes, abstract classes and interfaces.

```
var Person = Class.declare({

    $constants: {
        INDIGOS: 'nice dudes'
    },

    /**
     * Class constructor.
     */
    initialize: function () {
        
        this.$self.INDIGOS;
        
        // same behaviour as above
        Person.INDIGOS;     
    }
});

Person.INDIGOS; // 'nice dudes' :)
```


### Final members/classes ###

Final classes cannot be extended.

```
// This class cannot be extended
var Indigo = FinalClass.declare({    

    initialize: function () {
        // ...
    }
});
```
Members that are declared as final cannot be overriden by js child class.

```
var Indigo = Class.declare({

    initialize: function () {
        // ...
    },

    // classes that extend this one are not allowed to override the members below
    $finals: {

        getName: function () {
            // ...
        },
        description: 'dreamers',

        // you can also define static methods as final
        $statics: {             
            getBiography: function () {
                // ...
            },
        license: 'IndigoUnited License'
    }
});

```

### Protected and private members ###

Protected and private members should be prefixed with _ and __ respectively.
If Object.defineProperty is available, it will be used to manage their access (only in the strict mode).



### Signature check ###

All functions are virtual functions, therefore they can be overriden except if it's classified as final.
additionally, if a method is abstract, a subclass can only implement/override it if they obey their signature (must be equal or augmented with additional optional arguments).

Arguments prefixed with a $ are evaluated as optional. The signature check done for all abstract functions (interface functions are also considered abstract).

```
var AbstractPerson = AbstractClass.declare({
    $abstracts: {
        setName: function (name) {}
    }
});
```

Signature is equal, so it's valid.

```
var Indigo = Class.declare({
    $extends: AbstractPerson,

    setName: function (name) {             
        // ...
    }
});
```

Although it's signature is not equal, was augmented with an additional optional argument, so it's valid too.

```
var Indigo = Class.declare({
    $extends: AbstractPerson,

    setName: function (name, $last_name) {
        // ...
    }
});

```
Next example, will thrown an error because they have different signatures.
```

var Indigo = Class.declare({
    $extends: AbstractPerson,

    // setName(name) is not compatible with setName(name, last_name)
    setName: function (name, last_name) {
        // ...
    }
});
```


### Calling static methods within an instance ###

To call static methods inside an instance you can use $self and $static.

$self gives access to the class itself and $static gives access to the called class in ajs context of static inheritance.

$self is the same as using the class variable itself.

```
var Indigo1 = Class.declare({
    
    getName: function () {
        
        // same as Filipe.name;
        return this.$self.name;
    },
    $statics: {
        name: 'Marco'
    }
});

```

```
var Indigo2 = Class.declare({
    getName: function () {
        return this.$static.name;
    },
    $statics: {
        name: 'Andre'
    }
});

```

```
var Indigo3 = Class.declare({
    $extends: Indigo1
    $statics: {
        bar: 'Filipe'
    }
});

```

```
var Indigo4 = Class.declare({
    $extends: Indigo2
    $statics: {
        bar: 'Filipe'
    }
});

```

```
Indigo3.getName(); // Marco
Indigo4.getName(); // Filipe
```



### instanceOf ###

The instanceOf function works exactly the same way as the native instanceof except that it also works for interfaces.



### Notes ##

Please avoid using object constructors for strings, objects, booleans and numbers:

```
var Person = Class.declare({

    // don't use this
    indigo: new String('Filipe'),
    
    // ok
    indigo: 'Filipe'
});
```

###  Classes and instances are locked ###

By default, constructors and instances are locked. This means that no one can monkey patch your code.

This behaviour can be changed in two ways:

#### With the $locked flag:

```
var UnlockedIndigo = Class.declare({
    $locked: false

    initialize: function () {
        
        // Altough the foo property is not declared,
        // it will not throw an error
        
        this.name = 'Filipe';           
                                    
    },

    talk: function () {
        console.log('An indigo is talking!');
    }
});
```

Methods can be replaced in the prototype

```
UnlockedIndigo.prototype.talk = function () {

    console.log('... now is running');
};
```

Properties can be added to the instance and methods can be replace in the instance.

```
var Filipe = new UnlockedIndigo();

Filipe.friends = ['Marco','Andre'];

Filipe.talk = function () { 
    console.log('I'm talking about DejaVu!');
};
```

#### By setting the global option:

This will change the default behaviour, but classes can still override it with the $locked flag.

```
dejavu.options.locked = false;
```

Note that once a class is unlocked, its subclasses cannot be locked.
Also, although undeclared members are allowed, they will not have their access controlled (they are interpreted as public).
### Notes ###

Please avoid using object constructors for strings, objects, booleans and numbers:

```
var MyClass = Class.declare({
    foo: new String('bar'),  // Don't use this
    foz: 'bar'               // Ok
});
```

## Vanilla classes ##

DejaVu allows you to extend or borrow vanilla classes. In this case, constructors and instances are UNLOCKED by default.

```
function Person(name) {

    this.name = name;
};

var filipe = new Person('Filipe');


filipe.name  // Filipe

```

Now you can add a new function to Person.

```
Person.prototype.monkey = function () {
    console.log(this.name + ' can monkey patching the code!');
}


filipe.monkey()  // Filipe can monkey patching the code!
```


## Dependencies ##

dejavu depends on [amd-utils](https://github.com/millermedeiros/amd-utils).
If you use the regular build, you don't need to worry because all functions used from amd-utils are bundled for you.
If you use the AMD build, you must specijsfy the path to amd-utils.
For example, if you use [RequireJS](http://requirejs.org/):

```
paths : {
    'amd-utils': '../vendor/amd-utils/src'
},

packages: [
    {
        name: 'dejavu'
        location: '../../dist/amd/strict',
    }
]
```



## Building dejavu ##

Simply run `npm install` to install all the tools needed.
Then just run `npm run-script build` or `node build`.


## Testing dejavu ##

Please take a look at the [test](https://github.com/IndigoUnited/dejavu/tree/master/test) section.



## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).