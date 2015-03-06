var assert = require('assert');
var _ = require('lodash');

var year = '2013';
var sport = 'ncaa-mens-basketball';
var config = {domain: "tweetyourbracket.com", tags: ["tybrkt"]};

var entryConfig = function (opts) {
    return _.extend(opts || {}, config, {year: year, sport: sport});
};

var future = require('moment')().add(10, 'days');
var Entry = require('../lib/entry');
var Locks = require('../lib/locks');
var locks = function (obj) {
    return new Locks(_.extend(obj || {}, {sport: sport, year: year}));
};


describe('Entry watcher [twitter]', function () {
    it('Should find a valid bracket from a tweet with a domain+bracket and bracket', function (done) {
        new Entry(entryConfig({
            tweet: require('./data/tag-domain-bracket')
        }), function (err, result) {
            assert.equal(err, null);
            assert.equal(result.bracket, 'MW191241137211237131W1854631021532522S18541131021532533E195463721432121FFMWEMW');
            done();
        });
    });

    it('Should fail since entries are locked', function (done) {
        new Entry(entryConfig({
            locks: locks({locks: '2013-03-20T02:25:17.000Z'}),
            tweet: require('./data/tag-domain-bracket')
        }), function (err) {
            assert.equal(true, err instanceof Error);
            assert.equal(err.message, 'Entry is outside of the allotted time');
            done();
        });
    });

    it('Should not find a valid bracket from a tweet with a domain-bracket and tags', function (done) {
        new Entry(entryConfig({
            locks: locks({locks: future}),
            tweet: require('./data/tag-domain-nobracket')
        }), function (err) {
            assert.equal(true, err instanceof Error);
            assert.equal(err.message, 'Entry does not contain a bracket');
            done();
        });
    });

    it('Should find a valid bracket from a tweet with a short domain+bracket and tags', function (done) {
        new Entry(entryConfig({
            locks: locks({locks: future}),
            tweet: require('./data/tag-shortdomain-bracket'),
            sport: sport,
            year: year
        }), function (err, result) {
            assert.equal(err, null);
            assert.equal(result.bracket, 'MW18121311372112117177W168124631028123101233S181241131028411104114E1954614721462466FFWSS');
            done();
        });
    });

    //notag-domain-nobracket
    it('Should not find a bracket from a tweet with a domain but nothing else', function (done) {
        new Entry(entryConfig({
            locks: locks({locks: future}),
            tweet: require('./data/notag-domain-nobracket')
        }), function (err) {
            assert.equal(true, err instanceof Error);
            assert.equal(err.message, 'Entry does not contain a bracket');
            done();
        });
    });

    //notag-nodomain-nobracket
    it('Should not find a bracket from a tweet with nothing', function (done) {
        new Entry(entryConfig({
            locks: locks({locks: future}),
            tweet: require('./data/notag-nodomain-nobracket')
        }), function (err) {
            assert.equal(true, err instanceof Error);
            assert.equal(err.message, 'Entry does not contain a bracket');
            done();
        });
    });

    it('Should throw an error if entry is created with no data', function () {
        assert.throws(function () {
            new Entry(entryConfig());
        });
    });
});