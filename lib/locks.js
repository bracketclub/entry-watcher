'use strict';

const moment = require('moment');
const bracketData = require('bracket-data');

const MAX_TIMEOUT = 2147483647;

class Locks {
  constructor(options) {
    this.locks = moment(options.locks || bracketData({
      year: options.year,
      sport: options.sport
    }).locks);
  }

  isOpen() {
    return moment().isBefore(this.locks);
  }

  closesIn() {
    // JS cant set a timeout for longer than MAX_TIMEOUT
    // so that is returned if the diff is larger than that.
    // This could cause problems if it needs to lock more than ~24
    // days in the future, but that wont happen under current circumstances.
    return Math.min(this.locks.diff(moment()), MAX_TIMEOUT);
  }

  moment(prop) {
    if (prop) return this.locks[prop]();
    return this.locks;
  }
}

module.exports = Locks;
