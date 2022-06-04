const Docker = require('dockerode');
const { sendNotification } = require('./notificationService');
const { getObserversForContainer } = require('./dbService');
const docker = new Docker();
const { getStringWithoutStrangeSymbols } = require('../utils/stringUtils');

const { incrementContainerStatusTime } = require('./dbService');

const { saveContainer, deleteContainerFromDB } = require('./dbService');

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
  return docker.createContainer(options, callback);
}

async function removeContainer(id) {
  return (await getContainer(id)).remove({ force: true });
}

function buildImage(file, options) {
  return docker.buildImage(file, options);
}

function removeImage(id) {
  return docker.getImage(id).remove({ force: true });
}

async function restartContainer(id) {
  return (await getContainer(id)).restart();
}

async function pauseContainer(id) {
  return (await getContainer(id)).pause();
}

async function unPauseContainer(id) {
  return (await getContainer(id)).unpause();
}

function observeEvents() {
  const statusesForStatistic = ['start', 'stop', 'pause', 'unpause', 'restart'];
  const statusesForObserving = {
    start: 'onStart',
    stop: 'onStop',
    restart: 'onRestart',
    destroy: 'onDestroy',
    die: 'onDie',
    kill: 'onKill',
  };

  return docker.getEvents({}, (err, stream) => {
    if (err) console.error(err);
    stream.on('data', async (data) => {
      const evt = JSON.parse(data.toString());
      if (Object.keys(statusesForObserving).includes(evt.status) && evt.Type === 'container') {
        sendNotification(
          evt.id,
          evt.Actor.Attributes.name,
          evt.Actor.Attributes.image,
          evt.status,
          statusesForObserving[evt.status],
          evt.time,
        );
      }

      if (evt.status === 'create' && evt.Type === 'container') {
        await saveContainer(evt.id);
      }
      if (evt.status === 'destroy' && evt.Type === 'container') {
        await deleteContainerFromDB(evt.id);
      }
      if (statusesForStatistic.includes(evt.status) && evt.Type === 'container') {
        incrementContainerStatusTime(evt.id, evt.status);
      }
    });
  });
}

async function getContainerInfoDocker(id) {
  return (await getContainer(id)).inspect();
}

async function getContainerLogsDocker(id) {
  return (await getContainer(id)).logs({ follow: false, stdout: 1, stderr: 1 });
}

async function runExecDocker(id, cmd) {
  const container = await getContainer(id);
  return new Promise((resolve, reject) => {
    container.exec({ Cmd: [cmd], AttachStdin: true, AttachStdout: true }, (err, exec) => {
      if (err) {
        reject(err.json.message);
      } else {
        resolve(exec);
      }
    });
  })
    .then(async (exec1) => {
      return await new Promise((resolve, reject) => {
        exec1.start({ stdin: true }, (err, stream) => {
          if (err) return err.json.message;
          else {
            let data = [];
            stream.on('data', (chunk) => {
              data.push(chunk);
            });
            let times = 10;
            const inspectLoop = () => {
              exec1.inspect((inspError, inspect) => {
                if (inspect.ExitCode !== null) {
                  if (times !== 10) {
                    inspect.tries = 10 - times;
                  }

                  resolve(getStringWithoutStrangeSymbols(Buffer.concat(data).toString()));
                } else {
                  times--;
                  setTimeout(inspectLoop, 50);
                }
              });
            };
            inspectLoop();
            // stream.on('end', () => {
            //     resolve(Buffer.concat(data).toString())
            //     });
            // }
          }
        });
      });
    })
    .catch((msg) => {
      console.log(msg);
    });
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
module.exports.unPauseContainer = unPauseContainer;
module.exports.observeEvents = observeEvents;
module.exports.getContainerInfoDocker = getContainerInfoDocker;
module.exports.getContainerLogsDocker = getContainerLogsDocker;
module.exports.runExecDocker = runExecDocker;
