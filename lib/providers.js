module.exports = [
  new (require('./providers/freshontv'))(),
  new (require('./providers/t411'))(),
  new (require('./providers/torrent9'))(),
  new (require('./providers/torrentz2'))(),
  new (require('./providers/iptorrents'))(),
  new (require('./providers/torrentleech'))()
];
