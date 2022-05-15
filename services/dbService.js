const firebase = require('firebase');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.projectId,
    privateKey: process.env.privateKey,
    clientEmail: process.env.clientEmail,
  }),
});
const adminAuth = admin.auth();

firebase.initializeApp({
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
});
const firestore = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;

const containerDBTemplate = {
  startTimes: 0,
  stopTimes: 0,
  pauseTimes: 0,
  unpauseTimes: 0,
  restartTimes: 0,
};

async function getUidFromToken(token) {
  const decodedToken = await adminAuth.verifyIdToken(token);
  if (!decodedToken.uid) {
    return console.log('UID is not present in verified token');
  }
  return decodedToken.uid;
}

async function getDocument(uid) {
  let doc;
  await firestore
    .collection('users')
    .doc(uid)
    .get()
    .then((document) => {
      doc = document;
    })
    .catch(function (error) {
      console.log('Error getting documents: ', error);
      doc = null;
    });
  return doc;
}

async function getContainersFromUid(uid) {
  const doc = await getDocument(uid);
  if (doc.exists) {
    return doc.data()['containers'];
  } else {
    return 'Error getting documents';
  }
}

async function getImagesFromUid(uid) {
  const doc = await getDocument(uid);
  if (doc.exists) {
    return doc.data()['images'];
  } else {
    return 'Error getting documents';
  }
}

const Statuses = {
  start: 'startTimes',
  stop: 'stopTimes',
  pause: 'pauseTimes',
  unpause: 'unpauseTimes',
  restart: 'restartTimes',
};

async function getStatsContainers(containersId) {
  const promises = [];
  containersId.forEach((id) => {
    promises.push(firestore.collection('containers').doc(id).get());
  });
  return Promise.all(promises).then((result) => {
    const res = result.map((snap, index) => ({ id: containersId[index], stats: snap.data() }));
    return res;
  });
}

async function saveContainer(id) {
  return firestore.collection('containers').doc(id).set(containerDBTemplate);
}

async function deleteContainerFromDB(id) {
  return firestore.collection('containers').doc(id).delete();
}

async function incrementContainerStatusTime(id, status) {
  const washingtonRef = firestore.collection('containers').doc(id);

  const res = await washingtonRef.update({
    [Statuses[status]]: FieldValue.increment(1),
  });
}

module.exports.FieldValue = FieldValue;
module.exports.firestore = firestore;
module.exports.firebase = firebase;
module.exports.getDocument = getDocument;
module.exports.getContainersFromUid = getContainersFromUid;
module.exports.getImagesFromUid = getImagesFromUid;
module.exports.getUidFromToken = getUidFromToken;
module.exports.incrementContainerStatusTime = incrementContainerStatusTime;
module.exports.saveContainer = saveContainer;
module.exports.deleteContainerFromDB = deleteContainerFromDB;
module.exports.getStatsContainers = getStatsContainers;
