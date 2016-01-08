'use strict';

const Twit = require('twit');
const _ = require('lodash');
const Entry = require('./entry');
const Locks = require('./locks');

const canWatch = (options, cb) => {
  if (options._forceOpen) {
    return cb();
  }

  const locks = new Locks(_.pick(options, 'year', 'sport'));
  const lockDisplay = `${locks.moment('calendar')} / ${locks.moment('fromNow')}`;

  if (locks.isOpen()) {
    options.logger.debug('[START WATCHER]', `track: ${options.tags.join()}`, 'until', lockDisplay);
    return cb(locks);
  }

  options.logger.info('[NO STREAM]', 'at', lockDisplay);
};

const tweet = (options) => canWatch(options, (locks) => {
  const logger = options.logger;

  const T = new Twit(options.auth);
  const stream = T.stream('statuses/filter', {track: options.tags});

  stream.on('tweet', (data) => {
    new Entry(_.extend({}, _.pick(options, 'sport', 'year', 'domain', 'tags'), {
      tweet: data,
      logger,
      onSave: options.onSave,
      onError: options.onError
    }));
  });

  stream.on('disconnect', (message) => {
    logger.error('[DISCONNECT]', message);
  });

  stream.on('connect', () => {
    logger.debug('[CONNECT]');
  });

  stream.on('reconnect', () => {
    logger.warn('[RECONNECT]');
  });

  stream.on('limit', (msg) => {
    logger.warn('[LIMIT]', msg);
  });

  stream.on('warning', (msg) => {
    logger.warn('[WARNING]', msg);
  });

  setTimeout(() => {
    logger.debug('[STOP STREAM]');
    stream.stop();
  }, locks.closesIn());
});

module.exports = {
  tweet
};
