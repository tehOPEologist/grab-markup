#!/usr/bin/env node

var Promise = require('bluebird');
var bhttp = require('bhttp');
var cheerio = require('cheerio');
var fs = require('fs');
var mkdirp = require('mkdirp');
var minify = require('html-minifier').minify;
var chalk = require('chalk');

var config = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

Promise.each(config.liveData.pages, function (url) {
  return bhttp.get('http://' + url).then(function (response) {
    var response = response.body.toString();
    $ = cheerio.load(response);

    var data = $('script, noscript, style').remove();
    data = $('body').html();

    data = minify(data, {
      removeComments: true,
      collapseWhitespace: true,
      conservativeCollapse: true
    });

    mkdirp(config.liveData.destination, function(err) {
      if (err) {
        process.stdout.write(err);
      } else {
        url = url.replace(/\//g, '-');

        fs.writeFile(config.liveData.destination + '/' + url + '.txt', data);
      }
    });

    process.stdout.write(chalk.green('Fetched ' + url + '\n'));
  });
});
