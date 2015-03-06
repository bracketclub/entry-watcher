var path = require('path');
var bucker = require('bucker');
var _ = require('lodash');
var watchers = require('./lib/watchers');


module.exports = function (options, cb) {
    options || (options = {});

    _.defaults(options, {
        logfile: path.resolve(__dirname, 'logs', 'app.log'),
        sport: 'ncaa-mens-basketball',
        year: new Date().getFullYear(),
        domain: 'tweetyourbracket.com',
        tags: ['tybrkt'],
        type: null,
        auth: {}
    });

    if (!options.sport || !options.year) {
        throw new Error('Needs sport and year. Got ' + options.sport + ' ' + options.year);
    }

    if (!watchers[options.type]) {
        throw new Error(options.type + ' is not a valid entry type');
    }

    var logger = bucker.createLogger({
        console: {
            color: true
        },
        app: {
            filename: options.logfile,
            format: ':level :time :data',
            timestamp: 'HH:mm:ss',
            accessFormat: ':time :level :method :status :url'
        }
    });

    watchers[options.type](_.extend({
        logger: logger
    }, options), cb);
};
