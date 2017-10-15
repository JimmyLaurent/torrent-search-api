const fs = require('fs');
const _ = require('lodash');
const providers = require('./lib/providers');


class TorrentSearchApi {

    enableProvider(providerName, ...args) {
        return this._getProvider(providerName).enableProvider(...args);
    }

    disableProvider(providerName) {
        this._getProvider(providerName).disableProvider();
    }

    getProviders() {
        return providers.map(p => p.getInfos());
    }

    getActiveProviders() {
        return this._getActiveProviders().map(p => p.getInfos());
    }

    isProviderActive(name) {
        let provider = this._getProvider(name, false);
        if (provider && provider.isActive) {
            return true;
        }
        return false;
    }

    search(param, ...args) {
        if (typeof param === 'string') {
            return this._search(this._getActiveProviders(), param, ...args);
        }
        else if (param instanceof Array) {
            return this._search(this._getActiveProvidersByName(arguments[0]), ...args);
        }
        return Promise.reject('First param must be a query or an array of providers.');
    }

    last(param, ...args) {
        if (typeof param === 'string') {
            return this._last(this._getActiveProviders(), param, ...args);
        }
        else if (param instanceof Array) {
            return this._last(this._getActiveProvidersByName(arguments[0]), ...args);
        }
        return Promise.reject('First param must be a query or an array of providers.');
    }

    top(param, ...args) {
        if (typeof param === 'string') {
            return this._top(this._getActiveProviders(), param, ...args);
        }
        else if (param instanceof Array) {
            return this._top(this._getActiveProvidersByName(arguments[0]), ...args);
        }
        return Promise.reject('First param must be a query or an array of providers.');
    }

    getTorrentDetails(torrent) {
        return this._getProvider(torrent.provider).getTorrentDetails(torrent);
    }

    downloadTorrent(torrent, filenamePath) {
        return this._getProvider(torrent.provider).downloadTorrent(torrent, filenamePath);
    }

    _search(selectedProviders, query, category, limit) {
        query = query === '' ? undefined : query;
        category = category === '' ? undefined : category;
        limit = limit === '' ? undefined : limit;

        return Promise.all(selectedProviders.map(p => p.search(query, category, limit)))
            .then(results => _.flatten(results))
            .then(results => results.filter(r => typeof r != 'undefined'))
            .then(results => _.orderBy(results, ['seeds'], ['desc']))
            .then(results => limit ? results.slice(0, limit) : results);
    }

    _last(selectedProviders, category, limit) {
        category = category === '' ? undefined : category;
        limit = limit === '' ? undefined : limit;

        return Promise.all(selectedProviders.map(p => p.search('', 'Last' + category, limit)))
            .then(results => _.flatten(results))
            .then(results => results.filter(r => typeof r != 'undefined'))
            .then(results => limit ? results.slice(0, limit) : results)
    }

    _top(selectedProviders, category, limit) {
        category = category === '' ? undefined : category;
        limit = limit === '' ? undefined : limit;

        return Promise.all(selectedProviders.map(p => p.search('', 'Top' + category, limit)))
            .then(results => _.flatten(results))
            .then(results => results.filter(r => typeof r != 'undefined'))
            .then(results => _.orderBy(results, ['seeds'], ['desc']))
            .then(results => limit ? results.slice(0, limit) : results);
    }

    _getActiveProviders() {
        return _.filter(providers, 'isActive');
    }

    _getProvider(name, throwOnError = true) {
        let provider = _.find(providers, p => p.getName().toUpperCase() === name.toUpperCase());
        if (provider) {
            return provider;
        }

        if (throwOnError) {
            throw new Error(`Couldn't find '${name}' provider`);
        }

        return null;
    }

    _getActiveProvidersByName(providerNames) {
        return this._getActiveProviders().filter(p => providerNames.map(m => m.toUpperCase()).includes(p.getName().toUpperCase()));
    }
}

module.exports = TorrentSearchApi;
