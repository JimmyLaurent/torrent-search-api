const ProviderManager = require('../lib/ProviderManager');
const {
  getProviderDefinition,
  createProviderInstance
} = require('./utils/testHelpers');
const FakeProvider = require('./fake-providers/FakeProvider');
const path = require('path');

describe('TorrentManager', () => {
  it('[loadProvider] should load provider from object definition', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProvider(getProviderDefinition());

    expect(providerManager.providers.length).toBe(1);
    expect(providerManager.providers[0].name).toBe('Torrent9');
  });

  it('[loadProvider] should load provider from class definition', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProvider(FakeProvider);

    expect(providerManager.providers.length).toBe(1);
    expect(providerManager.providers[0].name).toBe('FakeProvider');
  });

  it('[loadProvider] should load provider from class instance', () => {
    const providerManager = new ProviderManager();
    const providerInstance = new FakeProvider();
    providerManager.loadProvider(providerInstance);

    expect(providerManager.providers.length).toBe(1);
    expect(providerManager.providers[0]).toBe(providerInstance);
  });

  it('[loadProvider] should load provider from class definition', () => {
    const providerManager = new ProviderManager();
    providerManager.loadProvider(FakeProvider);

    expect(providerManager.providers.length).toBe(1);
    expect(providerManager.providers[0].name).toBe('FakeProvider');
  });

  it('[loadProvider] should load provider from class file', () => {
    const providerManager = new ProviderManager();
    providerManager.loadProvider(
      path.join(__dirname, './fake-providers/FakeProvider')
    );

    expect(providerManager.providers.length).toBe(1);
    expect(providerManager.providers[0].name).toBe('FakeProvider');
  });

  it('[loadProvider] should load provider from json file', () => {
    const providerManager = new ProviderManager();
    providerManager.loadProvider(
      path.join(__dirname, './fake-providers/AnotherFakeProvider')
    );

    expect(providerManager.providers.length).toBe(1);
    expect(providerManager.providers[0].name).toBe('AnotherFakeProvider');
  });

  it('[loadProvider] should throw when trying to load provider from a relative filePath', () => {
    const providerManager = new ProviderManager();

    expect(() =>
      providerManager.loadProvider('./fake-providers/FakeProvider')
    ).toThrow();
  });

  it('[loadProviders] should load all providers in the given directory', () => {
    const providerManager = new ProviderManager();
    const directoryAbsolutePath = path.join(__dirname, './fake-providers');
    providerManager.loadProviders(directoryAbsolutePath);

    expect(providerManager.providers.length).toBe(2);
  });

  it('[loadProviders] throw when trying to load providers from a relative directory path', () => {
    const providerManager = new ProviderManager();

    expect(() => providerManager.loadProviders('./fake-providers')).toThrow();
  });

  it('[loadProviders] should load all given providers', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(
      FakeProvider,
      path.join(__dirname, './fake-providers/AnotherFakeProvider'),
      getProviderDefinition({ name: 'ThirdFakeProvider' })
    );

    expect(providerManager.providers.length).toBe(3);
    expect(providerManager.providers[0].name).toBe('FakeProvider');
    expect(providerManager.providers[1].name).toBe('AnotherFakeProvider');
    expect(providerManager.providers[2].name).toBe('ThirdFakeProvider');
  });

  it('[remove] should remove provider', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(FakeProvider);
    providerManager.removeProvider('FakeProvider');

    expect(providerManager.providers.length).toBe(0);
  });

  it('[enableProvider] should enable provider', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(FakeProvider);
    providerManager.enableProvider('fakeprovider');

    expect(providerManager.providers[0].isActive).toBe(true);
  });

  it('[enableProvider] should enable provider with args', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(
      getProviderDefinition({
        name: 'private'
      })
    );
    providerManager.providers[0].enableProvider = jest.fn();

    providerManager.enableProvider('private', 'username', 'password');

    expect(providerManager.providers[0].enableProvider).toHaveBeenCalledWith(
      'username',
      'password'
    );
  });

  it('[isProviderActive] should return provider current state', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(FakeProvider);
    providerManager.enableProvider('fakeprovider');

    expect(providerManager.isProviderActive('fakeprovider')).toBe(true);
  });

  it('[enablePublicProviders] should activate only public providers', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(
      getProviderDefinition({ name: 'public', requireAuthentification: false }),
      getProviderDefinition({ name: 'private', requireAuthentification: true })
    );
    providerManager.enablePublicProviders();

    expect(providerManager.getProvider('public').isActive).toBe(true);
    expect(providerManager.getProvider('private').isActive).toBe(false);
  });

  it('[disableProvider] should disable provider', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(FakeProvider);
    providerManager.enableProvider('fakeprovider');
    providerManager.disableProvider('fakeprovider');

    expect(providerManager.providers[0].isActive).toBe(false);
  });

  it('[_getActiveProviders] should return active providers from given names', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(
      getProviderDefinition({ name: '1', requireAuthentification: false }),
      getProviderDefinition({ name: '2', requireAuthentification: false })
    );
    providerManager.enablePublicProviders();

    const activeProviders = providerManager._getActiveProviders('1', '3');

    expect(activeProviders.length).toBe(1);
  });

  it('[_getActiveProviders] should return active providers', () => {
    const providerManager = new ProviderManager();

    providerManager.loadProviders(
      getProviderDefinition({ name: '1', requireAuthentification: false }),
      getProviderDefinition({ name: '2', requireAuthentification: false })
    );
    providerManager.enablePublicProviders();

    const activeProviders = providerManager._getActiveProviders();

    expect(activeProviders.length).toBe(2);
  });

  it('[search] should search all actives providers, aggregate results and silent rejections', async () => {
    const providerManager = new ProviderManager();
    const alphaProvider = createProviderInstance({ name: 'alpha' });
    const betaProvider = createProviderInstance({ name: 'beta' });
    const gammaProvider = createProviderInstance({ name: 'gamma' });
    const zetaProvider = createProviderInstance({ name: 'zeta' });

    alphaProvider.search = jest.fn().mockResolvedValueOnce({ torrent: 'x' });
    betaProvider.search = jest.fn().mockResolvedValueOnce({ torrent: 'y' });
    gammaProvider.search = jest.fn().mockResolvedValueOnce(null);
    zetaProvider.search = jest
      .fn()
      .mockRejectedValueOnce(new Error('search error'));

    providerManager.loadProviders(
      alphaProvider,
      betaProvider,
      gammaProvider,
      zetaProvider
    );
    providerManager.enablePublicProviders();

    const results = await providerManager.search('1080');

    expect(alphaProvider.search).toHaveBeenCalled();
    expect(betaProvider.search).toHaveBeenCalled();
    expect(gammaProvider.search).toHaveBeenCalled();
    expect(zetaProvider.search).toHaveBeenCalled();
    expect(results).toEqual([{ torrent: 'x' }, { torrent: 'y' }]);
  });

  it('[search] should search with only selected providers', async () => {
    const providerManager = new ProviderManager();
    const alphaProvider = createProviderInstance({ name: 'alpha' });
    const betaProvider = createProviderInstance({ name: 'beta' });
    const gammaProvider = createProviderInstance({ name: 'gamma' });

    alphaProvider.search = jest.fn().mockResolvedValueOnce({ torrent: 'x' });
    betaProvider.search = jest.fn().mockResolvedValueOnce({ torrent: 'y' });
    gammaProvider.search = jest.fn().mockResolvedValueOnce({ torrent: 'z' });

    providerManager.loadProviders(
      alphaProvider,
      betaProvider,
      gammaProvider
    );
    providerManager.enablePublicProviders();

    const results = await providerManager.search(['alpha', 'beta'], '1080');

    expect(alphaProvider.search).toHaveBeenCalled();
    expect(betaProvider.search).toHaveBeenCalled();
    expect(gammaProvider.search).not.toHaveBeenCalled();
    expect(results).toEqual([{ torrent: 'x' }, { torrent: 'y' }]);
  });
});
