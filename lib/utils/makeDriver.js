const makeClassicDriver = require('request-x-ray');
const makeCloudFareDriver = require('./cloudfareDriver');

function makeDriver(bypassCloudfare, opts) {
  const createDriver = bypassCloudfare
    ? makeCloudFareDriver
    : makeClassicDriver;

  return createDriver(opts);
}

module.exports = makeDriver;
