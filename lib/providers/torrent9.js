const TorrentProvider = require('../TorrentProvider');

class Torrent9 extends TorrentProvider {
  constructor() {
    super({
      name: 'Torrent9',
      baseUrl: 'https://torrent9.to/',
      enableCloudFareBypass: true,
      searchUrl: '/search_torrent/{query}',
      categories: {
        All: '',
        Movies: 'url:/search_torrent/films/{query}.html',
        TV: 'url:/search_torrent/series/{query}.html',
        Music: 'url:/search_torrent/musique/{query}.html',
        Apps: 'url:/search_torrent/logiciels/{query}.html',
        Books: 'url:/search_torrent/ebook/{query}.html',
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
