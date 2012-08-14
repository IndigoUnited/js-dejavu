/*jshint node:true*/

'use strict';

var cp = require('child_process'),
    fs = require('fs'),
    tests,
    command,
    distDir = __dirname + '/../dist/',
    mochaBin,
    currentDistDir,
    currentBuild,
    files,
    stat;

/**
 * Removes all files from a folder.
 *
 * @param {String} [dir="dist"] The folder, default to the dist folder
 */
function emptyDir(dir) {

    dir = !!dir ? dir : distDir;

    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return;
    }

    files.forEach(function (file) {
        if (fs.statSync(dir + file).isDirectory()) {
            emptyDir(dir + file + '/');
            fs.rmdirSync(dir + file);
        } else {
            fs.unlinkSync(dir + file);
        }
    });
}

// Find mocha binary
// We use statSync instead of existsSync because it is in path package in older node versions and in fs package in earlier ones
try {
    fs.statSync(__dirname + '/../node_modules/.bin/mocha');
    mochaBin = __dirname + '/../node_modules/.bin/mocha';
} catch (e) {
    mochaBin = 'mocha';
}

// Clear directory
emptyDir(distDir);

// Build amd strict
currentBuild = 'amd';
command = 'node "' + __dirname + '/../vendor/r.js/dist/r.js" -o ' + __dirname + '/dejavu.build_' + currentBuild + '.js';
currentDistDir = distDir + 'amd/strict/';
cp.exec(command + ' dir="' + currentDistDir + '" pragmas.strict=true useStrict=true', function (error, stdout, stderr) {
    // Print success or error
    if (error !== null) {
        console.error(stderr);
        process.exit(1);
    } else {
        console.log(stdout);
    }

    fs.unlinkSync(currentDistDir + 'build.txt');
    fs.unlinkSync(currentDistDir + 'dejavu.js');

    // Build amd loose
    currentDistDir = distDir + 'amd/loose/';
    cp.exec(command + ' dir="' + currentDistDir + '" pragmas.strict=false useStrict=true', function (error, stdout, stderr) {

        // Print success or error
        if (error !== null) {
            console.error(stderr);
            process.exit(1);
        } else {
            console.log(stdout);
        }

        fs.unlinkSync(currentDistDir + 'build.txt');
        fs.unlinkSync(currentDistDir + 'dejavu.js');

        // Delete empty files
        files = fs.readdirSync(currentDistDir + 'common');
        files.forEach(function (file) {
            file = currentDistDir + 'common/' + file;
            var content = fs.readFileSync(file);
            if ((/^\s*$/).test(content.toString())) {
                fs.unlinkSync(file);
            }
        });

        // Create regular directories
        fs.mkdirSync(distDir + 'regular');
        fs.mkdirSync(distDir + 'regular/loose');
        fs.mkdirSync(distDir + 'regular/strict');

        // Build regular loose
        currentBuild = 'regular';
        command = 'node "' + __dirname + '/../vendor/r.js/dist/r.js" -o ' + __dirname + '/dejavu.build_' + currentBuild + '.js';
        currentDistDir = __dirname + '/../tmp/';

        emptyDir(currentDistDir);

        cp.exec(command + ' dir="' + currentDistDir + '" optimize=uglify pragmas.strict=false', function (error, stdout, stderr) {

            // Print success or error
            if (error !== null) {
                console.error(stderr);
                process.exit(1);
            } else {
                console.log(stdout);
            }

            // Move concatenated file
            fs.renameSync(currentDistDir + 'dejavu.js', distDir + 'regular/loose/dejavu.js');

            emptyDir(currentDistDir);

            cp.exec(command + ' dir="' + currentDistDir + '" pragmas.strict=true useStrict=true', function (error, stdout, stderr) {

                // Print success or error
                if (error !== null) {
                    console.error(stderr);
                    process.exit(1);
                } else {
                    console.log(stdout);
                }

                // Move concatenated file
                fs.renameSync(currentDistDir + 'dejavu.js', distDir + 'regular/strict/dejavu.js');

                emptyDir(currentDistDir);
                fs.rmdirSync(currentDistDir);

                // Run tests
                process.chdir(__dirname + '/..');


                command = mochaBin + ' -R list test/amd/strict.js';

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

                    command = mochaBin + ' -R list test/amd/loose.js';

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
    });
});