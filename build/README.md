# Building Classify #

In order to build Classify you need some tools.
The build process will create two kind of builds: AMD and regular.

## Tools needed ##

1. [nodejs](http://nodejs.org)
2. [mocha](http://visionmedia.github.com/mocha/) (npm install -g mocha)

Then just run build/make.js on node (node build/make.js).
This will create the builds described bellow in the [dist](https://github.com/TrinityJS/Classify/tree/master/dist) folder.
Also the tests are automatically executed at the end of the build process.

## AMD Build ##

The [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) build is located in the [dist/amd](https://github.com/TrinityJS/Classify/tree/master/dist/amd) folder.
There are two versions available: __strict__ and __loose__.

The __strict__ version has all kind of validations to ensure that your classes are well defined and obey all the common rules of classic inheritance.
It should be only used while developing because all those validations degrade performance.

The __loose__ build has all the overhead of validations removed. If your classes work in the strict version, then they will work flawlessly in the loose build. This build should be used in production for maximum performance.

## Regular Build ##

The regular build is a standalone file that has all the functionality built in (comming soon).
