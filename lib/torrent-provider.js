const Promise = require('bluebird');
const request = Promise.promisify(require("request"));
const cloudscraperRequest = Promise.promisify(require("cloudscraper").request);
const fs = require('fs');
const format = require('string-format');
const _ = require('lodash');

const Xray = require('x-ray');
const makeDriver = require('request-x-ray');
const makeCloudFareDriver = require('./utils/cloudfare-driver');
const filters = require('./utils/filters');

module.exports = class TorrentProvider {

  constructor() {
    this.cookieJar = request.jar();
    this.headers = { 'User-Agent': 'Firefox/48.0' };

    this.scrapeDatas = {
      name: '',
      baseUrl: '',
      requireAuthentification: false,
      supportTokenAuthentification: false,
      supportCookiesAuthentification: false,
      supportCredentialsAuthentification: false,
      loginUrl: '',
      loginQueryString: '',
      searchUrl: '',
      categories: {},
      defaultCategory: '',
      resultsPerPageCount: 50,
      itemsSelector: '',
      itemSelectors: [],
      paginateSelector: '',
      torrentDetailsSelector: '',
      enableCloudFareBypass: false
    };

    Object.assign(this.scrapeDatas, this._getScrapeDatas());
  }

  enableProvider() {
    if (arguments.length === 0 && !this.scrapeDatas.requireAuthentification) {
      this.isActive = true;
    }
    else if (arguments.length === 1) {
      if (typeof arguments[0] === 'string') {
        if (!this.scrapeDatas.supportTokenAuthentification) {
          throw new Error(`${this.scrapeDatas.name} provider doesn't support token authentification`);
        }
        this._setToken(arguments[0]);
        this.isActive = true;
      }
      else if (arguments[0] instanceof Array) {
        if (!this.scrapeDatas.supportCookiesAuthentification) {
          throw new Error(`${this.scrapeDatas.name} provider doesn't support cookie authentification`);
        }
        this._setCookies(arguments[0]);
        this.isActive = true;
      }
    }
    else if (arguments.length === 2 && typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
      if (!this.scrapeDatas.supportCredentialsAuthentification) {
        throw new Error(`${this.scrapeDatas.name} provider doesn't support credentials authentification`);
      }
      this._setCredentials(arguments[0], arguments[1]);
      this.isActive = true;
    }
    if (!this.isActive) {
      throw new Error('Problem with credentials, cookie or token for ' + this.scrapeDatas.name + ' (missing ?)');
    }
  }

  disableProvider() {
    this.isActive = false;
  }

  getName() {
    return this.scrapeDatas.name;
  }

  getInfos() {
    return {
      name: this.scrapeDatas.name,
      public: !this.scrapeDatas.requireAuthentification,
      categories: this._getCategories()
    };
  }

  search(query, category, limit) {
    let pageLimit = this._getPageToFetchCount(limit);
    let url = this._getUrl(category, query);

    if (url === null) {
      return Promise.resolve();
    }

    return this._ensureLogin()
      .then(() => this._search(url, pageLimit))
      .then((result) => this._postProcess(result));
  }

  downloadTorrent(torrent, path) {
    return this._downloadTorrent(torrent).then(buffer => {
      if (path) {
        return new Promise((resolve, reject) => {
          fs.writeFile(path, buffer, err => {
            if (err) {
              reject(err);
            }
            else {
              resolve();
            }
          });
        });
      }
      else {
        return buffer;
      }
    });
  }

  getMagnet(torrent) {
    if (torrent.magnet) {
      return Promise.resolve(torrent.magnet);
    }
    return this._getMagnet(torrent);
  }

  getTorrentDetails(torrent) {
    if (this.scrapeDatas.torrentDetailsSelector) {
      return Promise.fromCallback(this._x(encodeURI(torrent.desc), this.scrapeDatas.torrentDetailsSelector));
    }
    return Promise.resolve();
  }

  /* Pseudo private methods */

  _getScrapeDatas() {
  }

  _setToken(token) {
  }

  _setCredentials(username, password) {
    this.username = username;
    this.password = password;
  }

  _setCookies(cookies) {
    cookies.map(request.cookie).map(c => this.cookieJar.setCookie(c, this.scrapeDatas.baseUrl));
  }

  _getCategories() {
    return Object.keys(this.scrapeDatas.categories);
  }

  _isLogged() {
    return this.cookieJar.getCookies(this.scrapeDatas.baseUrl).length > 0;
  }

  _ensureLogin() {
    if (!this.scrapeDatas.requireAuthentification || this._isLogged()) {
      return Promise.resolve();
    }
    else if (this.username && this.password) {
      return this._login();
    }
    else {
      return Promise.reject(`Can't login: no credentials neither cookie was given for ${this.scrapeDatas.name}`);
    }
  }

  _login(cookie) {
    return this._request(this.scrapeDatas.baseUrl + this.scrapeDatas.loginUrl, { method: 'POST' }, this._getLoginBody(), false);
  }

  _request(url, options = {}, body = null, ensureLogin = true) {
    let ensureLoginPromise = ensureLogin ? this._ensureLogin() : Promise.resolve();
    let req = this.scrapeDatas.enableCloudFareBypass ? cloudscraperRequest : request;

    let opts = Object.assign({
      url: url,
      method: 'GET',
      jar: this.cookieJar,
      headers: this.headers,
      form: body
    }, options);

    return ensureLoginPromise.then(() => req(opts));
  }

  _getMagnet(torrent) {
    return Promise.fromCallback(this._x(torrent.desc, 'a[href*="magnet:?xt=urn:btih:"]@href'));
  }

  _downloadTorrent(torrent) {
    return this._request(torrent.link, { encoding: null }).then(r => r.body);
  }

  _getPageToFetchCount(limit) {
    if (limit && limit !== 'undefined') {
      return Math.ceil(limit / this.scrapeDatas.resultsPerPageCount);
    }
    return 1;
  }

  _getUrl(category, query) {

    // if cateogry not given, take the default one
    if (category === undefined) {
      category = this.scrapeDatas.defaultCategory;
    }

    // if the category given doesn't exist, return null
    category = this._getCategory(category);
    if (category === undefined) {
      return null;
    }

    let url = this.scrapeDatas.baseUrl;

    // if the category value given begin with url:, take the url as is
    if (this.scrapeDatas.categories[category].startsWith('url:')) {
      url += this.scrapeDatas.categories[category].substr(4);
    }
    else {
      url += this.scrapeDatas.searchUrl;
    }

    url = format(url, {
      cat: this.scrapeDatas.categories[category],
      query: query ? encodeURIComponent(query) : ''
    });

    return url;
  }

  _getCategory(category) {
    return category && _.findKey(this.scrapeDatas.categories, (c, k) => k.toUpperCase() === category.toUpperCase());
  }

  _getLoginBody() {
    return format(this.scrapeDatas.loginQueryString, { username: this.username, password: this.password });
  }

  _search(url, limit) {
    return Promise.fromCallback(this._x(url, this.scrapeDatas.itemsSelector, this.scrapeDatas.itemSelectors)
      .paginate(this.scrapeDatas.paginateSelector)
      .limit(limit));
  }

  _postProcess(results) {
    return results.map(r => {
      r.provider = this.scrapeDatas.name;
      return r;
    });
  }

  _x(source, scope, selector) {
    if (!this.__x) {

      let driver;
      if (this.scrapeDatas.enableCloudFareBypass) {
        driver = makeCloudFareDriver;
      }
      else {
        driver = makeDriver;
      }

      this.__x = Xray({ filters: filters });
      this.__x.driver(driver({
        method: 'GET',
        jar: this.cookieJar,
        headers: this.headers
      }))
    }
    return this.__x(source, scope, selector);
  }
}
