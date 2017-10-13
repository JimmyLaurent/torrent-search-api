const _ = require('lodash');
const cloudscraper = require('cloudscraper');
const format = require('string-format');
const TorrentProvider = require('../torrent-provider');

class Yggtorrent extends TorrentProvider {

    _getScrapeDatas() {
        return {
            name: 'Yggtorrent',
            baseUrl: 'https://yggtorrent.com',
            requireAuthentification: true,
            supportCookiesAuthentification: true,
            supportCredentialsAuthentification: true,
            loginUrl: '/user/login',
            loginQueryString: 'id={username}&pass={password}',
            searchUrl: '/engine/search?q={query}',
            categories: {
                'All': '',
                'Movies': 'url:/torrents/2145?order=desc&sort=seed',
                'TV': 'url:/torrents/filmvideo/2184-serie-tv?order=desc&sort=seed',
                'Emulation': 'url:/torrents/2141-emulation?order=desc&sort=seed',
                'Games': 'url:/torrents/2142?order=desc&sort=seed',
                'Applications': 'url:/torrents/2144-application?order=desc&sort=seed',
                'Music': 'url:/torrents/2139-audio?order=desc&sort=seed',
                'Books': 'url:/torrents/2140-ebook?order=desc&sort=seed',
                'GPS': 'url:/torrents/2143-gps?order=desc&sort=seed'
            },
            categories_yggtorrent: {
                'Movies': 'filmvidéo/film',
                'TV': 'filmvidéo/série-tv',
                'Emulation': 'emulation',
                'Games': 'jeu-vidéo',
                'Applications': 'application',
                'Music': 'audio',
                'Books': 'ebook',
                'Presse': 'ebook/presse',
                'GPS': 'gps',
            },
            defaultCategory: 'All',
            resultsPerPageCount: 15,
            itemsSelector: '.table-striped tr',
            itemSelectors: [{
                title: '.torrent-name@text',
                time: 'td:nth-child(3)@text | replace:"\n" | replace:"il y a ", | trim',
                seeds: 'td:nth-child(6)@text | replace:"--",0 | int',
                peers: 'td:nth-child(5)@text | replace:"--",0 | int',
                size: 'td:nth-child(4)@text',
                link: 'td:nth-child(1) > a[target="_blank"]@href',
                desc: '.torrent-name@href',
            }],
            paginateSelector: 'a[rel="next"]@href',
            torrentDetailsSelector: '#description@html',
            enableCloudFareBypass: true,
        };
    }

    _isLogged() {
        return super._isLogged() && this.lastLoginTime && ((Date.now() - this.lastLoginTime) < 600000);
    }

    _login(cookie) {
        return super._login(cookie)
            .then(() => {
                this.lastLoginTime = Date.now();
            });
    }

    /*
      bypass cloudfare for all requests
      torrent-provider use `xray` for search (cloudfare ok) but `request` for login & download (cloudfare nok)
    */
    _request(url, options = {}, body = null, ensureLogin = true) {
        let ensureLoginPromise = ensureLogin ? this._ensureLogin() : Promise.resolve();

        let opts = Object.assign({
            url: url,
            method: 'GET',
            jar: this.cookieJar,
            headers: this.headers,
            form: body
        }, options);

        return ensureLoginPromise.then(() => new Promise((resolve, reject) => {
            cloudscraper.request(opts, (error, response, body) => {
                if (error) reject(error)
                else resolve({
                    body: body
                })
            })
        }))
    }

    /*
      YggTorrent doesn't support search on category for now
      Simulate search on category by filtering results
      TODO: problem number of results is not guaranteed

      YggTorrent search doesn't require login, so auth is skiped
    */
    search(query, category, limit) {
        let pageLimit = this._getPageToFetchCount(limit);
        let url = this._getUrl(category, query);
        if (url === null) {
            return Promise.resolve();
        }
        category = _.findKey(this.scrapeDatas.categories_yggtorrent, (c, k) => k.toUpperCase() === category.toUpperCase())
        category = this.scrapeDatas.categories_yggtorrent[category]

        return this._search(url, pageLimit).then((result) => this._postProcess(result, category));
    }

    _postProcess(results, category = null) {
        results.forEach(r => {
            let m = /\/torrent\/(.+)\/[^\/]+/.exec(r.desc)
            r.category = m ? m[1] : null
            r.provider = this.scrapeDatas.name
        })
        if (!category) return results;
        return results.filter(r => r.category && r.category.startsWith(category));
    }

    /*
      YggTorrent doesn't support search on category for now
      torrent-provider url search building is modified here
    */
    _getUrl(category, query) {
        let url = this.scrapeDatas.baseUrl + format(this.scrapeDatas.searchUrl, {
            query: query ? encodeURIComponent(query) : ''
        });
        return url;
    }

}

module.exports = Yggtorrent;
