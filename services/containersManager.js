const { getContainer } = require('../services/dockerService');

async function startContainer(params) {
  const name = params.app.name.slice(1);
  const container = getContainer(name);
  return await container.start().then(function (err, data) {
    return data;
  });
}

async function stopContainer(params) {
  const name = params.app.name.slice(1);
  const container = getContainer(name);
  return await container.stop().then(function (err, data) {
    return data;
  });
}

module.exports.startContainer = startContainer;
module.exports.stopContainer = stopContainer;
