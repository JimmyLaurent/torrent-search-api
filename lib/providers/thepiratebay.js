const TorrentProvider = require('../torrent-provider');

class ThePirateBay extends TorrentProvider {
  _getScrapeDatas() {
    return {
      name: 'ThePirateBay',
      baseUrl: 'https://thepiratebay.red',
      searchUrl: '/search/{query}/0/7/{cat}',
      categories: {
        'All': '',
        'Audio': '100',
        'Video': '200',
        'Applications': '300',
        'Games': '400',
        'Porn': '500',
        'Other': '600',
        'Top100': 'url:/top/all'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 30,
      itemsSelector: '#searchResult tr',
      itemSelectors: [{
        title: 'a.detLink@text',
        time: 'font.detDesc@text | match:"Uploaded\\s(.+?),"',
        seeds: 'td:nth-child(3) | int',
        peers: 'td:nth-child(4) | int',
        size: 'font.detDesc@text | match:"Size\\s(.+?),"',
        magnet: 'a[title="Download this torrent using magnet"]@href',
        desc: 'div.detName a@href'
      }],
      paginateSelector: 'a:has(img[alt="Next"])@href',
      torrentDetailsSelector: 'div.nfo > pre@text',
      enableCloudFareBypass: false
    };
  }

  _downloadTorrent(torrent) {
    throw new Error("Not implemented");
  }
}

module.exports = ThePirateBay;
