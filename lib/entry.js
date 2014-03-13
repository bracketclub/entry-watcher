var config;
var Database;
var db;

try {
    config = require('../config.js');
    Database = new require('db-schema');
    db = new Database(config.db);
} catch (err) {
    config = {};
}

var jsonEntry = require('../../tweetyourbracket.com/update/save').entry;
var async = require('async');
var Locks = require('./locks');

var toEntry = {
    tweet: function (data) {
        return {
            created: data.created_at,
            user_id: data.user.id_str,
            data_id: data.id_str,
            username: data.user.screen_name,
            name: data.user.name,
            profile_pic: data.user.profile_image_url
        };
    }
};

var validation = {
    tweet: function (tweet, cb) {
        if (tweet.hasOwnProperty('retweeted_status')) {
            cb(new Error('Tweet is a retweet'));
        } else {
            cb(null);
        }
    }
};

function Entry(options) {
    this.logger = options.logger;
    this.finder = options.finder;
    this.locks = options.locks || new Locks({year: options.year, sport: options.sport});
    this.year = options.year;

    if (options.tweet) {
        this.type = 'tweet';
        this.entry = toEntry.tweet(options.tweet);
        this.originalData = options.tweet;
    }

    if (!this.entry) throw new Error('Cant create an entry without data');
}

Entry.prototype.save = function () {
    this.isValid(function (err, bracket) {
        if (err) return this.logger.error('[VALIDATION]', err.message);
        this.persist(bracket);
    }.bind(this));
};

Entry.prototype.database = function () {
    db.upsertBracket(this.entry, function (err) {
        if (err) return this.logger.error('[DB SAVE ERROR]', err);
        this.logger.debug('[DB SAVE SUCESS]', this.entry);
    }.bind(this));
};

Entry.prototype.local = function () {
    jsonEntry(this.year, this.entry, function (err, obj) {
        if (err) return this.logger.error('[JSON SAVE ERROR]', err);
        this.logger.debug('[JSON SAVE SUCESS]', obj);
    }.bind(this));
};

Entry.prototype.persist = function (bracket) {
    if (bracket) {
        this.entry.bracket = bracket;
        db && this.database();
        jsonEntry && this.local();
    } else if (!bracket) {
        this.logger.error('[SAVE ERROR]', new Error('No bracket'));
    } else if (!db) {
        this.logger.error('[SAVE ERROR]', new Error('No database'));
    }
};

Entry.prototype.getValidated = function (cb) {
    this.isValid(function (err, bracket) {
        if (bracket) {
            this.entry.bracket = bracket;
        }
        cb(err, this.entry);
    }.bind(this));
};

Entry.prototype.test = function (cb) {
    this.isValid(cb.bind(this));
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

Entry.prototype.typeValidation = function (cb) {
    validation[this.type](this.originalData, cb);
};

Entry.prototype.isOnTime = function (cb) {
    if (this.locks.isDateValid(this.entry.created)) {
        cb(null);
    } else {
        cb(new Error('Entry is outside of the allotted time'));
    }
};

Entry.prototype.hasBracket = function (cb) {
    this.finder[this.type](this.originalData, function (err, result) {
        if (err) return cb(new Error('Entry does not contain a bracket'));
        cb(null, result);
    });
};

module.exports = Entry;