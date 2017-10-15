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
                'Presse': 'ebook/presse',
                'GPS': 'gps',
                'TopMovies': 'url:/torrents/2145?order=desc&sort=seed',
                'TopTV': 'url:/torrents/filmvideo/2184-serie-tv?order=desc&sort=seed',
                'LastMovies': 'url:/torrents/filmvideo/2183-film',
                'LastTV': 'url:/torrents/filmvideo/2184-serie-tv',
                'LastGames': 'url:/torrents/2142-jeu+vidéo',
                'LastApplications': 'url:/torrents/2144-application',
                'LastMusic': 'url:/torrents/2139-audio',
                'LastBooks': 'url:/torrents/2140-ebook',
                'LastPresse': 'url:/torrents/ebook/2156-presse',
                'LastGPS': 'url:/torrents/2143-gps',
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
            torrentDetailsSelector: '#description@html',
        };
    }

    search(query, category, limit) {
        return super.search(query, category, limit, this._filterOnCategory(category))
    }

    _list(url) {
        this.skipNextLogin = true;
        return super._list(url);
    }

    _filterOnCategory(category) {
        category = this._getCategory(category);
        if (!category || category.toUpperCase().startsWith('TOP') || category.toUpperCase().startsWith('LAST')) {
            return (r) => true
        }
        let inc = '/torrent/' + this.scrapeDatas.categories[category]
        return (r) => r.desc.includes(inc)
    }

    _isLogged() {
        return super._isLogged() && this.lastLoginTime && ((Date.now() - this.lastLoginTime) < 600000);
    }

    _login(cookie) {
        if (this.skipNextLogin) {
            this.skipNextLogin = false;
            return Promise.resolve();
        }
        return super._login(cookie)
            .then(() => {
                this.lastLoginTime = Date.now();
            });
    }
}

module.exports = Yggtorrent;
