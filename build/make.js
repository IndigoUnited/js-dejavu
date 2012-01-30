/*jslint node: true, nomen: true, sloppy: true*/

var cp = require('child_process'),
    fs = require('fs'),
    tests,
    command,
    exitCode = 0,
    distDir = __dirname + '/../dist/',
    files,
    withChecks = process.argv[2] !== '--no-checks';

// Delete previous files
files = fs.readdirSync(distDir);
files.forEach(function (file) {
    fs.unlinkSync(distDir + file);
});

// Execute requirejs optimizer
cp.exec('node ' + __dirname + '/../vendor/r.js/dist/r.js -o ' + __dirname + '/Classify.' + (withChecks ? '' : 'no-checks.') + 'build.js', function (error, stdout, stderr) {

    // Print success or error
    if (error !== null) {
        console.error(stderr);
        exitCode = 1;
    } else {
        console.log(stdout);
    }

    // Remove other files
    var files = fs.readdirSync(__dirname + '/../dist'),
        distDir = __dirname + '/../dist/';

    files.forEach(function (file) {
        if (file.substr(file.length - 3) === '.js' && file !== 'Classify.js') {
            fs.unlinkSync(distDir + file);
        }
    });

    // Exit if something went badly
    if (exitCode) {
        process.exit(exitCode);
    }

    // Run tests
    command = 'mocha -R list ' + __dirname + '/../test/Classify.functional.js';
    if (withChecks) {
        command += ' && mocha -R list ' + __dirname + '/../test/Classify.verifications.js';
    }

    if (process.platform === 'win32') {
        tests = cp.spawn('cmd', ['/s', '/c', command], { customFds: [0, 1, 2] });
    } else {
        tests = cp.spawn('sh', ['-c', command], { customFds: [0, 1, 2] });
    }
    tests.on('exit', function (code) {

        if (code !== 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
});
