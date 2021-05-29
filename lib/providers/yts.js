const util = require('util');
const request = util.promisify(require('request'));
const TorrentProvider = require('../TorrentProvider');

class Yts extends TorrentProvider {
  constructor() {
    super({
      name: 'Yts',
      baseUrl: 'https://yts.mx',
      searchUrl:
        '/api/v2/list_movies.json?query_term={query}&sort=seeds&order=desc&set=1',
      categories: {
        All: '',
        Movies: ''
      },
      defaultCategory: 'All',
      resultsPerPageCount: 20
    });
  }

  search(query, category) {
    const url = this.getUrl(category, query);
    if (url === null) {
      return Promise.resolve([]);
    }
    return request({ url, headers: { 'User-Agent': 'curl/7.37.0' } }).then(
      response => {
        const results = JSON.parse(response.body).data.movies;
        return (
          results &&
          results.reduce((torrents, r) => {
            if (r.torrents) {
              r.torrents.forEach(t => {
                torrents.push({
                  provider: this.name,
                  title: `${r.title} ${t.quality}`,
                  time: t.date_uploaded,
                  seeds: t.seeds,
                  peers: t.peers,
                  size: t.size,
                  link: t.url,
                  desc: r.url
                });
              });
            }
            return torrents;
          }, [])
        );
      }
    );
  }

  getTorrentDetails(torrent) {
    throw new Error('Not implemented');
  }
}

module.exports = Yts;
