tweet-watcher
==============

[![Build Status](https://travis-ci.org/tweetyourbracket/tweet-watcher.png?branch=master)](https://travis-ci.org/tweetyourbracket/tweet-watcher)

Tweet watcher for tweetyourbracket.com

## Usage

1. Create `config.js` file in root (or create the file anywhere that [`figs`](https://www.npmjs.org/package/figs) will support) with a `twitter` object with `consumer_key`, `consumer_secret`, `access_token`, `access_token_secret`
2. You'll also want to set your `domain`, `tags`, `sport` and `year` in the config
3. `npm install`
4. `npm start`

## What is it doing?

It is setting up a Twitter listener using [`twit`](https://github.com/ttezel/twit) and when a tweet is found, it is checking whether it contains a valid bracket. If it does, it will add it the [`bracket-data-live`](http://github.com/tweetyourbracket/bracket-data-live) repo located as a sibling dir.

## Is it on npm?

No. There's a lot of specific code here and it wouldn't make sense to publish this as it is currently. Most of the code here is configuration of some other modules which are on npm such as [`twit`](https://github.com/ttezel/twit), [`bracket-data`](http://github.com/tweetyourbracket/bracket-data), [`bracket-finder`](http://github.com/tweetyourbracket/bracket-finder). But feel free to use this a basis for something else.

### LICENSE

MIT
