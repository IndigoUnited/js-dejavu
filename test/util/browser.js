/*jshint strict:false*/

/**
 * Returns an object with the keys and values extract from a query string.
 *
 * @param {String} qs The query string
 *
 * @return {Object} The object
 */
function getQueryParams(qs) {
    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    tokens = re.exec(qs);
    while (tokens) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        tokens = re.exec(qs);
    }

    return params;
}

/**
 * Reads the URL query string and returns the current requested build.
 *
 * @return {String} The build
 */
function getBuild() {
    var build = getQueryParams(location.search).build;

    if (!build || !/^[a-z]/ig.test(build)) {    // Add some security
        build = 'amd/strict';
    }

    return build;
}
