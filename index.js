var HASHTAGS = ['tybrkt'],
    DOMAIN = 'tweetyourbracket.com',
    path = require('path'),
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
    }),
    year = '2013',
    config = require('./config.js'),
    Twit = require('twit'),
    BracketFinder = require('bracket-finder'),
    finder = new BracketFinder({domain: DOMAIN, hashtags: HASHTAGS, year: year}),
    Database = new require('db-schema'),
    moment = require('moment'),
    bracketsClose = moment().add('days', 5) || moment(finder.locks),
    now = moment();

if (now.isBefore(bracketsClose)) {
    logger.debug('[START STREAM]', 'track:' + HASHTAGS.toString(), 'until', bracketsClose.calendar(), '/', bracketsClose.fromNow());

    var db = new Database(config.db);
    var T = new Twit(config.twitter);
    var stream = T.stream('statuses/filter', {track: HASHTAGS});
    stream.on('tweet', function (data) {
        if (!data.hasOwnProperty('retweeted_status')) {
            var tweetLink = 'twitter.com/' + data.user.screen_name + '/status/' + data.id_str;

            logger.debug('[TWEET]', tweetLink);
            finder.find(data, function (err, res) {
                if (err) return logger.warn('[TWEET]', err.message, tweetLink);

                var validBracket = res,
                    bracketTime = moment(data.created_at),
                    record = {};

                if (validBracket && bracketTime.isBefore(bracketsClose)) {
                    record = {
                        created: data.created_at,
                        bracket: validBracket.toUpperCase(),
                        user_id: data.user.id_str,
                        tweet_id: data.id_str,
                        username: data.user.screen_name,
                        name: data.user.name,
                        profile_pic: data.user.profile_image_url
                    };

                    db.upsertBracket(record, function (err, doc) {
                        if (err) return logger.error('[SAVE ERROR]', tweetLink);
                        logger.debug('[SAVE SUCESS]', tweetLink);
                    });
                }
            });
        }
    });

    stream.on('disconnect', function (message) {
        logger.error('[DISCONNECT]', message);
    });

    stream.on('connect', function (request) {
        logger.debug('[CONNECT]');
    });

    stream.on('reconnect', function (request, response, connectInterval) {
        logger.warn('[RECONNECT]');
    });

    setTimeout(function () {
        logger.debug('[STOP STREAM]', 'at', bracketsClose.calendar(), '/', bracketsClose.fromNow());
        stream.stop();
    }, bracketsClose.diff(now));
} else {
    return logger.info('[NO STREAM]', 'at', bracketsClose.calendar(), '/', bracketsClose.fromNow());
}
