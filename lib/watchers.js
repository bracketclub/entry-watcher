/* eslint-disable no-new */

'use strict'

const Twit = require('twit')
const _ = require('lodash')
const Entry = require('./entry')
const Locks = require('./locks')

const canWatch = (options, cb) => {
  if (options._forceOpen) {
    return cb()
  }

  const locks = new Locks(_.pick(options, 'year', 'sport'))
  const lockDisplay = `${locks.moment('calendar')} / ${locks.moment('fromNow')}`

  if (locks.isOpen()) {
    options.logger.debug('[START WATCHER]', `track: ${options.tags.join()}`, 'until', lockDisplay)
    return cb(locks)
  }

  options.logger.info('[NO STREAM]', 'at', lockDisplay)
  return null
}

const tweet = (options) => canWatch(options, (locks) => {
  const logger = options.logger

  const T = new Twit(options.auth)

  // Im not sure if tweet_mode: extended works on streams, so as a backup the entry validator
  // takes a fn to lookup the individual tweet in case of an error
  const stream = T.stream('statuses/filter', {track: options.tags, tweet_mode: 'extended'})

  stream.on('tweet', (data) => {
    new Entry(_.extend({}, _.pick(options, 'sport', 'year', 'domain', 'tags'), {
      getId: (id, cb) => T.get('statuses/show', {id, tweet_mode: 'extended'}, cb),
      tweet: data,
      logger,
      onSave: options.onSave,
      onError: options.onError
    }))
  })

  stream.on('disconnect', (message) => {
    logger.error('[DISCONNECT]', message)
  })

  stream.on('error', (err) => {
    logger.error('[ERROR]', err)
  })

  stream.on('connect', () => {
    logger.debug('[CONNECT]')
  })

  stream.on('reconnect', () => {
    logger.warn('[RECONNECT]')
  })

  stream.on('limit', (msg) => {
    logger.warn('[LIMIT]', msg)
  })

  stream.on('warning', (msg) => {
    logger.warn('[WARNING]', msg)
  })

  if (locks) {
    setTimeout(() => {
      logger.debug('[STOP STREAM]')
      stream.stop()
    }, locks.closesIn())
  }
})

const findTweet = (options) => {
  const logger = options.logger

  const T = new Twit(options.auth)

  T.get('statuses/show', {id: options.id, tweet_mode: 'extended'}, (err, tweet) => {
    if (err) {
      logger.error('[FIND TWEET]', err)
      if (options.onError) options.onError(err)
      return
    }

    new Entry(_.extend({tweet}, _.pick(options,
      'sport',
      'year',
      'domain',
      'tags',
      'logger',
      'onSave',
      'onError'
    )))
  })
}

module.exports = {
  tweet,
  findTweet
}
