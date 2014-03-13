var data = {
    '2012': require('../../bracket-data-live/data/2012'),
    '2013': require('../../bracket-data-live/data/2013')
};
var FetchTweets = require('../lib/fetch');

new FetchTweets(data['2012'].entries, '2012').getEntries();
new FetchTweets(data['2013'].entries, '2013', {forceUnlock: true}).getEntries();
