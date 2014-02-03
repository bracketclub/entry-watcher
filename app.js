#!/usr/bin/env node

var id = process.argv[2],
    Twit = require('twit'),
    _ = require('underscore'),
    config = require('../config.js'),
    appPackage = require('../package'),
    Database = new require('tweetyourbracket-db'),
    db = new Database(config.db),
    log = require('simplest-log'),
    bracket = require('bracket-validator')({props: 'finder'}),
    finder = new bracket.finder({appName: appPackage.name, trackTwitter: config.twitter.hashtags[0]}),
    T = new Twit(config.twitter.keys);

T.get('statuses/show/' + id, function(err, data) {
  if (!_.has(data, 'retweeted_status')) {
    finder.find(data, function(err, res) {
      if (err) return log.debug('No bracket in tweet ' + data.id_str + ' from ' + data.user.screen_name + ' : ' + err.message);

      var validBracket = res,
          bracketTime = new Date(data.created_at).getTime(),
          record = {};

      record = {
        created: bracketTime,
        bracket: validBracket.toUpperCase(),
        user_id: data.user.id_str,
        tweet_id: data.id_str,
        username: data.user.screen_name.toLowerCase(),
        name: data.user.name,
        profile_pic: data.user.profile_image_url
      };

      db.findOneAndUpdate({user_id: record.user_id}, record, {upsert: true}, function(err, doc) {
        if (err) return log.debug('BRACKET NOT SAVED: ' + record.tweet_id + ' from ' + record.username);
        log.debug('BRACKET SAVED: ' + record.tweet_id + ' from ' + record.username);
      });
    });
  }
});


var Twit = require('twit'),
    _ = require('underscore'),
    config = require('../config.js'),
    async = require('async'),
    Database = new require('tweetyourbracket-db'),
    db = new Database(config.db),
    log = require('simplest-log'),
    bracket = require('bracket-validator')(),
    T = new Twit(config.twitter.keys),
    bracketsClose = bracket.locks[new Date().getFullYear()],
    bracketsCloseTime = new Date(bracketsClose).getTime();

function TwitterWatcher(options) {
  options = options || {};

  this.tag = options.tag || '';
  this.finder = new bracket.finder({appName: options.appName, trackTwitter: options.tag});
  this.stream = null;
}

TwitterWatcher.prototype.stop = function() {
  log.debug('Closing twitter stream');
  this.stream.stop();
};

TwitterWatcher.prototype.start = function() {

  var self = this,
      now = new Date().getTime();

  if (bracketsCloseTime - now > 0) {
    log.debug('TWITTER: Listening to ' + self.tag + ' until ' + (bracketsClose - now));

    self.stream = T.stream('statuses/filter', {track: self.tag});

    self.stream.on('tweet', function(data) {

      log.debug('TWEET: ' + data.user.screen_name + ':' + data.id_str);

      if (!_.has(data, 'retweeted_status')) {
        self.finder.find(data, function(err, res) {
          if (err) return log.debug('No bracket in tweet ' + data.id_str + ' from ' + data.user.screen_name + ' : ' + err.message);

          var validBracket = res,
              bracketTime = new Date(data.created_at).getTime(),
              record = {};

          if (validBracket && bracketTime < bracketsClose) {

            record = {
              created: bracketTime,
              bracket: validBracket.toUpperCase(),
              user_id: data.user.id_str,
              tweet_id: data.id_str,
              username: data.user.screen_name.toLowerCase(),
              name: data.user.name,
              profile_pic: data.user.profile_image_url
            };

            db.upsertBracket(record, function(err, doc) {
              if (err) return log.debug('BRACKET NOT SAVED: ' + doc.tweet_id + ' from ' + doc.username);
              log.debug('BRACKET SAVED: ' + doc.tweet_id + ' from ' + doc.username);
            });
          }
        });
      }
    });

    setTimeout(function() {
      self.stop();
    }, bracketsClose - now);

  } else {
    return log.debug('TWITTER: Too late to tweet');
  }
};

module.exports = TwitterWatcher;



var express = require('express'),
    appPackage = require('./package'),
    config = require('./config'),
    http = require('http'),
    log = require('simplest-log'),
    app = express(),
    TwitterWatcher = require('./lib/twitter'),
    twitter = new TwitterWatcher({appName: appPackage.name, tag: config.twitter.hashtags[0]}),

    app = express();

app.configure(function () {
  app.set('port', 8081);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

http.createServer(app).listen(app.get('port'), function () {
  log.debug('Express server listening', app.get('port'), app.settings.env);
  twitter.start();
});
