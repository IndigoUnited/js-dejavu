Build Classify
======================================================

---

To build Classify you:

* Need to install nodejs (http://nodejs.org)
* Need to install mocha (npm install -g mocha)
* Run build/make.js

This will produce two kind of builds in the dist folder: a normal build and a no-checks build.

The build to be used while developing should be the Classify.js file.
It has all the validations and checks enabled to ensure that your classes are structured and working as expected.

The build to be used in production should be the Classify.no-checks.js file.
All the overhead introduced with the validations and checks from the normal build is removed.
If all your classes are working fine in the normal build then it's safe to use it.

Note that both builds have also the correspondent minified file.