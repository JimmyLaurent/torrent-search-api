const format = require('string-format');

exports.trim = value => (typeof value === 'string' ? value.trim() : value);

exports.reverse = value =>
  typeof value === 'string'
    ? value
        .split('')
        .reverse()
        .join('')
    : value;

exports.slice = (value, start, end) =>
  typeof value === 'string' ? value.slice(start, end) : value;

exports.replace = (value, searchValue, replaceValue) =>
  typeof value === 'string' ? value.replace(searchValue, replaceValue || '') : value;

exports.substr = (value, from, length) =>
  typeof value === 'string' ? value.substr(from, length) : value;

exports.int = value => {
  const intValue = parseInt(value);
  return isNaN(intValue) ? value : intValue;
};

exports.split = (value, char, index) => {
  if (typeof value === 'string') {
    if (char === '%SPECIAL_CHAR%') {
      char = '|';
    }
    const results = value.split(char);
    if (results[index] !== undefined) {
      return results[index];
    }
  }
  return value;
};

exports.format = (value, formatStr) => format(formatStr, value);

exports.until = (value, str) =>
  typeof value === 'string' && value.indexOf(str) > 0 ? value.substr(0, value.indexOf(str)) : value;

exports.match = (value, str) =>
  typeof value === 'string' && value.match(new RegExp(str)) !== null
    ? value.match(new RegExp(str))[1]
    : value;

exports.decodeURIComponent = value =>
  typeof value === 'string' ? decodeURIComponent(value) : value;
