const cloudscraper = require('cloudscraper');

function makeDriver(opts) {
  return function driver(context, callback) {
    var url = context.url;
    opts.url = url;
    cloudscraper.request(opts, function (err, response, body) {
      return callback(err, body)
    });
  }
}

module.exports = makeDriver;
