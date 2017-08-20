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

    _isLogged() {
        return super._isLogged() && this.lastLoginTime && ((Date.now() - this.lastLoginTime) < 600000);
    }

    _login(cookie) {
        return super._login(cookie)
            .then(() => {
                this.lastLoginTime = Date.now();
            });
    }
}

module.exports = Yggtorrent;