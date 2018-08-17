const cloudscraper = require('cloudscraper');

function makeDriver(opts) {
  return function driver({ url }, callback) {
    cloudscraper.request(Object.assign(opts, { url }), (err, response, body) =>
      callback(err, body)
    );
  };
}

module.exports = makeDriver;
