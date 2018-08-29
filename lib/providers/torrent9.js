const TorrentProvider = require('../TorrentProvider');

class Torrent9 extends TorrentProvider {
  constructor() {
    super({
      name: 'Torrent9',
      baseUrl: 'https://www.torrent9.ph',
      enableCloudFareBypass: true,
      searchUrl: '/search_torrent/{cat}/{query}/page-0',
      categories: {
        All: '',
        Movies: 'films',
        TV: 'series',
        Music: 'musique',
        Apps: 'logiciels',
        Books: 'ebook',
        Top100: 'url:/top_torrent.php'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 60,
      itemsSelector: 'tbody > tr',
      itemSelectors: {
        title: 'a',
        seeds: '.seed_ok | int',
        peers: 'td:nth-child(4) | int',
        size: 'td:nth-child(2)',
        desc: 'a@href'
      },
      paginateSelector: 'a:has(strong:contains(Suiv))@href',
      torrentDetailsSelector: '.movie-detail > .row:nth-child(1)@html',
      autoFixUnstableUrl: true
    });
  }

  downloadTorrentBuffer(torrent) {
    return this.xray(torrent.desc, '.download-btn > a@href')
      .then(link => this.request(link, { encoding: null }))
      .then(r => r.body);
  }
}

module.exports = Torrent9;
