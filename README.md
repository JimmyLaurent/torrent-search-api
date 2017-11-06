# TorrentSearchApi

Yet another node torrent search api based on x-ray.

## Install

```bash
npm install torrent-search-api
```

## Supported providers

- TorrentLeech: cookie authentification
- IpTorrents: credentials and cookie authentification
- Torrent9
- Torrentz2
- 1337x
- ThePirateBay
- YggTorrent : credentials and cookie authentification
- KickassTorrents
- Rarbg
- TorrentProject
- ExtraTorrent

## Features

- **Search:** search torrents on multiples providers.

- **Torrent details:** get details about torrents (raw scraped html).

- **Download:** download torrents files.

- **Easily extensible:** you can easily add new providers and enjoy built-in features like cloudfare bypass.
 

## Quick Example

```js
const TorrentSearchApi = require('torrent-search-api');

const torrentSearch = new TorrentSearchApi();

torrentSearch.enableProvider('Torrent9');

// Search '1080' in 'Movies' category and limit to 20 results
torrentSearch.search('1080', 'Movies', 20)
     .then(torrents => {
         console.log(torrents);
     })
     .catch(err => {
         console.log(err);
     });
```

# Torrent Search API

### Get providers

```js
// Get providers
console.log(torrentSearch.getProviders());

// Get active providers
console.log(torrentSearch.getActiveProviders());

// Results
{
    {
        name: 'Torrent9',
        public: true,
        categories: ['All', 'Movies', 'TV', 'Music', 'Apps', 'Books', 'Top100']
    },
    {
        name: 'IpTorrents',
        public: false,
        categories: ['All', 'Movies', 'TV', 'Games', 'Music']
    },
    ...
}

```

### Enable provider

```js

// Enable public providers
torrentSearch.enablePublicProviders();

// Enable public provider
torrentSearch.enableProvider('Torrent9');

// Enable private provider with cookies
torrentSearch.enableProvider('IpTorrents', ['uid=XXX;', 'pass=XXX;']);

// Enable private provider with credentials
torrentSearch.enableProvider('IpTorrents', 'USERNAME', 'PASSWORD');

// Enable private provider with token
torrentSearch.enableProvider('xxx', 'TOKEN');

```

### Disable provider

```js

// Disable provider
torrentSearch.disableProvider('TorrentLeech');

```

### Check if a provider exists and is active

```js

torrentSearch.isProviderActive('1337x');

```

### Search torrent

The result is an array of torrents sorted by seeders with more or less properties depending on the provider.

```js

// Search on actives providers
// Query: 1080
// Category: Movies (optional)
// Limit: 20 (optional)
torrentSearch.search('1080', 'Movies', 20)
    .then(torrents => {
        console.log(torrents);
    })
    .catch(err => {
        console.log(err);
    });

// Search with given providers
// query: 1080
// category: Movies (optional)
// limit: 20 (optional)
torrentSearch.search(['IpTorrents', 'Torrent9'], '1080', 'Movies', 20)
    .then(torrents => {
        console.log(torrents);
    })
    .catch(err => {
        console.log(err);
    });

```

### Torrent details

```js

// Get details (raw scraped html)
// torrent: taken from a search result
torrentSearch.getTorrentDetails(torrent)
    .then(html => {
        console.log(html);
    })
    .catch(err => {
        console.log(err);
    });

```

### Torrent magnet

```js

// Get magnet url
// torrent: taken from a search result
torrentSearch.getMagnet(torrent)
    .then(magnet => {
        console.log(magnet);
    })
    .catch(err => {
        console.log(err);
    });

```

### Download torrent

```js

// Download a buffer
// torrent: taken from a search result
torrentSearch.downloadTorrent(torrent)
    .then(buffer => {
        // do something with the buffer
    })
    .catch(err => {
        console.log(err);
    });

// Download torrent and write it to the disk
// torrent: taken from a search result
torrentSearch.downloadTorrent(torrent, filnamePath)
    .then(() => {
        // OK
    })
    .catch(err => {
        console.log(err);
    });
```

## License

MIT © 2017 [Jimmy Laurent](https://github.com/JimmyLaurent)