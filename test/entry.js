/* eslint-env mocha */
/* eslint-disable no-new */

'use strict'

const assert = require('assert')
const _ = require('lodash')
const moment = require('moment')

const Entry = require('../lib/entry')
const Locks = require('../lib/locks')

const year = '2013'
const sport = 'ncaam'
const config = {domain: 'lookforthisdomain.com', tags: ['somehashtaggggg']}

const entryConfig = (opts) => _.extend({}, config, opts, {year, sport})
const future = moment().add(10, 'days').utc().format()

const locks = (obj) => new Locks(_.extend(obj || {}, {sport, year}))

const noError = (done) => (err) => {
  assert.equal(err, null)
  done()
}

describe('Entry watcher [twitter]', () => {
  it('Should find a valid bracket from a tweet with a domain+bracket and bracket', (done) => {
    new Entry(entryConfig({
      tweet: require('./data/tag-domain-bracket'),
      onSave: (result) => {
        assert.equal(result.bracket, 'MW191241137211237131W1854631021532522S18541131021532533E195463721432121FFMWEMW')
        done()
      },
      onError: noError(done)
    }))
  })

  it('Should fail since entries are locked', (done) => {
    new Entry(entryConfig({
      locks: locks({locks: '2013-03-20T02:25:17.000Z'}),
      tweet: require('./data/tag-domain-bracket'),
      onError: (err) => {
        assert.equal(true, err instanceof Error)
        assert.equal(err.message, 'Entry is outside of the allotted time')
        done()
      }
    }))
  })

  it('Should not find a valid bracket from a tweet with a domain-bracket and tags', (done) => {
    new Entry(entryConfig({
      locks: locks({locks: future}),
      tweet: require('./data/tag-domain-nobracket'),
      onError: (err) => {
        assert.equal(true, err instanceof Error)
        assert.equal(err.message, 'tweet does not contain a bracket: 438776262480232450')
        done()
      }
    }))
  })

  it('Should find a valid bracket from a tweet with a short domain+bracket and tags', (done) => {
    new Entry(entryConfig({
      domain: 'bracket.club',
      locks: locks({locks: future}),
      tweet: require('./data/tag-shortdomain-bracket'),
      sport,
      year,
      onSave: (result) => {
        assert.equal(result.bracket, 'MW18121311372112117177W168124631028123101233S181241131028411104114E1954614721462466FFWSS')
        done()
      },
      onError: noError(done)
    }))
  })

  // notag-domain-nobracket
  it('Should not find a bracket from a tweet with a domain but nothing else', (done) => {
    new Entry(entryConfig({
      locks: locks({locks: future}),
      tweet: require('./data/notag-domain-nobracket'),
      onError: (err) => {
        assert.equal(true, err instanceof Error)
        assert.equal(err.message, 'tweet does not contain a bracket: 427233416044490752')
        done()
      }
    }))
  })

  // notag-nodomain-nobracket
  it('Should not find a bracket from a tweet with nothing', (done) => {
    new Entry(entryConfig({
      locks: locks({locks: future}),
      tweet: require('./data/notag-nodomain-nobracket'),
      onError: (err) => {
        assert.equal(true, err instanceof Error)
        assert.equal(err.message, 'tweet does not contain a bracket: 438756526988087296')
        done()
      }
    }))
  })

  it('Should throw an error if entry is created with no data', () => {
    assert.throws(() => {
      new Entry(entryConfig())
    })
  })
})
