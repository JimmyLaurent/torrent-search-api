const path = require('path');
const createApi = require('./createApi');

module.exports = createApi(path.join(__dirname, './lib/providers'));
