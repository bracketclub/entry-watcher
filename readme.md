entry-watcher
==============

[![Build Status](https://travis-ci.org/bracketclub/entry-watcher.png?branch=master)](https://travis-ci.org/bracketclub/entry-watcher)

Entry watcher for [bracket.club](https://bracket.club).

## Usage

```js
const EntryWatcher = require('entry-watcher');
new EntryWatcher({
  logger: null,
  sport: 'ncaam',
  year: '2015',
  domain: 'bracket.club',
  tags: ['bracketclub'],
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

Yeah, now that there are publically scoped modules it's at `npm install @lukekarrys/entry-watcher`.

### LICENSE

MIT
