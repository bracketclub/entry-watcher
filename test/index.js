var assert = require('assert');
var nullLogger = require('bucker').createNullLogger();
var Watcher = require('../index');


describe('Watcher', function () {
    it('Should throw an error if a watcher has twitter type and no auth', function () {
        assert.doesNotThrow(function () {
            new Watcher({
                logger: nullLogger,
                type: 'tweet',
                auth:  {
                    "consumer_key": "1",
                    "consumer_secret": "2",
                    "access_token": "3",
                    "access_token_secret": "4"
                }
            }).start();
        });
    });

    it('Should throw an error if a watcher has twitter type and no auth', function () {
        assert.throws(function () {
            new Watcher({
                logger: nullLogger,
                type: 'tweet',
                _forceOpen: true
            }).start();
        }, /config must provide consumer_key/);
    });

    it('Should throw an error if a watcher has no type', function () {
        assert.throws(function () {
            new Watcher({
                logger: nullLogger,
                type: 'x'
            }).start();
        }, /x is not a valid entry type/);
    });
});