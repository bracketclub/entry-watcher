var path = require('path'),
logger = require('bucker').createLogger({
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
var year = '2013';
var sport = 'ncaa-mens-basketball';
var config = require('./config.js');
var Twit = require('twit');
var BracketFinder = require('bracket-finder');
var finder = new BracketFinder({domain: config.domain, tags: config.tags, year: year, sport: sport});
var Locks = require('./lib/locks');
var locks = new Locks({year: year, sport: sport});
var calendar = locks.moment('calendar');
var fromNow = locks.moment('fromNow');
var lockDisplay = calendar + ' ' + '/' + ' ' + fromNow;

if (locks.isOpen()) {
    logger.debug('[START STREAM]', 'track:' + config.tags.toString(), 'until', lockDisplay);

    var Entry = require('./lib/entry');
    var T = new Twit(config.twitter);
    var stream = T.stream('statuses/filter', {track: config.tags});

    stream.on('tweet', function (data) {
        new Entry({
            finder: finder,
            logger: logger,
            tweet: data,
            sport: sport,
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

    setTimeout(function () {
        logger.debug('[STOP STREAM]', 'at', lockDisplay);
        stream.stop();
    }, locks.closesIn);
} else {
    return logger.info('[NO STREAM]', 'at', lockDisplay);
}
