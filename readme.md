tweet-watcher
==============

Tweet watcher for tweetyourbracket.com

## Usage

1. Create `config.js` file in root with `db` connection string to a mongodb instance and a `twitter` object with `consumer_key`, `consumer_secret`, `access_token`, `access_token_secret`
2. `npm install`
3. `npm start`

You also will want to edit some variables in `index.js`. Namely `HASHTAGS` and `DOMAIN`.

## What is it doing?

It is setting up a Twitter listener using [`twit`](https://github.com/ttezel/twit) and when a tweet is found, it is checking whether it contains a valid bracket. If it does, it will add it to the db.

## Is it on npm?

No. There's a lot of specific code here and it wouldn't make sense to publish this as it is currently. Most of the code here is configuration of some other modules which are on npm such as [`twit`](https://github.com/ttezel/twit), [`bracket-data`](http://github.com/tweetyourbracket/bracket-data), [`bracket-finder`](http://github.com/tweetyourbracket/bracket-finder).

