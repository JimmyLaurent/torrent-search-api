/* eslint-disable class-methods-use-this, global-require, import/no-dynamic-require */
const path = require('path');
const _ = require('lodash');
const TorrentProvider = require('./TorrentProvider');
const { readdirSync } = require('fs');
const {
  isString,
  isArray,
  silentRejection,
  uniqueName,
  isObject,
  isClass,
  oneArgument
} = require('./utils/helpers');

class ProviderManager {
  constructor() {
    this.providers = [];
  }

  loadProvider(providerParam) {
    const providerDefinition = isString(providerParam)
      ? ProviderManager.importProviderFromFile(providerParam)
      : providerParam;

    const providerInstance =
      providerParam instanceof TorrentProvider
        ? providerParam
        : ProviderManager.instantiateProvider(providerDefinition);

    this.addProvider(providerInstance);
    return providerInstance;
  }

  addProvider(provider) {
    if (this.getProvider(provider.name, false)) {
      throw new Error(`Can't add ${provider.name}, it already exists`);
    }
    this.providers.push(provider);
  }

  loadProviders(...args) {
    const providers = ProviderManager.isLoadingProvidersFromDirPath(args)
      ? ProviderManager.getProviderFilenamesFromDirPath(args[0])
      : args;

    providers.map(p => this.loadProvider(p));
  }

  removeProvider(providerName) {
    this.providers = this.providers.filter(
      p => uniqueName(p.name) !== uniqueName(providerName)
    );
  }

  enableProvider(providerName, ...args) {
    return this.getProvider(providerName).enableProvider(...args);
  }

  enablePublicProviders() {
    this.getProviders()
      .filter(p => p.public)
      .map(p => p.name)
      .map(p => this.enableProvider(p));
  }

  disableProvider(providerName) {
    this.getProvider(providerName).disableProvider();
  }

  disableAllProviders() {
    this.getProviders().map(p => this.disableProvider(p.name));
  }

  getProviders() {
    return this.providers.map(p => p.getInformations());
  }

  getActiveProviders() {
    return this._getActiveProviders().map(p => p.getInformations());
  }

  isProviderActive(name) {
    const provider = this.getProvider(name, false);
    return provider && provider.isActive;
  }

  handleSearchArguments(param, ...rest) {
    if (isString(param)) {
      return [this._getActiveProviders(), param, ...rest];
    } else if (isArray(param)) {
      return [this._getActiveProviders(...param), ...rest];
    }
    return Promise.reject(
      new Error('First param must be a query or an array of providers.')
    );
  }

  search(...args) {
    const [
      selectedProviders,
      query,
      category,
      limit
    ] = this.handleSearchArguments(...args);

    const searchPromises = selectedProviders
      .map(p => p.search(query || '', category, limit))
      .map(p => (selectedProviders.length > 1 ? silentRejection(p) : p));

    return Promise.all(searchPromises)
      .then(results =>
        _(results)
          .flatten()
          .compact()
          .orderBy(
            [({ seeds }) => (isNaN(seeds) ? 0 : seeds), 'title'],
            ['desc', 'desc']
          )
          .value()
      )
      .then(results => (limit ? results.slice(0, limit) : results));
  }

  getTorrentDetails(torrent) {
    return this.getProvider(torrent.provider).getTorrentDetails(torrent);
  }

  downloadTorrent(torrent, filenamePath) {
    return this.getProvider(torrent.provider).downloadTorrent(
      torrent,
      filenamePath
    );
  }

  overrideConfig(providerName, newConfig) {
    this.getProvider(providerName).overrideConfig(newConfig);
  }

  getMagnet(torrent) {
    return this.getProvider(torrent.provider).getMagnet(torrent);
  }

  getProvider(name, throwOnError = true) {
    const provider = _.find(
      this.providers,
      p => uniqueName(p.name) === uniqueName(name)
    );
    if (!provider && throwOnError) {
      throw new Error(`Couldn't find '${name}' provider`);
    }
    return provider;
  }

  _getActiveProviders(...providerNames) {
    const activeProviders = _.filter(this.providers, 'isActive');
    if (providerNames.length > 0) {
      return activeProviders.filter(p =>
        providerNames.map(m => uniqueName(m)).includes(uniqueName(p.name))
      );
    }
    return activeProviders;
  }

  static instantiateProvider(Provider) {
    if (isObject(Provider)) {
      return new TorrentProvider(Provider);
    } else if (isClass(Provider)) {
      return new Provider();
    }
    throw new Error(`Couldn't load the provider from '${Provider}'`);
  }

  static importProviderFromFile(providerPath) {
    try {
      if (!path.isAbsolute(providerPath)) {
        throw new Error('Given path is not absolute');
      }
      return require(providerPath);
    } catch (e) {
      throw new Error(
        `Couldn't import the provider from '${providerPath}' \n ${e}`
      );
    }
  }

  static isLoadingProvidersFromDirPath(args) {
    return oneArgument(args) && isString(args[0]);
  }

  static getProviderFilenamesFromDirPath(dirPath) {
    if (!path.isAbsolute(dirPath)) {
      throw new Error('You must give an absolute path');
    }

    return readdirSync(path.resolve(dirPath))
      .filter(f => f.endsWith('.js') || f.endsWith('.json'))
      .map(filename => path.resolve(dirPath, filename));
  }
}

module.exports = ProviderManager;
