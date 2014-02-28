var moment = require('moment');
var BracketData = require('bracket-data');
var MAX_TIMEOUT = 2147483647;

function Locks(options) {
    if ((!options.sport || !options.year) || options.locks || options.forceUnlock) {
        this.locks = options.locks ? moment(options.locks) : moment().add('ms', MAX_TIMEOUT);
    } else {
        this.locks = moment(new BracketData({
            year: options.year,
            sport: options.sport,
            props: ['locks']
        }).locks);
    }
    this.now = moment();
}

Locks.prototype.isOpen = function () {
    return this.now.isBefore(this.locks);
};

Locks.prototype.closesIn = function () {
    return this.locks.diff(this.now);
};

Locks.prototype.moment = function (prop) {
    if (prop) return this.locks[prop]();
    return this.locks;
};

Locks.prototype.isDateValid = function (date) {
    return moment(date).isBefore(this.locks);
};

module.exports = Locks;