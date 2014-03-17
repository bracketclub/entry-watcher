var FetchTweets = require('../lib/fetch');
var program = require('commander');
var modulePackage = require('../package');

program
    .version(modulePackage.version)
    .option('--tweet [tweet]', 'Tweet', String, '')
    .option('--year [year]', 'Year', String, new Date().getFullYear())
    .parse(process.argv);

new FetchTweets([{fromTweet: program.tweet}], program.year).getEntries();