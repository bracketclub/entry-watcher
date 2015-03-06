var moment = require('moment');
var BracketData = require('bracket-data');
var MAX_TIMEOUT = 2147483647;


function Locks(options) {
    this.dateFormat = options.dateFormat;
    this.locks = moment(options.locks || new BracketData({
        year: options.year,
        sport: options.sport,
        props: ['locks']
    }).locks);
}

Locks.prototype.isOpen = function () {
    return moment().isBefore(this.locks);
};

Locks.prototype.closesIn = function () {
    // JS cant set a timeout for longer than MAX_TIMEOUT
    // so that is returned if the diff is larger than that.
    // This could cause problems if it needs to lock more than ~24
    // days in the future, but that wont happen under current circumstances.
    return Math.min(this.locks.diff(moment()), MAX_TIMEOUT);
};

Locks.prototype.moment = function (prop) {
    if (prop) return this.locks[prop]();
    return this.locks;
};

module.exports = Locks;