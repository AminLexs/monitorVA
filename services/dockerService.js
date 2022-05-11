const Docker = require('dockerode');
const docker = new Docker();

const { incrementContainerStatusTime } = require('./dbService');

const {saveContainer, deleteContainerFromDB} = require('./dbService')

function getContainer(name) {
  return docker.getContainer(name);
}

function listImages(callback) {
  return docker.listImages(callback);
}

function listContainers(options, callback) {
  return docker.listContainers(options, callback);
}

function createContainer(options, callback) {
  return docker.createContainer(options, callback)
}

async function removeContainer(id) {
  return (await getContainer(id)).remove({force:true})
}


function buildImage(file, options) {
  return docker.buildImage(file, options);
}

function removeImage(id) {
  return docker.getImage(id).remove({force: true})
}

async function restartContainer(id) {
  return (await getContainer(id)).restart()
}

async function pauseContainer(id) {
  return (await getContainer(id)).pause()
}

async function unPauseContainer(id) {
  return (await getContainer(id)).unpause()
}

 function observeEvents() {
  const observingStatuses = ['start', 'stop', 'pause', 'unpause', 'restart']
  return   docker.getEvents({},(err, stream) => {
    if (err) console.error(err);
    stream.on('data', async (data) => {
      const evt = JSON.parse(data.toString());
      if (evt.status === 'create' && evt.Type === 'container'){
        await saveContainer(evt.id)
      }
      if (evt.status === 'destroy' && evt.Type === 'container'){
        await deleteContainerFromDB(evt.id)
      }
      if (observingStatuses.includes(evt.status) && evt.Type === 'container') {
        incrementContainerStatusTime(evt.id,evt.status)
      }
    });
  });
}
async function getContainerInfoDocker(id) {
  return (await getContainer(id)).inspect()
}
async function getContainerLogsDocker(id) {
  return (await getContainer(id)).logs({follow:false, stdout: 1, stderr: 1,})
}

module.exports.docker = docker;
module.exports.getContainer = getContainer;
module.exports.listImages = listImages;
module.exports.listContainers = listContainers;
module.exports.buildImage = buildImage;
module.exports.createContainer = createContainer;
module.exports.removeContainer = removeContainer;
module.exports.removeImage = removeImage;
module.exports.restartContainer = restartContainer;
module.exports.pauseContainer = pauseContainer;
module.exports.unPauseContainer =unPauseContainer;
module.exports.observeEvents = observeEvents;
module.exports.getContainerInfoDocker = getContainerInfoDocker;
module.exports.getContainerLogsDocker = getContainerLogsDocker;