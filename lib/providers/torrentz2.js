const TorrentProvider = require('../torrent-provider');

class Torrentz extends TorrentProvider {
  _getScrapeDatas() {
    return {
      name: 'Torrentz2',
      baseUrl: 'https://torrentz2.eu',
      searchUrl: '/?f={query}',
      categories: { All: '' },
      defaultCategory: 'All',
      resultsPerPageCount: 50,
      itemsSelector: 'div.results dl',
      itemSelectors: [
        {
          title: 'a',
          hash: 'a@href | substr:21,',
          time: 'span:nth-child(2)',
          size: 'span:nth-child(3)',
          seeds: 'span:nth-child(5) | int',
          peers: 'span:nth-child(4) | int',
          magnet: 'a@href | substr:21, | format:magnet:?xt=urn:btih:{0}',
          link:
            'a@href | substr:21, | format:http://itorrents.org/torrent/{0}.torrent'
        }
      ],
      paginateSelector: 'a:contains(»)@href',
      torrentDetailsSelector: 'td[class*="frame"]:nth-child(1)@html',
      enableCloudFareBypass: true
    };
  }
}

module.exports = Torrentz;
