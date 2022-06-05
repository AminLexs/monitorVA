const { listImages } = require('./dockerService');
const { getImagesFromUid, getUidFromToken } = require('./dbService');
const { checkIsAdmin } = require('./authService');
const { getError, getSuccess } = require('./responseService');
const { docker, buildImage, removeImage } = require('../services/dockerService');

async function addImage(req) {
  try {
    const filedata = req.file;
    const imageName = req.get('imageName');

    const stream = await buildImage(filedata.path, { t: imageName }, function (err, response) {
      if (err) {
        console.log(err);
      }
    });
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
    });
    // await firestore
    //   .collection('users')
    //   .doc(params.uid)
    //   .update({
    //     images: FieldValue.arrayUnion(params.app.name),
    //   })
    //   .then(() => {
    //     console.log('Document updated ');
    //   })
    //   .catch(function (error) {
    //     console.log('Error getting documents: ', error);
    //   });
    //
    return getSuccess({}, 'Image succesfully added');
  } catch (err) {
    return getError(err.message);
  }
}

async function deleteImage(id) {
  return removeImage(id);
}

async function deleteImages(params) {
  const imagesID = params.imagesId;
  const promises = [];
  imagesID.forEach((imageID) => {
    promises.push(deleteImage(imageID));
  });
  return Promise.all(promises).then((result) => {
    return result;
  });
}

const getImageFromResponse = (imageInfo) => {
  const nameAndVersion = imageInfo.RepoTags[0].split(':');
  const image = {
    name: nameAndVersion[0],
    version: nameAndVersion[1],
    size: imageInfo.Size,
    created: imageInfo.Created,
    Id: imageInfo.Id,
  };
  return image;
};

async function list(req) {
  return new Promise((resolve, reject) => {
    listImages(async function (err, images) {
      if (err) {
        reject(getError('Error getting images. Check docker server.'));
      } else {
        const token = req.get('token');
        const uid = await getUidFromToken(token);
        const isAdmin = await checkIsAdmin(uid);
        if (isAdmin) {
          return resolve(getSuccess(images.map((container) => getImageFromResponse(container))));
        }
        const allowedImages = await getImagesFromUid(uid);
        if (allowedImages) {
          const imagesResponse = images
            .filter((image) => allowedImages.includes(image.id))
            .map((container) => getImageFromResponse(container));
          return resolve(getSuccess(imagesResponse));
        }
        resolve(getSuccess([]));
      }
    });
  });
}

async function checkName(req) {
  const imageName = req.get('imageName');
  return new Promise((resolve, reject) => {
    listImages(async function (err, response) {
      if (err) {
        reject(getError('Error getting images. Check docker server.'));
      } else {
        const imagesNames = response.map((container) => getImageFromResponse(container)).map((image) => image.name);
        resolve(imagesNames.includes(imageName));
      }
    });
  });
}

// if (JSON.parse(params.imagelist)) {
//   return new Promise((resolve, reject) => {
//     listImages(function (err, images) {
//       if (err) {
//         reject(getError('Error getting images. Check docker server.'));
//       } else {
//         let imagesResponse = [];
//         images.forEach(function (imageInfo) {
//           if (dataFromDB === true || dataFromDB.includes(imageInfo.Id)) {
//             let nameAndVersion = imageInfo.RepoTags[0].split(':');
//             let image = {
//               name: nameAndVersion[0],
//               version: nameAndVersion[1],
//               size: imageInfo.Size,
//               created: imageInfo.Created,
//               Id: imageInfo.Id,
//             };
//             imagesResponse.push(image);
//           }
//         });
//         resolve(getSuccess(imagesResponse));
//       }
//     });
//   });
// } else {
module.exports.addImage = addImage;
module.exports.deleteImages = deleteImages;
module.exports.list = list;
module.exports.checkName = checkName;
