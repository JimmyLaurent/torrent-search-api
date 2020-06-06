let cloudscraper;
try {
  cloudscraper = require('cloudflare-scraper');
} catch (e) {
  cloudscraper = require('cloudscraper');
}

module.exports = cloudscraper;
