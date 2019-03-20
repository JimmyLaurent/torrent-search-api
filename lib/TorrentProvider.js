const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
const { URL } = require('url');
const cloudscraperRequest = Promise.promisify(require('cloudscraper'));
const format = require('string-format');
const writeFile = Promise.promisify(require('fs').writeFile);

const Xray = require('x-ray-scraper/Xray');
const makeDriver = require('./utils/makeDriver');
const filters = require('./utils/filters');
const {
  isString,
  isArray,
  uniqueName,
  oneArgument,
  twoArguments
} = require('./utils/helpers');

module.exports = class TorrentProvider {
  constructor(definition) {
    this.cookieJar = request.jar();
    this.isActive = false;
    this.init(definition);
    this.initCrawler();
  }

  init(definition) {
    const defaultProps = {
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
      enableCloudFareBypass: false,
      headers: { 'User-Agent': 'Firefox/48.0' },
      magnetSelector: 'a[href*="magnet:?xt=urn:btih:"]@href',
      autoFixUnstableUrl: false
    };
    Object.assign(this, defaultProps, definition);
  }

  initCrawler() {
    this.xray = Xray();
    this.xray.setFilters(filters);
    this.xray.driver(makeDriver(url => this.request(url)));
  }

  enableProvider(...args) {
    if (!this.requireAuthentification) {
      this.isActive = true;
    } else if (
      this.supportCredentialsAuthentification &&
      TorrentProvider.isCredentialsAuthentification(args)
    ) {
      this.setCredentials(...args);
      this.isActive = true;
    } else if (
      this.supportTokenAuthentification &&
      TorrentProvider.isTokenAuthentification(args)
    ) {
      this.setToken(args[0]);
      this.isActive = true;
    } else if (
      this.supportCookiesAuthentification &&
      TorrentProvider.isCookieAuthentification(args)
    ) {
      this.setCookies(args[0]);
      this.isActive = true;
    } else {
      throw new Error(
        `Couldn't enable provider ${
          this.name
        } due to incorrect login information`
      );
    }
  }

  disableProvider() {
    this.isActive = false;
  }

  getInformations() {
    return {
      name: this.name,
      public: !this.requireAuthentification,
      categories: Object.keys(this.categories)
    };
  }

  overrideConfig(newConfig) {
    Object.assign(this, newConfig);
  }

  search(query, category, limit) {
    const pageLimit = TorrentProvider.computePageCount(
      limit,
      this.resultsPerPageCount
    );
    const url = this.getUrl(category, query);

    if (!url) {
      return Promise.resolve();
    }

    return this.ensureLogin()
      .then(() => this.fetchAndParseUrl(url, pageLimit))
      .then(result => this.postProcess(result));
  }

  getCategoryValue(categoryName) {
    if (!categoryName || categoryName === '') {
      return this.categories[this.defaultCategory];
    }

    const categoryKey = Object.keys(this.categories).find(
      key => uniqueName(key) === uniqueName(categoryName)
    );
    return categoryKey ? this.categories[categoryKey] : null;
  }

  getCategories() {
    return Object.keys(this.categories);
  }

  getUrl(category, query) {
    const cat = this.getCategoryValue(category);
    if (cat === null) return null;

    let url =
      this.baseUrl + (cat.startsWith('url:') ? cat.substr(4) : this.searchUrl);
    url = format(url, {
      cat,
      query: query ? encodeURIComponent(query) : ''
    });

    return url;
  }

  downloadTorrent(torrent, path) {
    return this.downloadTorrentBuffer(torrent).then(
      buffer => (path ? writeFile(path, buffer) : buffer)
    );
  }

  downloadTorrentBuffer(torrent) {
    return this.request(torrent.link, { encoding: null }).then(r => r.body);
  }

  getMagnet(torrent) {
    if (torrent.magnet) {
      return Promise.resolve(torrent.magnet);
    }
    return this.xray(encodeURI(torrent.desc), this.magnetSelector);
  }

  getTorrentDetails(torrent) {
    if (this.torrentDetailsSelector) {
      return this.xray(encodeURI(torrent.desc), this.torrentDetailsSelector);
    }
    return Promise.resolve();
  }

  setToken(token) {
    this.token = token;
  }

  setCredentials(username, password) {
    this.username = username;
    this.password = password;
  }

  setCookies(cookies) {
    cookies
      .map(request.cookie)
      .map(c => this.cookieJar.setCookie(c, this.baseUrl));
  }

  isLogged() {
    return this.cookieJar.getCookies(this.baseUrl).length > 0;
  }

  clearCookie() {
    this.cookieJar = request.jar();
  }

  ensureLogin() {
    if (!this.requireAuthentification || this.isLogged()) {
      return Promise.resolve();
    } else if (this.isActive && !this.isLogged()) {
      return this.login();
    }
    return Promise.reject(
      new Error(`Can't login: missing credentials for ${this.name}`)
    );
  }

  login() {
    return this.request(
      this.baseUrl + this.loginUrl,
      { method: 'POST' },
      this.getLoginBody(),
      false
    );
  }

  request(url, options = {}, body = null, ensureLogin = true) {
    const opts = Object.assign(
      {
        url,
        method: 'GET',
        jar: this.cookieJar,
        headers: this.headers,
        form: body
      },
      options
    );

    let req = this.enableCloudFareBypass ? cloudscraperRequest : request;
    const doRequest = () =>
      this.autoFixUnstableUrl ? this.fixUnstableUrl(req, opts) : req(opts);

    if (ensureLogin) {
      return this.ensureLogin().then(() => doRequest());
    }
    return doRequest();
  }

  fixUnstableUrl(req, opts) {
    return req({ ...opts, followRedirect: false }).then(response => {
      if (
        this.autoFixUnstableUrl &&
        response.statusCode >= 300 &&
        response.statusCode < 400
      ) {
        const { origin } = new URL(response.headers.location);
        if (this.baseUrl !== origin) {
          this.oldBaseUrl = this.baseUrl;
          this.baseUrl = origin;
          opts.url = opts.url.replace(this.oldBaseUrl, this.baseUrl);
          this.clearCookie();
        }
        return req(opts);
      }
      return response;
    });
  }

  getLoginBody() {
    return format(this.loginQueryString, {
      username: this.username,
      password: this.password
    });
  }

  fetchAndParseUrl(url, limit) {
    return this.xray(url, this.itemsSelector, [this.itemSelectors])
      .paginate(this.paginateSelector)
      .limit(limit);
  }

  postProcess(results) {
    return results.map(r => {
      /* eslint-disable-next-line no-param-reassign */
      r.provider = this.name;
      return r;
    });
  }

  static isTokenAuthentification(args) {
    return oneArgument(args) && isString(args[0]);
  }

  static isCookieAuthentification(args) {
    return oneArgument(args) && isArray(args[0]);
  }

  static isCredentialsAuthentification(args) {
    return twoArguments(args) && isString(args[0]) && isString(args[1]);
  }

  static computePageCount(askedCount, resultsPerPageCount) {
    return askedCount ? Math.ceil(askedCount / resultsPerPageCount) : 1;
  }
};
