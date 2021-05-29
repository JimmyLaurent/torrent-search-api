const TorrentProvider = require('../TorrentProvider');

class TorrentLeech extends TorrentProvider {
	constructor() {
		super({
			name: 'TorrentLeech',
			requireAuthentification: true,
			supportCookiesAuthentification: true,
			supportCredentialsAuthentification: false,
			baseUrl: 'https://www.torrentleech.org',
			searchUrl:
				'/torrents/browse/list/query/{query}/categories/{cat}/orderby/seeders/order/desc',
			categories: {
				All:
					'',
				Movies: '8,9,11,37,43,14,12,13,47,15,29',
				TV: '26,32,27',
				Games: '17,42,18,19,40,20,21,39,22,28,30,48',
				Apps: '23,24,25,33',
				Education: '38',
				Animation: '34,35',
				Books: '45,46',
				Music: '31,16',
				Foreign: '36,44'
			},
			defaultCategory: 'All',
		});
	}

	search(query, category) {
		const url = this.getUrl(category, query);
		if (url === null) {
			return undefined;
		}

		return this.request(url, {}, null, false)
			.then(response => {
				const results = JSON.parse(response).torrentList;
				return (
					results &&
					results.map(r => ({
						provider: this.name,
						title: r.name,
						time: r.addedTimestamp,
						seeds: r.seeders,
						peers: r.leechers,
						size: this.humanFileSize(r.size),
						filename: r.filename,
						fid: r.fid,

						rating: r.rating,
						categoryID: r.categoryID,
						new: r.new,
						numComments: r.numComments,
						tags: r.tags,
						imdbID: r.imdbID,
						igdbID: r.igdbID,
						tvmazeID: r.tvmazeID
					}))
				);
			});
	}

	getTorrentDetails(torrent) {
		throw new Error('Not implemented');
	}

	downloadTorrent(torrent, path) {
		const url = this.baseUrl.concat('/download/', torrent.fid, '/', torrent.filename);
		super.downloadTorrent({ link: url }, path);
	}

	humanFileSize(bytes, si) {
		const thresh = si ? 1000 : 1024;
		if (bytes < thresh) return `${bytes} B`;
		const units = si
			? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
			: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
		let u = -1;
		do {
			bytes /= thresh;
			++u;
		} while (bytes >= thresh);
		return `${bytes.toFixed(1)} ${units[u]}`;
	}
}

module.exports = TorrentLeech;
