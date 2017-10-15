const Promise = require('bluebird');
const request = Promise.promisify(require("request"));
const cloudscraperRequest = Promise.promisify(require("cloudscraper").request);
const fs = require('fs-extra');
const format = require('string-format');
const _ = require('lodash');

const Xray = require('x-ray');
const makeDriver = require('request-x-ray');
const makeCloudFareDriver = require('./utils/cloudfare-driver');
const filters = require('./utils/filters');

module.exports = class TorrentProvider {

    constructor() {
        this.cookieJar = request.jar();
        this.headers = {
            'User-Agent': 'Firefox/48.0'
        };

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

    addCategory(name, value) {
        this.scrapeDatas.categories[name] = value
    }

    search(query, category, limit, filter = null) {
        let url = this._getUrl(category, query);

        if (url === null) {
            return Promise.resolve();
        }

        return this.list(url, limit, filter)
            .then((result) => this._postProcess(result));
    }

    downloadTorrent(torrent, path) {
        return this._downloadTorrent(torrent).then(buffer => {
            if (path) {
                return fs.outputFile(path, buffer)
            }
            else {
                return buffer;
            }
        });
    }

    getTorrentDetails(torrent) {
        if (this.scrapeDatas.torrentDetailsSelector) {
            return Promise.fromCallback(this._x(encodeURI(torrent.desc), this.scrapeDatas.torrentDetailsSelector));
        }
        return Promise.resolve();
    }

    /* Pseudo private methods */

    _getScrapeDatas() {}

    _setToken(token) {}

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
        return this._request(this.scrapeDatas.baseUrl + this.scrapeDatas.loginUrl, {
            method: 'POST'
        }, this._getLoginBody(), false);
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

    _downloadTorrent(torrent) {
        return this._request(torrent.link, {
            encoding: null
        }).then(r => r.body);
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
        return format(this.scrapeDatas.loginQueryString, {
            username: this.username,
            password: this.password
        });
    }

    _postProcess(results) {
        results.forEach(r => {
            r.provider = this.scrapeDatas.name;
        });
        return results;
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

            this.__x = Xray({
                filters: filters
            });
            this.__x.driver(driver({
                method: 'GET',
                jar: this.cookieJar,
                headers: this.headers
            }))
        }
        return this.__x(source, scope, selector);
    }

    /*
    list torrents. limit is guaranteed
        limit: 50 (items) | {page:3} | {item:100}
        filter: filter function (Array.filter)
        returns: [torrents]
    */
    async list(url, limit = null, filter = null) {
        if (typeof limit == 'number') limit = {
            item: limit
        }
        var torrents = []
        for (let page = 1;; page++) {
            var res = Object.assign({
                torrents: [],
                next: null,
            }, await this._list(url))
            if (filter) res.torrents = res.torrents.filter(filter)
            res.torrents.forEach(t => torrents.push(t))
            if (limit && res.next) {
                if ((limit.page && limit.page > page) || (limit.item && limit.item > torrents.length)) {
                    url = res.next
                    continue
                }
            }
            break
        }
        return torrents
    }

    /*
        parse one page of result
        returns: {torrents:[], next:''}
    */
    _list(url) {
        return this._request(url)
            .then(res => res.body ? res.body.toString() : '')
            .then(html => Promise.fromCallback(this._x(html, {
                torrents: this._x(this.scrapeDatas.itemsSelector, this.scrapeDatas.itemSelectors),
                next: this.scrapeDatas.paginateSelector,
            })))
    }

}
