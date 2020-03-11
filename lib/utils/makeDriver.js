const makeDriver = requestFn => ({ url }, callback) => {
  requestFn(url)
    .then(response => {
      callback(null, response);
    })
    .catch(error => {
      callback(error);
    });
};

module.exports = makeDriver;
