const T411Client = require('t411');
const TorrentProvider = require('../torrent-provider');
const format = require('string-format');

class T411 extends TorrentProvider {

  constructor() {
    super();
    this.t411 = new T411Client();
  }

  setToken(token) {
    this.t411.token = token;
  }

  _getScrapeDatas() {
    return {
      name: 'T411',
      baseUrl: 'http://www.t411.li',
      requireAuthentification: true,
      supportTokenAuthentification: true,
      supportCredentialsAuthentification: true,
      searchUrl: '/torrents/search/?search={query}&cat={cat}&page=0&order=seeders&type=desc',
      categories: {
        'All': '',
        'Top100': 'url:/top/100',
        'Movies' : '631',
        'TV': '433',
        'Music': '395',
        'Applications': '233',
        'Books': '404',
        'Emulation': '340',
        'Games': '624',
        'GPS': '392',
        'Film/Vidéo': '210',
        'xXx': '456'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 50,
      itemsSelector: 'tbody>tr',
      itemSelectors: [{
        id: 'td:nth-child(3) > a@href | replace:http://www.t411.li/torrents/nfo/?id=,',
        title: 'td:nth-child(2) > a:nth-child(1)@title',
        time: 'td:nth-child(5)',
        seeds: 'td:nth-child(8) | int',
        peers: 'td:nth-child(9) | int',
        size: 'td:nth-child(6)',
        link: 'td:nth-child(3) > a@href | replace:nfo,download',
        desc: 'td:nth-child(2) > a:nth-child(1)@href'
      }],
      paginateSelector: '.pagebar > a[rel="next"]@href',
      enableCloudFareBypass: false
    };
  }

  getTorrentDetails(torrent) {
    return this._ensureLogin().then(() => {
      return new Promise((resolve, reject) => {
        this.t411.details(torrent.id, (e, r) => {
          if (e) reject(e);
          resolve(r.description);
        });
      });
    });
  }

  _isLogged() {
    return this.t411.token !== null;
  }

  _login() {
    return new Promise((resolve, reject) => {
      this.t411.auth(this.username, this.password, err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  _downloadTorrent(torrent) {
    return this._ensureLogin().then(() => {
      return new Promise((resolve, reject) => {
        this.t411.download(torrent.id, (err, buf) => {
          if (err) {
            return reject(err);
          }
          return resolve(buf);
        });
      });
    });
  }
}

module.exports = T411;
