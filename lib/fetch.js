var logger = require('bucker').createLogger({
    console: {
        color: true
    }
});
var _ = require('lodash');
var config = require('../config.js');
var sport = config.sport;
var Twit = require('twit');
var Entry = require('../lib/entry');
var Locks = require('../lib/locks');
var BracketFinder = require('bracket-finder');
var T = new Twit(config.twitter);

function FetchTweets(data, year, options) {
    options || (options = {});
    _.defaults(options, {
        forceUnlock: false
    });

    this.data = data;
    this.total = data.length;
    this.forceUnlock = options.forceUnlock;
    this.count = 0;
    this.year = year;
    this.results = [];
}

FetchTweets.prototype.getEntries = function () {
    _.each(this.data, this.getEntry.bind(this));
};

FetchTweets.prototype.packageYear = function () {
    console.log(JSON.stringify(this.results));
};


FetchTweets.prototype.getEntry = function (entry) {
    var id = _.last(entry.fromTweet.split('/'));
    T.get('statuses/show/:id', {id: id}, function (err, tweet) {
        if (err) return logger.error('[NO TWEET]', err.statusCode, entry);
        new Entry({
            finder: new BracketFinder({domain: config.domain, tags: config.tags, year: this.year, sport: sport}),
            tweet: tweet,
            locks: this.forceUnlock ? new Locks({forceUnlock: true}) : null,
            year: this.year,
            sport: sport
        }).getValidated(function (err, entry) {
            this.count++;
            if (err) {
                logger.error(err, entry);
            } else {
                logger.debug('[ADDED ENTRY]');
                this.results.push(entry);
            }
            if (this.count === this.total) this.packageYear();
        }.bind(this));
    }.bind(this));
};


module.exports = FetchTweets;