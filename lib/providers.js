module.exports = [
  new (require('./providers/thepiratebay'))(),
  new (require('./providers/yggtorrent'))(),
  new (require('./providers/kickasstorrents'))(),
  new (require('./providers/torrentproject'))(),
  new (require('./providers/rarbg'))(),
  new (require('./providers/torrent9'))(),
  new (require('./providers/torrentz2'))(),
  new (require('./providers/iptorrents'))(),
  new (require('./providers/torrentleech'))(),
  new (require('./providers/1337x'))(),
  new (require('./providers/extratorrent'))()
];
