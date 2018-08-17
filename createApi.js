const ProviderManager = require('./lib/ProviderManager');

function createApi(...providers) {
  const providerManager = new ProviderManager();
  if (providers.length > 0) {
    providerManager.loadProviders(...providers);
  }
  return providerManager;
}

module.exports = createApi;