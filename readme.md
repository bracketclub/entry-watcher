entry-watcher
==============

[![Build Status](https://travis-ci.org/tweetyourbracket/entry-watcher.png?branch=master)](https://travis-ci.org/tweetyourbracket/entry-watcher)

Entry watcher for tweetyourbracket.com

## Usage

```js
var EntryWatcher = require('entry-watcher');
new EntryWatcher({
    logfile: '/path/to/logs/app.log',
    sport: 'ncaa-mens-basketball',
    year: '2015',
    domain: 'tweetyourbracket.com',
    tags: ['tybrkt'],
    type: 'tweet',
    auth: {
        // Passed to twitter streaming listener
        // Could be extended in the future based on `options.type`
        'consumer_key': '',
        'consumer_secret': '',
        'access_token': '',
        'access_token_secre': ''
    }
    onSave: function (entry) {
        // Entry is the full entry passsed back
        // plus the `bracket` value
    },
    onError: function () {
        // Can be used to plug in to when there are entries
        // that dont meet the validation such as not having a valid
        // bracket or being outside the time limit
    }
}).start();
```

## What is it doing?

It is setting up a Twitter listener using [`twit`](https://github.com/ttezel/twit) and when a tweet is found, it is checking whether it contains a valid bracket. If it does, it will call the `onSave` handler.

## Is it on npm?

No. There's a lot of specific code here and it wouldn't make sense to publish this as it is currently. Most of the code here is configuration of some other modules which are on npm such as [`twit`](https://github.com/ttezel/twit), [`bracket-data`](http://github.com/tweetyourbracket/bracket-data), [`bracket-finder`](http://github.com/tweetyourbracket/bracket-finder). But feel free to use this a basis for something else.

### LICENSE

MIT
