const TorrentProvider = require('../TorrentProvider');

class TorrentProject extends TorrentProvider {
  constructor() {
    super({
      name: 'TorrentProject',
      baseUrl: 'https://torrentproject.cc',
      searchUrl: '/?t={query}&orderby=seeders',
      categories: {
        All: ''
      },
      defaultCategory: 'All',
      resultsPerPageCount: 50,
      itemsSelector: '#similarfiles > div:not(.gac_bb)',
      itemSelectors: {
        title: 'a@text',
        time: 'span:nth-child(4)@text',
        seeds: 'span:nth-child(3)@text | int',
        peers: 'span:nth-child(4)@text | int',
        size: 'span:nth-child(5)@text',
        desc: 'a@href'
      },
      paginateSelector: 'td.cur + td > a@href',
      torrentDetailsSelector: '#res2@text',
      magnetSelector: '.usite a@href | match:"url=(.+)" | decodeURIComponent'
    });
  }

  downloadTorrent() {
    throw new Error('Not implemented');
  }
}

module.exports = TorrentProject;
