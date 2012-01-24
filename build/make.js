/*jslint node: true, nomen: true, sloppy: true*/

var cp = require('child_process');
var fs = require('fs');

// Execute requirejs optimizer
cp.exec('node ' + __dirname + '/../vendor/r.js/dist/r.js -o ' + __dirname + '/Classify.build.js', function (error, stdout, stderr) {

    // Print success or error
    if (error !== null) {
        console.error(stderr);
    } else {
        console.log(stdout);
    }

    // Remove other files
    var files = fs.readdirSync(__dirname + '/../dist'),
        distDir = __dirname + '/../dist/';

    files.forEach(function (file) {
        if (file.substr(file.length - 3) === ".js" && file !== "Classify.js") {
            console.log("Deleting " + file);
            fs.unlinkSync(distDir + file);
        }
    });

    console.log("");

    // Run tests
    cp.exec('mocha ' + __dirname + '/../test/Classify.test.js', function (error, stdout, stderr) {

        // Print success or error
        if (error !== null) {
            console.error(stderr);
        } else {
            console.log(stdout);
        }
    });
});