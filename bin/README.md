# Building dejavu #

The build process will create two kind of builds: AMD and regular.

## Tools needed ##

Simply run `npm install` to install all the tools needed.
Then just run `npm run-script build`.
This will create the builds described bellow in the [dist](https://github.com/IndigoUnited/dejavu/tree/master/dist) folder.
Also the tests are automatically executed at the end of the build process.

## AMD Build ##

The [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) build is located in the [dist/amd](https://github.com/IndigoUnited/dejavu/tree/master/dist/amd) folder.
There are two versions available: __strict__ and __loose__.

The __strict__ version has all kind of validations to ensure that your classes are well defined and obey all the common rules of classic inheritance.
It should be only used while developing because all those validations degrade performance.

The __loose__ build has all the overhead of validations removed. If your classes work in the strict version, then they will work flawlessly in the loose build. This build should be used in production for maximum performance.

## Regular Build ##

The regular build is a standalone file that has all the functionality built in.
All the functionality is wrapped in the global dejavu (e.g.: Class is available through dejavu.Class).
Similar to the AMD build, there is a strict and loose build.
The loose build is already minified (with uglify).
