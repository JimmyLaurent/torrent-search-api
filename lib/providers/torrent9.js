const TorrentProvider = require('../torrent-provider');

class Torrent9 extends TorrentProvider {

  _getScrapeDatas() {
    return {
      name: 'Torrent9',
      baseUrl: 'http://www.torrent9.red',
      enableCloudFareBypass: true,
      searchUrl: '/search_torrent/{cat}/{query}/page-0',
      categories: {
        'All': '',
        'Movies': 'films',
        'TV': 'series',
        'Music': 'musique',
        'Apps': 'logiciels',
        'Books': 'ebook',
        'Top100': 'url:/top_torrent.php'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 60,
      itemsSelector: 'tbody > tr',
      itemSelectors: [{
        title: 'a',
        time: 'td:nth-child(5)',
        seeds: '.seed_ok | int',
        peers: 'td:nth-child(4) | int',
        size: 'td:nth-child(2)',
        link: 'a@href | replace:/torrent,/get_torrent | format:{0}.torrent',
        desc: 'a@href'
      }],
      paginateSelector: 'a:has(strong:contains(Suiv))@href',
      torrentDetailsSelector: '.movie-detail > .row:nth-child(1)@html',
      enableCloudFareBypass: true
    };
  }
}

module.exports = Torrent9;
