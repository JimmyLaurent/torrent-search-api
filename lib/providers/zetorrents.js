const Promise = require('bluebird');
const TorrentProvider = require('../torrent-provider');

class ZeTorrents extends TorrentProvider {

    _getScrapeDatas() {
        return {
            name: 'ZeTorrents',
            baseUrl: 'http://www.zetorrents.com',
            searchUrl: '/torrents/find/{cat}/title:{query}',
            categories: {
                'All': 'url:/torrents/find/title:{query}',
                'Films': '1/films',
                'Films en VOSTFR': '493/films-en-vostfr',
                'Séries de A à F': '733/series-de-a-a-f',
                'Séries de G à L': '734/series-de-g-a-l',
                'Séries de M à S': '735/series-de-m-a-s',
                'Séries de T à Z': '737/series-de-t-a-z',
                'Mangas et Animes': '732/mangas-et-animes',
                'Documentaires': '231/documentaires',
                'Spectacles': '215/spectacles',
                'Musique': '3/musique',
                'Jeux PC': '5/jeux-pc',
                'Jeux Consoles': '6/jeux-consoles',
                'Logiciels': '4/logiciels',
                'Ebooks': '348/ebooks'
            },
            defaultCategory: 'All',
            resultsPerPageCount: 50,
            itemsSelector: 'tbody > tr',
            itemSelectors: [{
                title: 'td:nth-child(2) a',
                seeds: 'td:nth-child(4) | int',
                peers: 'td:nth-child(5) | int',
                size: 'td:nth-child(3)',
                desc: 'td:nth-child(1) a@href'
            }],
            paginateSelector: 'a:contains(Suivant ►)@href',
            torrentDetailsSelector: '.content-table@html'
        };
    }

    _downloadTorrent(torrent) {
        return Promise.fromCallback(this._x(torrent.desc, '#download-link a@href')).then(url => {
            return super._downloadTorrent({ link: url });
        });
    }
}

module.exports = ZeTorrents;
