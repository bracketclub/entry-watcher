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
    return Math.min(this.locks.diff(moment()), MAX_TIMEOUT);
};

Locks.prototype.moment = function (prop) {
    return this.locks[prop]();
};

Locks.prototype.isDateValid = function (date) {
    return moment(date, this.dateFormat).isBefore(this.locks);
};

module.exports = Locks;