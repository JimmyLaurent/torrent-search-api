const Promise = require('bluebird');
const format = require('string-format');
const TorrentProvider = require('../TorrentProvider');

class _1337x extends TorrentProvider {
  constructor() {
    super({
      name: '1337x',
      baseUrl: 'http://www.1337x.to',
      searchUrl: '/category-search/{query}/{cat}/1/',
      categories: {
        All: 'url:/search/{query}/1/',
        Movies: 'Movies',
        TV: 'TV',
        Games: 'Games',
        Music: 'Music',
        Anime: 'Anime',
        Applications: 'Apps',
        Documentaries: 'Documentaries',
        Xxx: 'XXX',
        Other: 'Other',
        Top100: 'url:/top-100'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 20,
      itemsSelector: 'tbody > tr',
      itemSelectors: {
        title: 'a:nth-child(2)',
        time: '.coll-date',
        seeds: '.seeds | int',
        peers: '.leeches | int',
        size: '.size@html | until:<sp',
        desc: 'a:nth-child(2)@href'
      },
      paginateSelector: '.pagination li:nth-last-child(2) a@href',
      torrentDetailsSelector: '.torrent-detail-page@html',
      enableCloudFareBypass: true
    });
  }

  downloadTorrent(torrent,path) {
    return this.xray(torrent.desc, '.infohash-box span').then(hash =>
      super.downloadTorrent({
        link: format('http://itorrents.org/torrent/{0}.torrent', hash)
      },path)
    );
  }
}

module.exports = _1337x;
