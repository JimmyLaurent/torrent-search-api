const TorrentProvider = require('../../lib/TorrentProvider');

class FakeProvider extends TorrentProvider {
  constructor() {
    super({
      name: 'FakeProvider',
      baseUrl: 'http://torrentproject.se',
      searchUrl: '/?num=100&start=0&orderby=seeders&s={query}&filter={cat}',
      categories: {
        All: '',
        Audio: '1000',
        Video: '2000',
        Applications: '7000',
        Books: '3000',
        Games: '6000',
        Xxx: '8000',
        Images: '4000',
        Mobile: '5000'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 100,
      itemsSelector: '.torrent',
      itemSelectors: {
        title: '.tl@text',
        time: '.cated@text | trim',
        seeds: '.seeders | replace:"seeders:", | int',
        peers: '.leechers | replace:"leechers:" | int',
        size: '.torrent-size | trim',
        magnet:
          '.tl@href | match:"http://torrentproject.se/(.+?)/" | format:magnet:?xt=urn:btih:{0}&tr=http://tracker.mgtracker.org:2710/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=udp://tracker.mg64.net:2710/announce&tr=udp://tracker.pirateparty.gr:6969/announce',
        desc: '.tl@href'
      },
      paginateSelector: '.fl:not([href*="start=0"])@href',
      torrentDetailsSelector: '#res2@text'
    });
  }

  /* eslint-disable-next-line */
  downloadTorrent() {
    throw new Error('Not implemented');
  }
}

module.exports = FakeProvider;
