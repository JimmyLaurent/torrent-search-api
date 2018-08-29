const TorrentProvider = require('../torrent-provider');

class IpTorrents extends TorrentProvider {
  _getScrapeDatas() {
    return {
      name: 'IpTorrents',
      baseUrl: 'https://iptorrents.eu',
      requireAuthentification: true,
      supportCookiesAuthentification: true,
      supportCredentialsAuthentification: true,
      loginUrl: '/take_login.php',
      loginQueryString: 'username={username}&password={password}',
      searchUrl: '/t?{cat}q={query};o=seeders',
      categories: {
        All: '',
        Movies: '7;68;54;77;20;89;90;96;6;48;62;38;',
        TV: '73;',
        Games: '74;',
        Music: '75;'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 50,
      itemsSelector: 'table[id="torrents"] tr:not(:first-child)', //:not(:first-child)',
      itemSelectors: [
        {
          title: 'td:nth-child(2) a',
          time: 'tr:nth-child(2) div.t_ctime | split:%SPECIAL_CHAR%,1 | trim',
          downloaded: 'td:nth-child(7) | int',
          seeds: 'td:nth-child(8) | int',
          peers: 'td:nth-child(9) | int',
          size: 'td:nth-child(6)',
          link: 'td:nth-child(4) a@href',
          desc: 'td:nth-child(2) a@href'
        }
      ],
      paginateSelector: 'a:contains(Next)@href',
      torrentDetailsSelector: '.desWrap@html',
      enableCloudFareBypass: false
    };
  }
}

module.exports = IpTorrents;
