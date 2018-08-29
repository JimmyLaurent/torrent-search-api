const TorrentProvider = require('../torrent-provider');

class ExtraTorrent extends TorrentProvider {
  _getScrapeDatas() {
    return {
      name: 'ExtraTorrent',
      baseUrl: 'http://extratorrent.ag',
      searchUrl: '/search/?search={query}&new=1&x=0&y=0',
      categories: {
        All: '',
        Movies: 'url:/category/4/Movies+Torrents.html',
        TV: 'url:/category/8/TV+Torrents.html',
        Music: 'url:/category/5/Music+Torrents.html',
        Apps: 'url:/category/7/Software+Torrents.html',
        Anime: 'url:/category/1/Anime+Torrents.html',
        Books: 'url:/category/2/Books+Torrents.html'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 50,
      itemsSelector: '.tl tr',
      itemSelectors: [
        {
          title: '.tli > a@text',
          seeds: '.sy@text | int',
          peers: '.ly@text | int',
          time: '.tli + td@text',
          size: '.tli + td + td@text',
          magnet: 'a[title="Magnet link"]@href',
          desc: '.tli a@href'
        }
      ],
      paginateSelector: 'a.pager_link:contains(>)@href',
      torrentDetailsSelector: 'table@html'
    };
  }
}

module.exports = ExtraTorrent;
