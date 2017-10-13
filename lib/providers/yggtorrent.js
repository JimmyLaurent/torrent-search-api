const TorrentProvider = require('../torrent-provider');


class Yggtorrent extends TorrentProvider {

    _getScrapeDatas() {
        return {
            name: 'Yggtorrent',
            baseUrl: 'https://yggtorrent.com',
            requireAuthentification: true,
            supportCookiesAuthentification: true,
            supportCredentialsAuthentification: true,
            enableCloudFareBypass: true,
            loginUrl: '/user/login',
            loginQueryString: 'id={username}&pass={password}',
            searchUrl: '/engine/search?q={query}',
            categories: {
                'All': '',
                'Movies': 'filmvidéo/film',
                'TV': 'filmvidéo/série-tv',
                'Emulation': 'emulation',
                'Games': 'jeu-vidéo',
                'Applications': 'application',
                'Music': 'audio',
                'Books': 'ebook',
                'GPS': 'gps',
                'TopMovies': 'url:/torrents/2145?order=desc&sort=seed',
                'TopTV': 'url:/torrents/filmvideo/2184-serie-tv?order=desc&sort=seed'
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
                desc: '.torrent-name@href'
            }],
            paginateSelector: 'a[rel="next"]@href',
            torrentDetailsSelector: '#description@html'
        };
    }

    search(query, category, limit) {
        this.skipNextLogin = true; 
        return super.search(query, category, limit)
            .then(results => this._filterResults(results, category));
    }

    _isLogged() {
        return super._isLogged() && this.lastLoginTime && ((Date.now() - this.lastLoginTime) < 600000);
    }

    _login(cookie) {
        if(this.skipNextLogin) {
            this.skipNextLogin = false;
            return Promise.resolve();
        }
        return super._login(cookie)
            .then(() => {
                this.lastLoginTime = Date.now();
            });
    }

    _filterResults(results, category) {
        category = this._getCategory(category);
        if (!category || category.startsWith('Top')) {
            return results;
        }
        return results.filter(r => r.desc.includes(this.scrapeDatas.categories[category]));
    }
}

module.exports = Yggtorrent;