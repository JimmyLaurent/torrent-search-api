const TorrentProvider = require('../TorrentProvider');

class Torrent9 extends TorrentProvider {
  constructor() {
    super({
      name: 'Torrent9',
      baseUrl: 'https://www.torrent9.ninja',
      enableCloudFareBypass: true,
      searchUrl: '/recherche/{query}',
      categories: {
        All: '',
        Movies: 'url:/torrents/films',
        TV: 'url:/torrents/series',
        Music: 'url:/torrents/musique',
        Apps: 'url:/torrents/logiciels',
        Books: 'url:/torrents/ebook',
        Top100: 'url:/top'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 60,
      itemsSelector: 'table tr',
      itemSelectors: {
        title: 'a',
        seeds: '.seed_ok | int',
        peers: 'td:nth-child(4) | int',
        size: 'td:nth-child(2)',
        desc: 'a@href | replace:t//,t/'
      },
      paginateSelector: 'a:contains(Suivant ►)@href',
      torrentDetailsSelector: '.movie-detail > .row:nth-child(1)@html'
    });
  }

  downloadTorrentBuffer(torrent) {
    return this.xray(torrent.desc, '.download-btn > a@href')
      .then(link => this.request(link, { encoding: null }));
  }
}

module.exports = Torrent9;
