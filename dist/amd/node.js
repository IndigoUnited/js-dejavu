if (typeof define !== 'function') { var define = require('amdefine')(module) }
module.exports = process.env.STRICT == null || process.env.STRICT ? require('./strict/main') : require('./loose/main');