const TorrentProvider = require('../torrent-provider');

class KickassTorrents extends TorrentProvider {
  _getScrapeDatas() {
    return {
      name: 'KickassTorrents',
      baseUrl: 'https://katcr.co',
      searchUrl:
        '/new/search-torrents.php?search={query}&sort=seeders&order=desc',
      categories: {
        All: '',
        Movies: 'url:/new/torrents.php?parent_cat=Movies',
        TV: 'url:/new/torrents.php?parent_cat=TV',
        Music: 'url:/new/torrents.php?parent_cat=Music',
        Games: 'url:/new/torrents.php?parent_cat=Games',
        Books: 'url:/new/torrents.php?parent_cat=Books',
        Applications: 'url:/new/torrents.php?parent_cat=Applications',
        Anime: 'url:/new/torrents.php?parent_cat=Anime'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 15,
      itemsSelector: '.ttable_headinner tr',
      itemSelectors: [
        {
          title: '.cellMainLink@text',
          time: 'td:nth-child(3)@text',
          seeds: 'td:nth-child(4)@text | replace:"--",0 | int',
          peers: 'td:nth-child(5)@text | replace:"--",0 | int',
          size: 'td:nth-child(2)@text',
          link: 'a[title="Download torrent file"]@href',
          desc: '.cellMainLink@href'
        }
      ],
      paginateSelector: '.pages a:not([href*="page=0"])@href',
      torrentDetailsSelector: '#tab-main-description@html'
    };
  }
}

module.exports = KickassTorrents;
