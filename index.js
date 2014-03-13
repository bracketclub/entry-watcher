var path = require('path');
var logger = require('bucker').createLogger({
    console: {
        color: true
    },
    app: {
        filename: path.resolve(__dirname, 'logs', 'app.log'),
        format: ':level :time :data',
        timestamp: 'HH:mm:ss',
        accessFormat: ':time :level :method :status :url'
    }
});
var config = require('./config.js');
var year = config.year;
var sport = config.sport;
var Twit = require('twit');
var BracketFinder = require('bracket-finder');
var finder = new BracketFinder({domain: config.domain, tags: config.tags, year: year, sport: sport});
var Locks = require('./lib/locks');
var locks = new Locks({year: year, sport: sport, forceUnlock: process.argv.join(' ').indexOf('--unlock') > -1});
var calendar = locks.moment('calendar');
var fromNow = locks.moment('fromNow');
var lockDisplay = calendar + ' ' + '/' + ' ' + fromNow;

if (locks.isOpen()) {
    logger.debug('[START STREAM]', 'track:' + config.tags.join(), 'until', lockDisplay);

    var Entry = require('./lib/entry');
    var T = new Twit(config.twitter);
    var stream = T.stream('statuses/filter', {track: config.tags});

    stream.on('tweet', function (data) {
        new Entry({
            finder: finder,
            logger: logger,
            tweet: data,
            locks: locks,
            year: year
        }).save();
    });

    stream.on('disconnect', function (message) {
        logger.error('[DISCONNECT]', message);
    });

    stream.on('connect', function () {
        logger.debug('[CONNECT]');
    });

    stream.on('reconnect', function () {
        logger.warn('[RECONNECT]');
    });

    stream.on('limit', function (msg) {
        logger.warn('[LIMIT]', msg);
    });

    stream.on('warning', function (msg) {
        logger.warn('[WARNING]', msg);
    });

    setTimeout(function () {
        logger.debug('[STOP STREAM]');
        stream.stop();
    }, locks.closesIn());
} else {
    return logger.info('[NO STREAM]', 'at', lockDisplay);
}
