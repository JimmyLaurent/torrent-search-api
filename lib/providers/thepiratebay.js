const util = require('util');
const request = util.promisify(require('request'));
const TorrentProvider = require('../TorrentProvider');
const { humanizeSize } = require('../utils/helpers');
const { int } = require('../utils/filters');

class ThePirateBay extends TorrentProvider {
  constructor() {
    super({
      name: 'ThePirateBay',
      baseUrl: 'https://apibay.org',
      searchUrl: '/q.php?q={query}&cat={cat}',
      categories: {
        All: '',
        Audio: '100',
        Video: '200',
        Applications: '300',
        Games: '400',
        Porn: '500',
        Other: '600',
        Top100: 'url:/top/all'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 100
    });
  }

  formatMagnet(infoHash, name) {
    const trackers = [
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://9.rarbg.to:2920/announce',
      'udp://tracker.opentrackr.org:1337',
      'udp://tracker.internetwarriors.net:1337/announce',
      'udp://tracker.leechers-paradise.org:6969/announce',
      'udp://tracker.pirateparty.gr:6969/announce',
      'udp://tracker.cyberia.is:6969/announce'
    ];
    const trackersQueryString = `&tr=${trackers.map(encodeURIComponent).join('&tr=')}`;
    return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}${trackersQueryString}`;
  }

  async search(query, category) {
    const url = this.getUrl(category, query);
    if (url === null) {
      return [];
    }
    const response = await request({ url, json: true });
    return response.body.map(r => ({
      provider: this.name,
      id: r.id,
      title: r.name,
      time: new Date((int(r.added) * 1000)).toUTCString(),
      seeds: int(r.seeders),
      peers: int(r.leechers),
      size: humanizeSize(r.size),
      magnet: this.formatMagnet(r.info_hash, r.name),
      numFiles: int(r.num_files),
      status: r.status,
      category: r.category,
      imdb: r.imdb
    }));
  }

  async getTorrentDetails(torrent) {
    if(torrent && torrent.id) {
      const url = `${this.baseUrl}/t.php?id=${torrent.id}`;
      const response = await request({ url, json: true });
      return response.body;
    }
    throw new Error('Missing torrent id');
  }

  downloadTorrent() {
    throw new Error('Not implemented');
  }
}

module.exports = ThePirateBay;
