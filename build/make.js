/*jslint node: true, nomen: true, sloppy: true*/

var cp = require('child_process'),
    fs = require('fs'),
    tests,
    command,
    distDir = __dirname + '/../dist/',
    files,
    stat,
    cwd;

// Remove all files
files = fs.readdirSync(distDir);
files.forEach(function (file) {
    if (fs.statSync(distDir + file).isFile()) {
        fs.unlinkSync(distDir + file);
    }
});

// Create temp directory
try {
    stat = fs.statSync(distDir + '_temp');
    if (!stat.isDirectory()) {
        fs.unlinkSync(distDir + '_temp');
        fs.mkdirSync(distDir + '_temp');
    }
} catch (e) {
    fs.mkdirSync(distDir + '_temp');
}


/**
 * Removes all files from dist folder except the final ones
 */
function removeOtherFiles() {

    var files = fs.readdirSync(__dirname + '/../dist'),
        ignoreList = ['Classify.js', 'Classify.min.js', 'Classify.no-checks.js', 'Classify.no-checks.min.js'];

    files.forEach(function (file) {
        if (file.substr(file.length - 3) === '.js' && ignoreList.indexOf(file) === -1) {
            fs.unlinkSync(distDir + file);
        }
    });
}

// Build without checks non minified
command = 'node "' + __dirname + '/../vendor/r.js/dist/r.js" -o ' + __dirname + '/Classify.build.js';
cp.exec(command + ' pragmas=checks:false optimize=uglify', function (error, stdout, stderr) {

    // Print success or error
    if (error !== null) {
        console.error(stderr);
        process.exit(1);
    } else {
        console.log(stdout);
    }

    // Rename file to minified one
    fs.renameSync(distDir + 'Classify.js', distDir + '_temp/Classify.no-checks.min.js');

    removeOtherFiles();

    // Build without checks minified
    cp.exec(command + ' pragmas=checks:false', function (error, stdout, stderr) {

        // Print success or error
        if (error !== null) {
            console.error(stderr);
            process.exit(1);
        } else {
            console.log(stdout);
        }

        // Rename file to minified one
        fs.renameSync(distDir + 'Classify.js', distDir + '_temp/Classify.no-checks.js');

        removeOtherFiles();

        // Build with checks minified
        cp.exec(command + ' optimize=uglify', function (error, stdout, stderr) {

            // Print success or error
            if (error !== null) {
                console.error(stderr);
                process.exit(1);
            } else {
                console.log(stdout);
            }

            // Rename file to minified one
            fs.renameSync(distDir + 'Classify.js', distDir + '_temp/Classify.min.js');

            removeOtherFiles();

            // Build with checks
            cp.exec(command, function (error, stdout, stderr) {

                // Print success or error
                if (error !== null) {
                    console.error(stderr);
                    process.exit(1);
                } else {
                    console.log(stdout);
                }


                // Rename file to minified one
                fs.renameSync(distDir + 'Classify.js', distDir + '_temp/Classify.js');

                removeOtherFiles();

                // Rename all files back..
                fs.renameSync(distDir + '_temp/Classify.js', distDir + 'Classify.js');
                fs.renameSync(distDir + '_temp/Classify.min.js', distDir + 'Classify.min.js');
                fs.renameSync(distDir + '_temp/Classify.no-checks.js', distDir + 'Classify.no-checks.js');
                fs.renameSync(distDir + '_temp/Classify.no-checks.min.js', distDir + 'Classify.no-checks.min.js');

                // Remove temp directory
                fs.rmdirSync(distDir + '_temp');

                // Run tests
                cwd = process.cwd();
                process.chdir(__dirname + '/../test');

                command = 'mocha -R list Classify.functional.js';
                command += ' && mocha -R list Classify.verifications.js';

                if (process.platform === 'win32') {
                    tests = cp.spawn('cmd', ['/s', '/c', command], { customFds: [0, 1, 2] });
                } else {
                    tests = cp.spawn('sh', ['-c', command], { customFds: [0, 1, 2] });
                }
                tests.on('exit', function (code) {

                    process.chdir(cwd);

                    if (code !== 0) {
                        process.exit(1);
                    } else {
                        process.exit(0);
                    }
                });
            });
        });
    });
});
