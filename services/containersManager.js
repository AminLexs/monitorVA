const {
  getContainer,
  createContainer,
  removeContainer,
  restartContainer,
  pauseContainer,
  unPauseContainer,
  runExecDocker,
} = require('./dockerService');
const { getSuccess } = require('./responseService');

const { getDataForPdf } = require('./pdfService');

async function createContainerFromReq(params) {
  const dockerResult = await createContainer({
    Image: params.imageName,
    HostConfig: {
      PortBindings: {
        [`${params.privatePort}/tcp`]: [{ HostPort: `${params.publicPort}` }],
      },
      Binds: ['/root/dir:/tmp'],
    },
    ExposedPorts: {
      [`${params.privatePort}/tcp`]: {}, // ?????????????????????
    },
    name: params.containerName,
  });

  return dockerResult;
}

async function startContainer(id) {
  const container = getContainer(id);
  return container.start().then(function (err, data) {
    return data;
  });
}

async function startContainers(params) {
  const containersID = params.containersId;
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(startContainer(containerID));
  });
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
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(stopContainer(containerID));
  });
  return Promise.all(promises).then((result) => {
    return result;
  });
}

async function deleteContainer(id) {
  const dockerResult = await removeContainer(id);

  return dockerResult;
}

async function deleteContainers(params) {
  const containersID = params.containersId;
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(deleteContainer(containerID));
  });
  return Promise.all(promises).then((result) => {
    return result;
  });
}

async function restartContainers(params) {
  const containersID = params.containersId;
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(restartContainer(containerID));
  });
  return Promise.all(promises).then((result) => {
    return result;
  });
}

async function pauseContainers(params) {
  const containersID = params.containersId;
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(pauseContainer(containerID));
  });
  return Promise.all(promises).then((result) => {
    return result;
  });
}

async function unPauseContainers(params) {
  const containersID = params.containersId;
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(unPauseContainer(containerID));
  });
  return Promise.all(promises).then((result) => {
    return result;
  });
}

async function runExec(params) {
  return getSuccess(await runExecDocker(params.containerId, params.cmd));
}

module.exports.createContainerFromReq = createContainerFromReq;
module.exports.startContainers = startContainers;
module.exports.restartContainers = restartContainers;
module.exports.stopContainers = stopContainers;
module.exports.deleteContainers = deleteContainers;
module.exports.pauseContainers = pauseContainers;
module.exports.unPauseContainers = unPauseContainers;
module.exports.runExec = runExec;
