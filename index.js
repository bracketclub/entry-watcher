'use strict'

const bucker = require('bucker')
const _ = require('lodash')
const watchers = require('./lib/watchers')

class EntryWatchcer {
  constructor (options) {
    if (!options) options = {}

    options = _.defaults(options, {
      logger: bucker.createNullLogger(),
      type: null,
      auth: {},
      onSave () {},
      onError () {}
    })

    if (!options.tags || !options.tags.length || !options.domain) {
      throw new Error(`Tags and domain are required. Got ${options.tags} ${options.domain}`)
    }

    if (!options.sport || !options.year) {
      throw new Error(`Needs sport and year. Got ${options.sport} ${options.year}`)
    }

    if (!watchers[options.type]) {
      throw new Error(`${options.type} is not a valid entry type`)
    }

    this.options = options
  }

  start () {
    watchers[this.options.type](_.extend({}, this.options))
  }
}

module.exports = EntryWatchcer
