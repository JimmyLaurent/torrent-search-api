# TorrentSearchApi

[![npm](https://img.shields.io/npm/dm/torrent-search-api.svg?maxAge=2592000)](https://npm-stat.com/charts.html?package=torrent-search-api)

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
- Yts
- Limetorrents
- Eztv

## Features

- **Search:** search torrents on multiples providers.

- **Torrent details:** get details about torrents (raw scraped html).

- **Download:** download torrents files.

- **Easily extensible:** you can easily add new providers and enjoy built-in features like cloudfare bypass.
 

## Quick Example

```js
const TorrentSearchApi = require('torrent-search-api');

TorrentSearchApi.enableProvider('Torrent9');

// Search '1080' in 'Movies' category and limit to 20 results
const torrents = await TorrentSearchApi.search('1080', 'Movies', 20);
```

# Torrent Search API

### Get providers

```js
// Get providers
const providers = TorrentSearchApi.getProviders();

// Get active providers
const activeProviders = TorrentSearchApi.getActiveProviders();

// providers
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
TorrentSearchApi.enablePublicProviders();

// Enable public provider
TorrentSearchApi.enableProvider('Torrent9');

// Enable private provider with cookies
TorrentSearchApi.enableProvider('IpTorrents', ['uid=XXX;', 'pass=XXX;']);

// Enable private provider with credentials
TorrentSearchApi.enableProvider('IpTorrents', 'USERNAME', 'PASSWORD');

// Enable private provider with token
TorrentSearchApi.enableProvider('xxx', 'TOKEN');

```

### Disable provider

```js

// Disable provider
TorrentSearchApi.disableProvider('TorrentLeech');

// Disable all enabled providers
TorrentSearchApi.disableAllProviders();

```

### Check if a provider exists and is active

```js

TorrentSearchApi.isProviderActive('1337x');

```

### Search torrent

The result is an array of torrents sorted by seeders with more or less properties depending on the provider.

```js

// Search on actives providers
// Query: 1080
// Category: Movies (optional)
// Limit: 20 (optional)
const torrents = await TorrentSearchApi.search('1080', 'Movies', 20);

// Search with given providers
// query: 1080
// category: Movies (optional)
// limit: 20 (optional)
const torrents = await TorrentSearchApi.search(['IpTorrents', 'Torrent9'], '1080', 'Movies', 20);

```

### Torrent details

```js

// Get details (raw scraped html)
// torrent: taken from a search result
const torrentHtmlDetail = await TorrentSearchApi.getTorrentDetails(torrent);

```

### Torrent magnet

```js

// Get magnet url
// torrent: taken from a search result
const magnet = await TorrentSearchApi.getMagnet(torrent);

```

### Download torrent

```js

// Download a buffer
// torrent: taken from a search result
const buffer = await TorrentSearchApi.downloadTorrent(torrent);

// Download torrent and write it to the disk
// torrent: taken from a search result
await TorrentSearchApi.downloadTorrent(torrent, filnamePath);
```

### Load custom providers

You can code and add your custom providers (see provider definition format in existing providers)
Don't forget to enable your provider if you intend to use it.

```js

// load multipe providers
// from a TorrentProvider custom class definition or instance
const MyCustomProvider = require('./MyCustomProvider');
TorrentSearchApi.loadProvider(MyCustomProvider);

// from a provider object definition
TorrentSearchApi.loadProvider( {/* provider object definition */});

// from an absolute path to class definition or json object definition
const path = require('path');
const providerFullPath = path.join(__dirname, './lib/providers/MyCustomProvider');
TorrentSearchApi.loadProviders(providerFullPath);

// load multipe providers within a directory
// only absolute path are allowed
// it loads every *.json and *.js file
const path = require('path');
const providerDirFullPath = path.join(__dirname, './lib/providers/');
TorrentSearchApi.loadProviders(providerDirFullPath);

// load multipe providers
const MyCustomProvider = require('./MyCustomProvider');
TorrentSearchApi.loadProviders(MyCustomProvider, {/* provider object definition */}, ...);

```

### Remove provider

```js

// Remove provider
TorrentSearchApi.removeProvider('MyCustomProvider');

```

### Create TorrentSearchApi instance

If you want to create an instance of the api without loading all the default providers and only load the ones that you want

```js

// create instance
const createApi = require('torrent-search-api/createApi');
const TorrentSearchApi = createApi(/* same arguments as "loadProviders" method */)

```

### Create a new provider

Check "test/createProvider.test.js" file if you want to create a new provider.

Running tests command

```bash
npm run test:watch
```

### Override provider config
 ```js
 // Fully or partial override of the provider config
TorrentSearchApi.overrideConfig(providerName, newConfig);
 ```

## License

MIT © 2020 [Jimmy Laurent](https://github.com/JimmyLaurent)
