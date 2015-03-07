var path = require('path');
var bucker = require('bucker');
var _ = require('lodash');
var watchers = require('./lib/watchers');


var EntryWatchcer = function (options) {
    options || (options = {});

    this.options = _.defaults(options, {
        logger: null,
        logfile: path.resolve(__dirname, 'logs', 'app.log'),
        sport: 'ncaa-mens-basketball',
        year: new Date().getFullYear(),
        domain: 'tweetyourbracket.com',
        tags: ['tybrkt'],
        type: null,
        auth: {},
        onSave: function () {},
        onError: function () {}
    });

    if (!options.sport || !options.year) {
        throw new Error('Needs sport and year. Got ' + options.sport + ' ' + options.year);
    }

    if (!watchers[options.type]) {
        throw new Error(options.type + ' is not a valid entry type');
    }

    this.logger = options.logger || bucker.createLogger({
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
    delete options.logger;
};


EntryWatchcer.prototype.start = function () {
    watchers[this.options.type](_.extend({
        logger: this.logger
    }, this.options));
};

module.exports = EntryWatchcer;
