var async = require('async');
var bucker = require('bucker');
var moment = require('moment');
var _ = require('lodash');
var Locks = require('./locks');
var BracketFinder = require('bracket-finder');


var ENTRY_TYPES = {
    tweet: {
        dateFormat: 'ddd MMM DD HH:mm:ss ZZ YYYY',
        entry: function (data) {
            return {
                created: data.created_at,
                user_id: data.user.id_str,
                data_id: data.id_str,
                username: data.user.screen_name,
                name: data.user.name,
                profile_pic: data.user.profile_image_url
            };
        },
        validate: function (entry, cb) {
            if (entry.hasOwnProperty('retweeted_status')) {
                cb(new Error('Tweet is a retweet'));
            } else {
                cb(null);
            }
        }
    }
};

function Entry(options) {
    if (options.tweet) {
        this.type = 'tweet';
        this.entry =  ENTRY_TYPES[this.type].entry(options.tweet);
        this.originalData = options.tweet;
    }

    _.defaults(options, {
        finder: new BracketFinder(_.pick(options, 'sport', 'year', 'domain', 'tags')),
        logger: bucker.createNullLogger(),
        locks: new Locks({year: options.year, sport: options.sport}),
        onSave: function () {},
        onError: function () {}
    });

    _.extend(this, _.pick(options, 'logger', 'finder', 'save', 'locks', 'onSave', 'onError'));

    if (!this.entry) {
        throw new Error('Cant create an entry without data');
    }

    this.save();
}


// -----------------------
// Validation
// -----------------------
Entry.prototype.typeValidation = function (cb) {
    ENTRY_TYPES[this.type].validate(this.originalData, cb);
};

Entry.prototype.isOnTime = function (cb) {
    if (moment(this.entry.created, ENTRY_TYPES[this.type].dateFormat).isBefore(this.locks.moment())) {
        cb(null);
    } else {
        cb(new Error('Entry is outside of the allotted time'));
    }
};

Entry.prototype.hasBracket = function (cb) {
    this.finder[this.type](this.originalData, function (err, result) {
        if (err) {
            return cb(new Error('Entry does not contain a bracket'));
        } else {
            cb(null, result);
        }
    });
};

Entry.prototype.isValid = function (cb) {
    async.series([
        this.typeValidation.bind(this),
        this.isOnTime.bind(this),
        this.hasBracket.bind(this)
    ], function (err, result) {
        cb(err, result && result[2]);
    });
};


// -----------------------
// Saving
// -----------------------
Entry.prototype.save = function () {
    this.isValid(function (err, bracket) {
        if (err) {
            this.logger.error('[VALIDATION]', err.message);
            this.onError(err);
        } else {
            this.entry.bracket = bracket;
            this.onSave(this.entry);
        }
    }.bind(this));
};


module.exports = Entry;
