const Docker = require('dockerode')
const docker = new Docker();

function getContainer(name){
   return  docker.getContainer(name)
}

function listImages(callback){
    return  docker.listImages(callback)
}

function listContainers(options,callback){
    return  docker.listContainers(options,callback)
}

function buildImage(file, options) {
    docker.buildImage(file,options)
}

module.exports.getContainer = getContainer
module.exports.listImages = listImages
module.exports.listContainers = listContainers