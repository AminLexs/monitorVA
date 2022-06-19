const fs = require('fs');
const { sendReportToEmails } = require('./notificationService');
const { getContainerInfoDocker } = require('./dockerService');
const { getRandomIntInclusive } = require('../utils/stringUtils');
const { getShortContainersID } = require('../utils/stringUtils');
const { renameContainerDocker } = require('./dockerService');
const { getDocumentsFromCollection } = require('./dbService');
const { getError } = require('./responseService');
const { getObserveSettingsByUidForContainer } = require('./dbService');
const { getObserversForContainer } = require('./dbService');
const { getUidFromToken } = require('./dbService');
const { firestore, FieldValue } = require('./dbService');
const {
  getContainer,
  createContainer,
  removeContainer,
  restartContainer,
  pauseContainer,
  unPauseContainer,
  runExecDocker,
  updateContainer,
} = require('./dockerService');
const { getSuccess } = require('./responseService');

const { addObserverForContainer } = require('./dbService');
const { getDataForPdf } = require('./pdfService');

async function createContainerFromReq(params, req) {
  try {
    const token = req.get('token');
    const uid = await getUidFromToken(token);
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

    await firestore
      .collection('users')
      .doc(uid)
      .update({
        containers: FieldValue.arrayUnion(dockerResult.id),
      });
    return dockerResult;
  } catch (err) {
    return getError(err.message);
  }
}

async function createContainerFromFile(req) {
  try {
    const filedata = req.file;
    const pathToFile = filedata.path;
    const stringifySettings = fs.readFileSync(pathToFile).toString();
    const settings = JSON.parse(stringifySettings);
    const dockerResult = await createContainer({
      ...settings.settings,
      name: settings.Name + `${getRandomIntInclusive(10000, 100000)}`,
    });
    try {
      const container = await getContainer(settings.Name);
      await container.remove({ force: true });
    } catch (e) {}

    await renameContainerDocker(getShortContainersID(dockerResult.id), settings.Name);

    return dockerResult;
  } catch (err) {
    return getError(err.message);
  }
}

async function startContainer(id) {
  try {
    const container = getContainer(id);
    return container.start().then(function (err, data) {
      return data;
    });
  } catch (err) {}
}

async function startContainers(params) {
  const containersID = params.containersId;
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(startContainer(containerID));
  });

  return Promise.allSettled(promises).then((result) => {
    return result;
  });
}

async function stopContainer(id) {
  try {
    const container = getContainer(id);
    return await container.stop().then(function (err, data) {
      return data;
    });
  } catch (err) {}
}

async function stopContainers(params) {
  const containersID = params.containersId;
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(stopContainer(containerID));
  });
  return Promise.allSettled(promises).then((result) => {
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
  return Promise.allSettled(promises).then((result) => {
    return result;
  });
}

async function unPauseContainers(params) {
  const containersID = params.containersId;
  const promises = [];
  containersID.forEach((containerID) => {
    promises.push(unPauseContainer(containerID));
  });
  return Promise.allSettled(promises).then((result) => {
    return result;
  });
}

async function runExec(params) {
  return getSuccess(await runExecDocker(params.containerId, params.cmd));
}

async function updateObserverSettings(req, params) {
  const token = req.get('token');
  const uid = await getUidFromToken(token);
  return getSuccess(await addObserverForContainer(params.containerId, uid, params.options));
}

async function getObserveSettingsUserForContainer(req) {
  const token = req.get('token');
  const uid = await getUidFromToken(token);
  const containerId = req.get('containerId');
  return getSuccess(await getObserveSettingsByUidForContainer(containerId, uid));
}

async function updateContainerFromReq(params, req) {
  const containerId = req.get('containerId');
  return getSuccess(updateContainer(containerId, params.updateParams));
}

async function renameContainerFromReq(params, req) {
  const containerId = req.get('containerId');
  return getSuccess(renameContainerDocker(containerId, params.newName));
}

async function recreateContainer(params) {
  try {
    const oldSettings = JSON.parse(params.oldSettings).settings;
    oldSettings.HostConfig = {
      ...oldSettings.HostConfig,
      PortBindings: {
        [`${params.options.privatePort}/tcp`]: [{ HostPort: `${params.options.publicPort}` }],
      },
      Memory: +params.options.memoryUsageLimit,
      MemorySwap: -1,
      CpuShares: +params.options.cpuUsageLimit,
      RestartPolicy: {
        Name: 'on-failure',
        MaximumRetryCount: +params.options.countRestart,
      },
    };
    const newSettings = {
      ...oldSettings,
      name: params.containerId + `${getRandomIntInclusive(10000, 100000)}`,
      Healthcheck: {
        Test: params.options.command?.length !== 0 ? [params.options.command] : [],
        Interval: 0,
        Timeout: 1000000000,
        Retries: 0,
        StartPeriod: 0,
      },
      Hostname: params.options.hostname,
      Domainname: params.options.domainname,
      Image: params.options.image,
      ExposedPorts: {
        [`${params.options.privatePort}/tcp`]: {}, // ?????????????????????
      },
    };
    const dockerResult = await createContainer(newSettings);

    try {
      const container = await getContainer(JSON.parse(params.oldSettings).Name);
      await container.remove({ force: true });
    } catch (e) {
      console.log(e);
    }

    await renameContainerDocker(getShortContainersID(dockerResult.id), params.options.containerName);

    return dockerResult;
  } catch (err) {
    return getError(err.message);
  }
  return getSuccess(dockerResult);
}

async function sendReport(req) {
  try {
    const filedata = req.file;
    await sendReportToEmails(filedata.path, JSON.parse(req.get('emails')));

    return getSuccess('sent');
  } catch (error) {
    return getError(error.message);
  }
}

module.exports.createContainerFromReq = createContainerFromReq;
module.exports.startContainers = startContainers;
module.exports.restartContainers = restartContainers;
module.exports.stopContainers = stopContainers;
module.exports.deleteContainers = deleteContainers;
module.exports.pauseContainers = pauseContainers;
module.exports.unPauseContainers = unPauseContainers;
module.exports.runExec = runExec;
module.exports.updateObserverSettings = updateObserverSettings;
module.exports.getObserveSettingsUserForContainer = getObserveSettingsUserForContainer;
module.exports.updateContainerFromReq = updateContainerFromReq;
module.exports.createContainerFromFile = createContainerFromFile;
module.exports.renameContainerFromReq = renameContainerFromReq;
module.exports.recreateContainer = recreateContainer;
module.exports.sendReport = sendReport;
