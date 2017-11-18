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
      searchUrl: '/engine/search?q={query}&order=desc&sort=seed&category={cat}',
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
      defaultCategory: "All",
      resultsPerPageCount: 25,
      itemsSelector: '.table-striped tr',
      itemSelectors: [
        {
          title: '.torrent-name@text',
          time: 'td:nth-child(3)@text | replace:"\n" | replace:"il y a ", | trim',
          seeds: 'td:nth-child(5)@text | replace:"--",0 | int',
          peers: 'td:nth-child(6)@text | replace:"--",0 | int',
          size: 'td:nth-child(4)@text',
          link: 'td:nth-child(1) > a[href*="download_torrent"]@href',
          desc: '.torrent-name@href'
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
}

module.exports = Yggtorrent;
