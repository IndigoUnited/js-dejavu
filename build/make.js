/*jslint node: true, nomen: true, sloppy: true*/

var cp = require('child_process'),
    fs = require('fs'),
    tests,
    command,
    distDir = __dirname + '/../dist/',
    currentDistDir,
    files,
    stat;

/**
 * Removes all files from a folder.
 *
 * @param {String} [dir="dist"] The folder, default to the dist folder
 */
function emptyDir(dir) {

    dir = !!dir ? dir : distDir;
    files = fs.readdirSync(dir);

    files.forEach(function (file) {
        if (fs.statSync(dir + file).isDirectory()) {
            emptyDir(dir + file + '/');
            fs.rmdirSync(dir + file);
        } else {
            fs.unlinkSync(dir + file);
        }
    });
}

// Clear directory
emptyDir(distDir);

// Create regular directory for later use..
fs.mkdirSync(distDir + 'regular');    // TODO: Remove this later

// Build amd strict
command = 'node "' + __dirname + '/../vendor/r.js/dist/r.js" -o ' + __dirname + '/Classify.build.js';
currentDistDir = distDir + 'amd/strict/';
cp.exec(command + ' dir="' + currentDistDir + '" pragmas.strict=true', function (error, stdout, stderr) {

    // Print success or error
    if (error !== null) {
        console.error(stderr);
        process.exit(1);
    } else {
        console.log(stdout);
    }

    fs.unlinkSync(currentDistDir + 'build.txt');

    // Build amd loose
    currentDistDir = distDir + 'amd/loose/';
    cp.exec(command + ' dir="' + currentDistDir + '" pragmas.strict=false', function (error, stdout, stderr) {

        // Print success or error
        if (error !== null) {
            console.error(stderr);
            process.exit(1);
        } else {
            console.log(stdout);
        }

        fs.unlinkSync(currentDistDir + 'build.txt');

        // Run tests
        process.chdir(__dirname + '/../test');

        command = 'mocha -R list amd/strict.js';

        console.log('Running amd/strict tests..');
        console.log('-------------------------------------------------');

        if (process.platform === 'win32') {
            tests = cp.spawn('cmd', ['/s', '/c', command], { customFds: [0, 1, 2] });
        } else {
            tests = cp.spawn('sh', ['-c', command], { customFds: [0, 1, 2] });
        }
        tests.on('exit', function (code) {

            var exitCode;

            if (code !== 0) {
                exitCode = 1;
            } else {
                exitCode = 0;
            }

            command = 'mocha -R list amd/loose.js';

            console.log('Running amd/loose tests..');
            console.log('-------------------------------------------------');

            if (process.platform === 'win32') {
                tests = cp.spawn('cmd', ['/s', '/c', command], { customFds: [0, 1, 2] });
            } else {
                tests = cp.spawn('sh', ['-c', command], { customFds: [0, 1, 2] });
            }
            tests.on('exit', function (code) {

                if (code !== 0) {
                    process.exit(1);
                } else {
                    process.exit(exitCode);
                }
            });
        });
    });
});
