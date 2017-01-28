const TorrentProvider = require('../torrent-provider');

class FreshonTV extends TorrentProvider {

  _getScrapeDatas() {
    return {
      name: 'FreshonTV',
      baseUrl: 'https://freshon.tv',
      requireAuthentification: true,
      supportCookiesAuthentification: true,
      supportCredentialsAuthentification: true,
      loginUrl: '/login.php?action=makelogin',
      loginQueryString: 'username={username}&password={password}',
      searchUrl: '/browse.php?search={query}&sort=seeders&d=DESC&incldead=0&page=0&cat={cat}',
      categories: {
        'TV': '',
        '...2010 World Cup Africa...': '457',
        '..Anime..': '235',
        '..Cartoons..': '17',
        '..Comedy..': '262',
        '..Documentaries..': '15',
        '..Miniseries..': '231',
        '..NBA..': '450',
        '..Other..': '16',
        '..Racing..': '603',
        '..Reality-TV..': '13',
        '..Sports..': '156'
      },
      defaultCategory: 'TV',
      resultsPerPageCount: 50,
      itemsSelector: 'tr[class*="torrent_"]',
      itemSelectors: [{
        title: 'td[class*="table_name"] > div > a | trim',
        freeleech: '.table_icons > img@alt | replace: Free, | trim',
        time: 'td[class*="table_added"] | trim',
        seeds: 'td[class*="table_seeders"] | int',
        peers: 'td[class*="table_leechers"] | int',
        size: 'td[class*="table_size"] | trim',
        link: 'td[class*="table_links"] > a@href',
        desc: 'td[class*="table_name"] > div > a@href'
      }],
      paginateSelector: 'a:contains(»)@href',
      torrentDetailsSelector: 'td[class*="frame"]:nth-child(1)@html',
      enableCloudFareBypass: false
    };
  }

  _postProcess(results) {
    return super._postProcess(results).map((r) => {
      r.title = `${r.freeleech ? '[' + r.freeleech + '] ' : ''}${r.title}`;
      return r;
    });
  }
}

module.exports = FreshonTV;
