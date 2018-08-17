const path = require('path');
const { createProviderHtmlSnapshotTest } = require('./utils/testHelpers');

/*
  Test helping to create a new provider
*/
describe.skip('Test to create a provider with a html snapshot', () => {
  createProviderHtmlSnapshotTest(
    path.resolve('./test/html-snapshots/yggtorrent-1080.html'),
    {
      name: 'Yggtorrent',
      baseUrl: 'https://yggtorrent.com',
      requireAuthentification: true,
      supportCookiesAuthentification: true,
      supportCredentialsAuthentification: true,
      enableCloudFareBypass: true,
      loginUrl: '/user/login',
      loginQueryString: 'id={username}&pass={password}',
      searchUrl: '/engine/search?q={query}&order=desc&sort=seed&category={cat}',
      categories: {
        All: '',
        Videos: '2145',
        Movies: '2145&subcategory=2183',
        TV: '2145&subcategory=2184',
        Emulation: '2141',
        Games: '2142',
        Applications: '2144',
        Music: '2139',
        Books: '2140',
        GPS: '2143',
        XXX: '2188'
      },
      defaultCategory: 'All',
      resultsPerPageCount: 25,
      itemsSelector: '.table-striped tr',
      itemSelectors: {
        title: '.torrent-name@text',
        time: 'td:nth-child(3)@text | replace:"\n" | replace:"il y a ", | trim',
        seeds: 'td:nth-child(5)@text | replace:"--",0 | int',
        peers: 'td:nth-child(6)@text | replace:"--",0 | int',
        size: 'td:nth-child(4)@text',
        link: 'td:nth-child(1) > a[href*="download_torrent"]@href',
        desc: '.torrent-name@href'
      },
      paginateSelector: 'a[rel="next"]@href',
      torrentDetailsSelector: '#description@html'
    }
  );
});
