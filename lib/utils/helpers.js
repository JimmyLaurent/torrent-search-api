exports.uniqueName = name => name.toLowerCase();
exports.isString = value => typeof value === 'string';
exports.isObject = value => typeof value === 'object';
exports.isArray = value => value instanceof Array;
exports.oneArgument = args => args.length === 1;
exports.twoArguments = args => args.length === 2;
exports.silentRejection = fn => fn.catch(() => null);
exports.isClass = fn => /^class/.test(fn.toString());