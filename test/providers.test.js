const { readdirSync } = require('fs');
const { createProviderHtmlSnapshotTestFromFilename } = require('./utils/testHelpers');

describe('Test providers with html snapshots', () => {
  readdirSync('./test/html-snapshots')
    .filter(f => f.endsWith('.html'))
    .map(createProviderHtmlSnapshotTestFromFilename);
});
