import dockerode from 'dockerode';

const { buildImage } = require('../services/dockerService');
const { firestore, FieldValue } = require('../lib/common');

async function addImage(params) {
  let stream = buildImage('D:\\lab1servlags.tar', { t: 'lab1servlags' }, function (err, response) {
    if (!err) {
    }
  });
  await new Promise((resolve, reject) => {
    dockerode.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
  });
  let doc;
  await firestore
    .collection('users')
    .doc(params.uid)
    .update({
      apps: FieldValue.arrayUnion(params.app.name),
    })
    .then(() => {
      console.log('Document updated ');
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error);
      doc = null;
    });

  return getSuccess(params.app, 'Image succesfully added');
}

module.exports.addImage = addImage;
