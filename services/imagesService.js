const dockerode = require('dockerode');
const {listImages} = require("./dockerService");
const {getImagesFromUid, getUidFromToken} = require("./dbService");
const {checkIsAdmin} = require("./authService");
const {getError, getSuccess} = require("./responseService");
const { buildImage } = require('../services/dockerService');

async function addImage(params) {
  let filedata = params.file;
  console.log(filedata);
  const stream = buildImage(filedata.path, { t: 'lab1ewqew2serrvlags' }, function (err, response) {
    if (err) {
      console.log(err)
    }
  });
  // await new Promise((resolve, reject) => {
  //   dockerode.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
  // });
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
}

const getImageFromResponse = (imageInfo)=>{
  const nameAndVersion = imageInfo.RepoTags[0].split(':');
  const image = {
      name: nameAndVersion[0],
      version: nameAndVersion[1],
      size: imageInfo.Size,
      created: imageInfo.Created,
      Id: imageInfo.Id,
  };
  return image;
}

async function list(req) {
  return new Promise((resolve, reject) => {
    listImages( async function (err, images) {
      if (err) {
        reject(getError('Error getting images. Check docker server.'));
      } else {
        const token = req.get('token')
        const uid = await getUidFromToken(token);
        const isAdmin = await checkIsAdmin(uid);
        if (isAdmin) {
          return resolve(getSuccess(images.map((container)=>(getImageFromResponse(container)))));
        }
        const allowedImages = await getImagesFromUid(uid)
        const imagesResponse = images.filter((image)=>(
            allowedImages.includes(image.id)
        )).map((container)=>(getImageFromResponse(container)));
        return resolve(getSuccess(imagesResponse));
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
module.exports.list = list;
