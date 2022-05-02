const pkg = require('../package.json');
const results = require('../enums/responseResults');

function getSuccess(data, message) {
  return {
    version: pkg.version,
    result: results.SPZ_OK,
    error: null,
    success: message ? message + '.' : null,
    data: data,
  };
}

function getError(message) {
  return {
    version: pkg.version,
    result: results.SPZ_FAILED,
    error: message + '.',
    success: '',
    data: '',
  };
}

module.exports.getSuccess = getSuccess;
module.exports.getError = getError;
