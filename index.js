'use strict'

const bucker = require('bucker')
const _ = require('lodash')
const watchers = require('./lib/watchers')

class EntryWatchcer {
  constructor (options) {
    if (!options) options = {}

    this.options = _.defaults(options, {
      logger: bucker.createNullLogger(),
      sport: 'ncaam',
      year: new Date().getFullYear(),
      domain: 'tweetyourbracket.com',
      tags: ['tybrkt'],
      type: null,
      auth: {},
      onSave () {},
      onError () {}
    })

    if (!options.sport || !options.year) {
      throw new Error(`Needs sport and year. Got ${options.sport} ${options.year}`)
    }

    if (!watchers[options.type]) {
      throw new Error(`${options.type} is not a valid entry type`)
    }
  }

  start () {
    watchers[this.options.type](_.extend({}, this.options))
  }
}

module.exports = EntryWatchcer
