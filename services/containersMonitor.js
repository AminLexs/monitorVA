const { calcCPUPercent } = require('../utils/calculationUtils');
const { getContainer } = require('./dockerService');
const { getSuccess } = require('./responseService');
const { getError } = require('./responseService');
const { listContainers } = require('./dockerService');
const { listImages } = require('./dockerService');
const { isAdmin } = require('./authService');

async function list(params) {
  let dataFromDB = await isAdmin(params.uid, JSON.parse(params.imagelist) ? 'images' : 'containers');

  if (JSON.parse(params.imagelist)) {
    return new Promise((resolve, reject) => {
      listImages(function (err, images) {
        if (err) {
          reject(getError('Error getting images. Check docker server.'));
        } else {
          let imagesResponse = [];
          images.forEach(function (imageInfo) {
            if (dataFromDB === true || dataFromDB.includes(imageInfo.Id)) {
              let nameAndVersion = imageInfo.RepoTags[0].split(':');
              let image = {
                name: nameAndVersion[0],
                version: nameAndVersion[1],
                size: imageInfo.Size,
                created: imageInfo.Created,
                Id: imageInfo.Id,
              };
              imagesResponse.push(image);
            }
          });
          resolve(getSuccess(imagesResponse));
        }
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      listContainers({ all: true }, function (err, containers) {
        if (err) {
          reject(getError('Error getting containers. Check docker server.'));
        } else {
          let containersResponse = [];

          containers.forEach(function (containerInfo) {
            if (dataFromDB === true || dataFromDB.includes(containerInfo.Id)) {
              let container = {
                name: containerInfo.Names[0],
                image: containerInfo.Image,
                status: containerInfo.State,
                publicPort: containerInfo.Ports[0] !== undefined ? containerInfo.Ports[0].PublicPort : undefined,
                privatePort: containerInfo.Ports[0] !== undefined ? containerInfo.Ports[0].PrivatePort : undefined,
                created: containerInfo.Created,
                Id: containerInfo.Id,
              };
              containersResponse.push(container);
            }
          });
          resolve(getSuccess(containersResponse));
        }
      });
    });
  }
}

async function getStatsContainers(arrayID) {
  let tasks = arrayID.map((id) => {
    let container = getContainer(id);
    return new Promise((resolve, reject) => {
      container.stats({ stream: false }, function (err, data) {
        let cpuUsage = calcCPUPercent(data);
        resolve({
          name: data.name.slice(1),
          //pid: app.pid,
          cpu: cpuUsage,
          mem: data.memory_stats.usage, //process.memoryUsage.rss//
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
  return getSuccess(await getStatsContainers(necessaryContainers));
}

module.exports.list = list;
module.exports.monit = monit;
