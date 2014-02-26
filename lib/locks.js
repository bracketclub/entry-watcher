var moment = require('moment');
var BracketData = require('bracket-data');

function Locks(options) {
    if ((!options.sport || !options.year) || options.locks) {
        this.locks = options.locks ? moment(options.locks) : moment().add('years', 1000);
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
    this.locks.diff(this.now);
};

Locks.prototype.moment = function (prop) {
    if (prop) return this.locks[prop]();
    return this.locks;
};

Locks.prototype.isDateValid = function (date) {
    return moment(date).isBefore(this.locks);
};

module.exports = Locks;