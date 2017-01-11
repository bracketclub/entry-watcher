/* eslint-env mocha */

'use strict'

const assert = require('assert')
const Watcher = require('../index')

describe('Watcher', () => {
  it('Should throw an error if a watcher has twitter type and no auth', () => {
    assert.doesNotThrow(() => {
      new Watcher({
        sport: 'ncaam',
        year: '2016',
        type: 'tweet',
        auth: {
          consumer_key: '1',
          consumer_secret: '2',
          access_token: '3',
          access_token_secret: '4'
        }
      }).start()
    })
  })

  it('Should throw an error if a watcher has no sport year', () => {
    assert.throws(() => {
      new Watcher({
      }).start()
    }, /Needs sport and year/)
  })

  it('Should throw an error if a watcher has twitter type and no auth', () => {
    assert.throws(() => {
      new Watcher({
        sport: 'ncaam',
        year: '2016',
        type: 'tweet',
        _forceOpen: true
      }).start()
    }, /Twit config must include `consumer_key` when using user auth/)
  })

  it('Should throw an error if a watcher has no type', () => {
    assert.throws(() => {
      new Watcher({
        sport: 'ncaam',
        year: '2016',
        type: 'x'
      }).start()
    }, /x is not a valid entry type/)
  })
})
