'use strict';

const assert = require('assert');
const moment = require('moment');
const Locks = require('../lib/locks');

const year = '2013';
const sport = 'ncaam';
const ONE_DAY = 1000 * 60 * 60 * 24;

describe('Locks', () => {
  it('Works with a sport year', (done) => {
    const locks = new Locks({year, sport});

    assert.equal(locks.isOpen(), false);
    assert.equal(locks.moment('calendar'), '03/21/2013');

    done();
  });

  it('Works with a future lock time', (done) => {
    const future = moment().add(ONE_DAY, 'ms').utc().format();
    const locks = new Locks({locks: future});

    assert.equal(locks.isOpen(), true);
    assert.ok(locks.closesIn() > ONE_DAY - 10000);

    done();
  });
});
