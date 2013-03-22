#!/usr/bin/env node

/*global console */

var express = require('express'),
    appPackage = require('./package'),
    config = require('./config'),
    http = require('http'),
    log = require('./lib/log'),
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
