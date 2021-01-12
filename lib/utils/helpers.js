exports.uniqueName = name => name.toString().toLowerCase();
exports.isString = value => typeof value === 'string';
exports.isObject = value => typeof value === 'object';
exports.isArray = value => value instanceof Array;
exports.oneArgument = args => args.length === 1;
exports.twoArguments = args => args.length === 2;
exports.silentRejection = fn => fn.catch(() => null);
exports.isClass = fn => /^class/.test(fn.toString());
exports.humanizeSize = bytes => {
  const thresh = 1000;
  if (bytes < thresh) {
    return `${bytes} B`;
  }
  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (bytes >= thresh);
  return `${bytes.toFixed(1)} ${units[u]}`;
};