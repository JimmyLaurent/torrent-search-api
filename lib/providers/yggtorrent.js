const TorrentProvider = require('../torrent-provider');

class Yggtorrent extends TorrentProvider {
  _getScrapeDatas() {
    return {
      name: 'Yggtorrent',
      baseUrl: 'https://yggtorrent.is',
      requireAuthentification: true,
      supportCookiesAuthentification: true,
      supportCredentialsAuthentification: true,
      enableCloudFareBypass: true,
      loginUrl: '/user/login',
      loginQueryString: 'id={username}&pass={password}',
      searchUrl:
        '/engine/search?name={query}&do=search&order=desc&sort=seed&category={cat}',
      categories: {
        All: '',
        Videos: '2145',
        Movies: '2145&subcategory=2183',
        TV: '2145&subcategory=2184',
        Emulation: '2141',
        Games: '2142',
        Applications: '2144',
        Music: '2139',
        Books: '2140',
        GPS: '2143',
        XXX: '2188'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 25,
      itemsSelector: '.results tr',
      itemSelectors: [
        {
          title: 'td:nth-child(2) a@text | replace:"\n" | replace:"\r" | trim',
          time: 'td:nth-child(5) div@text | int',
          seeds: 'td:nth-child(8)@text | int',
          peers: 'td:nth-child(9)@text | int',
          size: 'td:nth-child(6)@text',
          desc: 'td:nth-child(2) a@href',
          id: 'td:nth-child(3) a@target'
        }
      ],
      paginateSelector: 'a[rel="next"]@href',
      torrentDetailsSelector: '#description@html'
    };
  }

  search(query, category, limit) {
    this.skipNextLogin = true;
    return super.search(query, category, limit);
  }

  _isLogged() {
    return (
      super._isLogged() &&
      this.lastLoginTime &&
      Date.now() - this.lastLoginTime < 600000
    );
  }

  _login(cookie) {
    if (this.skipNextLogin) {
      this.skipNextLogin = false;
      return Promise.resolve();
    }
    return super._login(cookie).then(() => {
      this.lastLoginTime = Date.now();
    });
  }

  _postProcess(results) {
    results = super._postProcess(results);
    results.forEach(torrent => {
      torrent.time = new Date(torrent.time * 1000);
      torrent.link =
        this.scrapeDatas.baseUrl + '/engine/download_torrent?id=' + torrent.id;
    });
    return results;
  }
}

module.exports = Yggtorrent;
