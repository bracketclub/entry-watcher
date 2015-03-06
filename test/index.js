var assert = require('assert');
var watcher = require('../index');


describe('Watcher', function () {
    it('Should throw an error if a watcher has twitter type and no auth', function () {
        assert.doesNotThrow(function () {
            watcher({
                type: 'tweet',
                auth:  {
                    "consumer_key": "1",
                    "consumer_secret": "2",
                    "access_token": "3",
                    "access_token_secret": "4"
                }
            });
        });
    });

    it('Should throw an error if a watcher has twitter type and no auth', function () {
        assert.throws(function () {
            watcher({
                type: 'tweet'
            });
        }, /config must provide consumer_key/);
    });

    it('Should throw an error if a watcher has no type', function () {
        assert.throws(function () {
            watcher({
                type: 'x'
            });
        }, /x is not a valid entry type/);
    });
});