const { getUidFromToken } = require('./dbService');
const { getContainersFromUid } = require('./dbService');
const { calcCPUPercent } = require('../utils/calculationUtils');
const { getContainer } = require('./dockerService');
const { getSuccess } = require('./responseService');
const { getError } = require('./responseService');
const { listContainers, getContainerInfoDocker, getContainerLogsDocker } = require('./dockerService');
const { checkIsAdmin } = require('./authService');
const { getStringWithoutStrangeSymbols } = require('../utils/stringUtils');

const getContainerFromResponse = (containerInfo) => {
  const container = {
    name: containerInfo.Names[0],
    image: containerInfo.Image,
    status: containerInfo.State,
    publicPort: containerInfo.Ports[0] !== undefined ? containerInfo.Ports[1].PublicPort : undefined,
    privatePort: containerInfo.Ports[0] !== undefined ? containerInfo.Ports[1].PrivatePort : undefined,
    created: containerInfo.Created,
    Id: containerInfo.Id,
  };
  return container;
};

async function list(req) {
  return new Promise((resolve, reject) => {
    listContainers({ all: true }, async function (err, containers) {
      if (err) {
        reject(getError('Error getting containers. Check docker server.'));
      } else {
        const token = req.get('token');
        const uid = await getUidFromToken(token);
        const isAdmin = await checkIsAdmin(uid);
        if (isAdmin) {
          return resolve(getSuccess(containers.map((container) => getContainerFromResponse(container))));
        }
        const allowedContainers = await getContainersFromUid(uid);
        if (allowedContainers) {
          const containersResponse = containers
            .filter((container) => allowedContainers.includes(container.Id))
            .map((container) => getContainerFromResponse(container));
          return resolve(getSuccess(containersResponse));
        }
        resolve(getSuccess([]));
      }
    });
  });
}

async function getStatsContainersFromDocker(arrayID) {
  let tasks = arrayID.map((id) => {
    let container = getContainer(id);
    return new Promise((resolve, reject) => {
      container.stats({ stream: false }, function (err, data) {
        let cpuUsage = calcCPUPercent(data);
        resolve({
          name: data.name.slice(1),
          //pid: app.pid,
          cpu: cpuUsage > 100 ? 100 : cpuUsage,
          mem: data.memory_stats.usage,
          maxUsageMem: data.memory_stats.max_usage,
          memLimit: data.memory_stats.limit,
        });
      });
    });
  });
  return await Promise.all(tasks).then((result) => {
    return result;
  });
}

async function getActiveContainersId() {
  return new Promise((resolve, reject) => {
    listContainers(function (err, containers) {
      if (err) {
        reject(getError('Error getting containers. Check docker server.'));
      } else {
        let activeContainersId = containers.map((elem) => elem.Id);
        resolve(activeContainersId);
      }
    });
  });
}

async function monit(params) {
  let containersId = params.containersId;
  let activeContainers = await getActiveContainersId();
  let necessaryContainers = containersId.filter(function (id) {
    if (activeContainers.includes(id)) return id;
  });

  return getSuccess(await getStatsContainersFromDocker(necessaryContainers));
}

async function getContainerInfo(req) {
  return getSuccess(await getContainerInfoDocker(req.query.containerID));
}

async function getContainerLogs(req) {
  const dockerResult = await getContainerLogsDocker(req.query.containerID);

  return getSuccess(getStringWithoutStrangeSymbols(dockerResult.toString('utf8')));
}

module.exports.getContainerInfo = getContainerInfo;
module.exports.getContainerLogs = getContainerLogs;
module.exports.list = list;
module.exports.monit = monit;
module.exports.getStatsContainersFromDocker = getStatsContainersFromDocker;
