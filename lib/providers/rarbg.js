const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
const TorrentProvider = require('../torrent-provider');

class Rarbg extends TorrentProvider {
  _getScrapeDatas() {
    return {
      name: 'Rarbg',
      baseUrl: 'https://torrentapi.org',
      getTokenUrl:
        '/pubapi_v2.php?get_token=get_token&app_id=NodeTorrentSearchApi',
      searchUrl:
        '/pubapi_v2.php?app_id=NodeTorrentSearchApi&search_string={query}&category={cat}&mode=search&format=json_extended&sort=seeders&limit=100&token=',
      categories: {
        All:
          '1;4;14;15;16;17;21;22;42;18;19;41;27;28;29;30;31;32;40;23;24;25;26;33;34;43;44;45;46;47;48;49;50;51;52',
        Movies: '14;17;42;44;45;46;47;48;50;51;52',
        XXX: '1;4',
        Games: '1;27;28;29;30;31;32;40',
        TV: '1;18;41;49',
        Music: '1;23;24;25;26',
        Apps: '1;33;34;43',
        Books: '35'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 100
    };
  }

  search(query, category, limit) {
    return this._ensureLogin()
      .then(() => {
        let url = this._getUrl(category, query);
        if (url === null) {
          return;
        }
        return request({ url: url, headers: { 'User-Agent': 'curl/7.37.0' } });
      })
      .then(response => {
        let results = JSON.parse(response.body).torrent_results;
        return (
          results &&
          results.map(r => {
            return {
              provider: this.scrapeDatas.name,
              title: r.title,
              time: r.pubdate,
              seeds: r.seeders,
              peers: r.leechers,
              size: this._humanFileSize(r.size),
              magnet: r.download,
              desc: r.info_page
            };
          })
        );
      });
  }

  getTorrentDetails(torrent) {
    throw new Error('Not implemented');
  }

  _ensureLogin() {
    if (!this.lastLoginTime || Date.now() - this.lastLoginTime > 840000) {
      return request({
        url: this.scrapeDatas.baseUrl + this.scrapeDatas.getTokenUrl,
        headers: { 'User-Agent': 'curl/7.37.0' }
      }).then(r => {
        //wait 2 seconds to avoid doing more than 1 req per 2 secs
        const waitTill = new Date(new Date().getTime() + 2 * 1000);
        while (waitTill > new Date()) {}

        this.lastLoginTime = Date.now();
        let searchUrl = this.scrapeDatas.searchUrl;
        this.scrapeDatas.searchUrl =
          searchUrl.substr(0, searchUrl.lastIndexOf('=') + 1) +
          JSON.parse(r.body).token;
      });
    }
    return Promise.resolve();
  }

  _downloadTorrent(torrent) {
    throw new Error('Not implemented');
  }

  _humanFileSize(bytes, si) {
    let thresh = si ? 1000 : 1024;
    if (bytes < thresh) return bytes + ' B';
    let units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (bytes >= thresh);
    return bytes.toFixed(1) + ' ' + units[u];
  }
}

module.exports = Rarbg;
