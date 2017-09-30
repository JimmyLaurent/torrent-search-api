const Promise = require('bluebird');
const TorrentProvider = require('../torrent-provider');

class T411 extends TorrentProvider {

  _getScrapeDatas() {
    return {
      name: 'T411',
      baseUrl: 'https://t411.si',
      searchUrl: '/torrents/search/?search={query}&category={cat}&sortby=seeds&sort=desc',
      categories: {
        'All': '',
        'Movies': '1',
        'TV': '2',
        'Games': '7',
        'Music': '4',
        'Anime': '3',
        'Applications': '6',
        'Documentaries': '8',
        'Books': '5',
        'Xxx': '9',
        'Top100': 'url:/top/100/'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 20,
      itemsSelector: 'tbody .isItem.isItemDesk',
      itemSelectors: [{
        title: '.wb > a@text | trim',
        time: '.m-age@text',
        seeds: '.m-seeders@text | int',
        peers: '.m-leechers@text | int',
        size: '.m-taille > span@text',
        desc: '.wb > a@href'
      }],
      paginateSelector: '.next > a@href',
      torrentDetailsSelector: '.main@html'
    };
  }

  _downloadTorrent(torrent) {
    return Promise.fromCallback(this._x(torrent.desc, 'a[href*="/telecharger-torrent"]@href')).then(link => {
        return super._downloadTorrent({ link: link });
    });
  }
}

module.exports = T411;
