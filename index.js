'use strict'

const bucker = require('bucker')
const _ = require('lodash')
const watchers = require('./lib/watchers')

const noop = () => {}

class EntryWatchcer {
  constructor (options, cb) {
    if (!options) options = {}

    options = _.defaults(options, {
      logger: bucker.createNullLogger(),
      type: null,
      auth: {},
      onSave: noop,
      onError: noop
    })

    if (options.onSave === noop && options.onError === noop && typeof cb === 'function') {
      options.onSave = (entry) => cb(null, entry)
      options.onError = (err) => cb(err)
    }

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

  find (id) {
    watchers[`find${_.startCase(this.options.type)}`](_.extend({id}, this.options))
  }
}

module.exports = EntryWatchcer
