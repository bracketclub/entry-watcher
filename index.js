'use strict';

const path = require('path');
const bucker = require('bucker');
const _ = require('lodash');
const watchers = require('./lib/watchers');

class EntryWatchcer {
  constructor(options) {
    if (!options) options = {};

    this.options = _.defaults(options, {
      logger: null,
      logfile: path.resolve(__dirname, 'logs', 'app.log'),
      sport: 'ncaam',
      year: new Date().getFullYear(),
      domain: 'tweetyourbracket.com',
      tags: ['tybrkt'],
      type: null,
      auth: {},
      onSave() {},
      onError() {}
    });

    if (!options.sport || !options.year) {
      throw new Error(`Needs sport and year. Got ${options.sport} ${options.year}`);
    }

    if (!watchers[options.type]) {
      throw new Error(`${options.type} is not a valid entry type`);
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
  }

  start() {
    watchers[this.options.type](_.extend({
      logger: this.logger
    }, this.options));
  }
}

module.exports = EntryWatchcer;
