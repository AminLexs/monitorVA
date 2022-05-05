const { getContainer } = require('../services/dockerService');

async function createContainer() {
  return new Promise((resolve, reject) => {
    createContainer({ all: true }, async function (err, containers) {
      if (err) {
        reject(getError('Error getting containers. Check docker server.'));
      } else {

      }
    })})
}

async function startContainer(id) {
  const container = getContainer(id);
  return container.start().then(function (err, data) {
    return data;
  });
}

async function startContainers(params) {
  const containersID = params.containersId;
  const promises = []
  containersID.forEach((containerID)=>{
    promises.push(startContainer(containerID))
  })
  return Promise.all(promises).then((result) => {
    return result;
  });
}

async function stopContainer(id) {
  const container = getContainer(id);
  return await container.stop().then(function (err, data) {
    return data;
  });
}

async function stopContainers(params) {
  const containersID = params.containersId;
  const promises = []
  containersID.forEach((containerID)=>{
    promises.push(stopContainer(containerID))
  })
  return Promise.all(promises).then((result) => {
    return result;
  });
}

module.exports.startContainers = startContainers
//module.exports.startContainer = startContainer;
//module.exports.stopContainer = stopContainer;
module.exports.stopContainers = stopContainers
