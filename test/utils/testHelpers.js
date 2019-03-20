const nock = require('nock');
const { readFileSync } = require('fs');
const path = require('path');
const ProviderManager = require('../../lib/ProviderManager');
const TorrentProvider = require('../../lib/TorrentProvider');


const assert = require('assert');

function logMatch(/* message */) {
  //   console.log(
  //     `
  // ----------------------------------
  // ${message}
  // ----------------------------------
  //   `
  //   );
}

function mockNextRequest(responseFilePath, queryName) {
  const content = readFileSync(responseFilePath, 'utf8');

  nock(/[0-9a-zA-Z]{1,}/)
    .log(matchingUri => logMatch(`${queryName} : ${matchingUri}`))
    .get(/[0-9a-zA-Z]{0,}/)
    .reply(200, content, { 'content-type': 'text/html' });
}

function mockCookieLoginRequest(
  cookie = ['uid=XXX;', 'pass=XXX;'],
  queryName = 'Login request'
) {
  nock(/[0-9a-zA-Z]{1,}/)
    .log(matchingUri => logMatch(`${queryName} : ${matchingUri}`))
    .post(/[0-9a-zA-Z]{0,}/, body => {
      logMatch(`Login request body : ${JSON.stringify(body)}`);
      return true;
    })
    .reply(200, 'You are logged', {
      cookie
    });
}

function createProviderHtmlSnapshotTest(
  htmlSnapshotFilepath,
  providerFilepath
) {
  const api = new ProviderManager();
  const provider = api.loadProvider(providerFilepath);

  it(`should return results for ${provider.name}`, async () => {
    //     console.info(
    //       `
    // ----------------------------------
    //   ${provider.name}
    // ----------------------------------
    //       `
    //     );
    // ARRANGE
    provider.enableProvider('user', 'pass');
    if (provider.requireAuthentification) {
      mockCookieLoginRequest();
    }
    mockNextRequest(htmlSnapshotFilepath, 'Query page 0');
    mockNextRequest(htmlSnapshotFilepath, 'Query page 1');

    // ACT
    const torrents = await api.search(
      '1080',
      null,
      provider.resultsPerPageCount * 2
    );

    // ASSERT
    expect(torrents.length).toBeGreaterThan(0);

    //     console.info(
    //       `
    // ----------------------------------
    // First result
    // ----------------------------------
    // ${JSON.stringify(torrents[0], null, 2)}
    // ----------------------------------
    //     `
    //     );

    const { itemSelectors } = api.providers[0];
    Object.keys(itemSelectors).map(selectorkey =>
      assert(
        torrents[0][selectorkey] !== undefined,
        `${selectorkey} is missing in ${provider.name}`
      )
    );
  });
}

function createProviderHtmlSnapshotTestFromFilename(filename) {
  let providerFilename = filename;
  if (filename.includes('-')) {
    [providerFilename] = filename.split('-');
  }
  return createProviderHtmlSnapshotTest(
    path.resolve('./test/html-snapshots', filename),
    path.resolve('./lib/providers', `${providerFilename}`),
    providerFilename
  );
}

function getProviderDefinition(overrideDefinition) {
  return Object.assign(
    {
      name: 'Torrent9',
      requireAuthentification: false,
      baseUrl: 'http://www.torrent.com',
      searchUrl: '/engine/search?q={query}&order=desc&sort=seed&category={cat}',
      categories: {
        All: 'everything',
        Movies: 'films',
        Url: 'url:/query={query}'
      },
      defaultCategory: 'Movies'
    },
    overrideDefinition
  );
}

function createProviderInstance(overrideDefinition) {
  return new TorrentProvider(getProviderDefinition(overrideDefinition));
}

module.exports = {
  mockNextRequest,
  mockCookieLoginRequest,
  createProviderHtmlSnapshotTest,
  createProviderHtmlSnapshotTestFromFilename,
  getProviderDefinition,
  createProviderInstance
};
