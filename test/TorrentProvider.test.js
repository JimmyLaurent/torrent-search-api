const { createProviderInstance } = require('./utils/testHelpers');

describe('Torrent provider', () => {
  it('[getUrl] should return url with category and query term', () => {
    const provider = createProviderInstance();
    const url = provider.getUrl('Movies', '1080');

    expect(url).toBe(
      'http://www.torrent.com/engine/search?q=1080&order=desc&sort=seed&category=films'
    );
  });

  it('[getUrl] should url encode query', () => {
    const provider = createProviderInstance();
    const url = provider.getUrl('Movies', '1080 movie');

    expect(url).toBe(
      'http://www.torrent.com/engine/search?q=1080%20movie&order=desc&sort=seed&category=films'
    );
  });

  it('[getUrl] should return a url with the default category and empty query term', () => {
    const provider = createProviderInstance();
    const url = provider.getUrl();

    expect(url).toBe(
      'http://www.torrent.com/engine/search?q=&order=desc&sort=seed&category=films'
    );
  });

  it('[getUrl] should return custom url when "url:/" tag is given', () => {
    const provider = createProviderInstance();
    const url = provider.getUrl('Url', '1080');

    expect(url).toBe('http://www.torrent.com/query=1080');
  });

  it('[getCategoryValue] should return default value when no category was given', () => {
    const provider = createProviderInstance();
    const categoryValue = provider.getCategoryValue();

    expect(categoryValue).toEqual('films');
  });

  it('[getCategoryValue] should return catogory value', () => {
    const provider = createProviderInstance();
    const categoryValue = provider.getCategoryValue('Movies');

    expect(categoryValue).toEqual('films');
  });

  it('[getCategoryValue] should return null when there is no match', () => {
    const provider = createProviderInstance();
    const categoryValue = provider.getCategoryValue('unknown');

    expect(categoryValue).toEqual(null);
  });

  it('[getInformations] should return informations about the provider', () => {
    const provider = createProviderInstance();
    const informations = provider.getInformations();
    const expectedInformations = {
      name: 'Torrent9',
      public: true,
      categories: ['All', 'Movies', 'Url']
    };

    expect(informations).toEqual(expectedInformations);
  });

  it('[enableProvider] should activate the public provider', () => {
    const provider = createProviderInstance();
    provider.enableProvider();

    expect(provider.isActive).toEqual(true);
  });

  it('[enableProvider] should activate the provider with credentials', () => {
    const provider = createProviderInstance({
      requireAuthentification: true,
      supportCredentialsAuthentification: true
    });
    provider.enableProvider('user', 'password');

    expect(provider.isActive).toEqual(true);
    expect(provider.username).toEqual('user');
    expect(provider.password).toEqual('password');
  });

  it('[enableProvider] should activate the provider with a given cookie and be loggedIn', () => {
    const provider = createProviderInstance({
      requireAuthentification: true,
      supportCookiesAuthentification: true
    });

    provider.enableProvider(['uid=XXX;', 'pass=XXX;']);

    expect(provider.isActive).toEqual(true);
    expect(provider.isLogged()).toBe(true);
  });

  it('[enableProvider] should activate the provider with a given token', () => {
    const provider = createProviderInstance({
      requireAuthentification: true,
      supportTokenAuthentification: true
    });

    provider.enableProvider('secretToken');

    expect(provider.isActive).toEqual(true);
    expect(provider.token).toBe('secretToken');
  });

  it('[enableProvider] should throw when weird arguments are given', () => {
    const provider = createProviderInstance({
      requireAuthentification: true,
      supportTokenAuthentification: true
    });

    expect(() => provider.enableProvider(12)).toThrow();

    expect(provider.isActive).toEqual(false);
  });

  it('[disableProvider] should disable the provider', () => {
    const provider = createProviderInstance();
    provider.enableProvider();
    provider.disableProvider();

    expect(provider.isActive).toEqual(false);
  });

  it('[ensureLogin] should reject when when not logged and not enabled', async () => {
    const provider = createProviderInstance({
      requireAuthentification: true,
      supportCredentialsAuthentification: true
    });

    provider.login = jest.fn();
    provider.isLogged = jest.fn();
    provider.isLogged.mockReturnValueOnce(false);

    await expect(provider.ensureLogin()).rejects.toThrow(
      "Can't login: missing credentials for Torrent9"
    );
  });

  it('[ensureLogin] should call login when not logged', async () => {
    const provider = createProviderInstance({
      requireAuthentification: true,
      supportCredentialsAuthentification: true
    });
    provider.enableProvider('user', 'password');
    provider.login = jest.fn();
    provider.isLogged = jest.fn();
    provider.isLogged.mockReturnValueOnce(false);

    await provider.ensureLogin();

    expect(provider.login).toHaveBeenCalledTimes(1);
  });

  it('[ensureLogin] should not call login when loggedIn', async () => {
    const provider = createProviderInstance({
      requireAuthentification: true,
      supportCredentialsAuthentification: true
    });
    provider.enableProvider('user', 'password');
    provider.login = jest.fn();
    provider.isLogged = jest.fn();
    provider.isLogged.mockReturnValueOnce(true);

    await provider.ensureLogin();

    expect(provider.login).not.toHaveBeenCalled();
  });
});
