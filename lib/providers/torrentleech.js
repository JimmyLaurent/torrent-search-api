const TorrentProvider = require('../torrent-provider');

class TorrentLeech extends TorrentProvider {
  _getScrapeDatas() {
    return {
      name: 'TorrentLeech',
      baseUrl: 'https://www.torrentleech.org',
      requireAuthentification: true,
      supportCookiesAuthentification: true,
      supportCredentialsAuthentification: false /* Doesn't seem to work well */,
      loginUrl: '/user/account/login/',
      loginQueryString: 'username={username}&password={password}',
      searchUrl:
        '/torrents/browse/index/query/{query}/categories/{cat}/orderby/seeders/order/desc',
      categories: {
        All: '',
        Movies: '1,8,9,11,37,43,14,12,13,41,15,29,36',
        TV: '2,26,32,27',
        Games: '3,17,42,18,19,40,20,21,39,22,28,30',
        Music: '4,31,16',
        Books: '5,45,46'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 35,
      itemsSelector: 'table[id="torrenttable"] tr',
      itemSelectors: [
        {
          title: 'span.title',
          time: '.addedInLine | split:on,1 | trim',
          downloaded: 'td:nth-child(6) | int',
          seeds: 'td.seeders | int',
          peers: 'td.leechers | int',
          size: 'td:nth-child(5)',
          link: '.quickdownload a@href',
          desc: 'span.title a@href'
        }
      ],
      paginateSelector: '.pagnext@href',
      torrentDetailsSelector: '.torrentinfotable@html',
      enableCloudFareBypass: false
    };
  }
}

module.exports = TorrentLeech;
