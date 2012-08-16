if (!global.evaluated) {
    require('./util/adapter.js');
}

// TODO: loose tests are not being run
require('./amd/strict');
require('./amd/loose');