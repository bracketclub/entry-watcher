'use strict'

const async = require('async')
const bucker = require('bucker')
const moment = require('moment')
const _ = require('lodash')
const BracketFinder = require('bracket-finder')
const Locks = require('./locks')

const ENTRY_TYPES = {
  tweet: {
    dateFormat: 'ddd MMM DD HH:mm:ss ZZ YYYY',
    entry: (data) => ({
      created: data.created_at,
      user_id: data.user.id_str,
      data_id: data.id_str,
      username: data.user.screen_name,
      name: data.user.name,
      profile_pic: data.user.profile_image_url,
      link: `${data.user.screen_name}/${data.id_str}`
    }),
    validate: (entry, cb) => {
      if (entry.hasOwnProperty('retweeted_status')) {
        return cb(new Error('Tweet is a retweet'))
      }

      return cb(null)
    }
  }
}

class Entry {
  constructor (options) {
    if (options.tweet) {
      this.type = 'tweet'
      this.entry = ENTRY_TYPES[this.type].entry(options.tweet)
      this.originalData = options.tweet
    }

    _.defaults(options, {
      finder: new BracketFinder(_.pick(options, 'sport', 'year', 'domain', 'tags')),
      logger: bucker.createNullLogger(),
      locks: new Locks({year: options.year, sport: options.sport}),
      onSave () {},
      onError () {}
    })

    _.extend(this, _.pick(options, 'getId', 'logger', 'finder', 'save', 'locks', 'onSave', 'onError'))

    if (!this.entry) {
      throw new Error('Cant create an entry without data')
    }

    this.save()
  }

  // -----------------------
  // Validation
  // -----------------------
  typeValidation (cb) {
    ENTRY_TYPES[this.type].validate(this.originalData, cb)
  }

  isOnTime (cb) {
    if (moment(this.entry.created, ENTRY_TYPES[this.type].dateFormat).isBefore(this.locks.moment())) {
      return cb(null)
    }
    return cb(new Error('Entry is outside of the allotted time'))
  }

  hasBracket (cb) {
    this.finder[this.type](this.originalData, (err, result) => {
      if (err && this.originalData.truncated && this.getId) {
        // Refetch tweet in case of an error that could be because the tweet was truncated
        return this.getId(this.entry.data_id, cb)
      }

      if (err) {
        return cb(new Error(`${this.type} does not contain a bracket: ${this.entry.link}`))
      }

      return cb(null, result)
    })
  }

  isValid (cb) {
    async.series([
      this.typeValidation.bind(this),
      this.isOnTime.bind(this),
      this.hasBracket.bind(this)
    ], (err, result) => cb(err, result && result[2]))
  }

  // -----------------------
  // Saving
  // -----------------------
  save () {
    this.isValid((err, bracket) => {
      if (err) {
        this.logger.error('[VALIDATION]', err.message)
        this.onError(err)
      } else {
        this.entry.bracket = bracket
        this.logger.debug('[SAVE]', JSON.stringify(_.pick(this.entry, 'username', 'bracket')))
        this.onSave(this.entry)
      }
    })
  }
}

module.exports = Entry
