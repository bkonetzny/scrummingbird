var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'scrummingbird', src: true});

module.exports = log;
