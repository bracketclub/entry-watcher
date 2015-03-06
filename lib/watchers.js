var Twit = require('twit');
var _ = require('lodash');
var Entry = require('./entry');
var Locks = require('./locks');

function canWatch (options, cb) {
    var locks = new Locks(_.pick(options, 'year', 'sport'));
    var lockDisplay = locks.moment('calendar') + ' / ' + locks.moment('fromNow');

    if (locks.isOpen()) {
        options.logger.debug('[START WATCHER]', 'track:' + options.tags.join(), 'until', lockDisplay);
        cb(locks);
    } else {
        options.logger.info('[NO STREAM]', 'at', lockDisplay);
    }
}


module.exports = {
    tweet: function (options) {
        canWatch(options, function (locks) {
            var logger = options.logger;
            var T = new Twit(options.auth);
            var stream = T.stream('statuses/filter', {track: options.tags});

            stream.on('tweet', function (data) {
                new Entry(_.extend({}, _.pick(options, 'sport', 'year', 'domain', 'tags'), {
                    tweet: data,
                    logger: logger,
                    onSave: options.onSave,
                    onError: options.onError
                }));
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
        });
    }
};
