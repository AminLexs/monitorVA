const firebase = require('firebase');
const admin = require('firebase-admin');
const { getDocs } = require('firebase/firestore');
const serviceAccount = require(`../firebaseCrt/${process.env.crtFileName}`);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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

function getDocumentsFromCollection(collection) {
  return firestore
    .collection(collection)
    .get()
    .then((querySnapshot) => {
      return querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
    });
}

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

async function addObserverForContainer(containerId, uid, options) {
  const washingtonRef = firestore.collection('containers').doc(containerId);

  return await washingtonRef.update({
    observers: { [uid]: options },
  });
}

async function getObserversForContainer(containerId, event) {
  try {
    const containerInfo = await firestore.collection('containers').doc(containerId).get();
    const observers = containerInfo.data().observers;
    const duplicatedEmails = Object.values(observers).reduce((acc, observerInfo) => {
      return observerInfo[event] === true && observerInfo.isOn ? [...acc, observerInfo.emails] : acc;
    }, []);

    return Array.from(new Set(...duplicatedEmails));
  } catch (err) {}
}

async function getObserveSettingsByUidForContainer(containerId, uid) {
  try {
    const containerInfo = await firestore.collection('containers').doc(containerId).get();
    const observers = containerInfo.data().observers;
    return observers[uid];
  } catch (e) {
    console.log('Error get observe settings: ' + e.message);
  }
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
    const result = doc.data()['images'];
    return result;
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
module.exports.adminAuth = adminAuth;
module.exports.getDocument = getDocument;
module.exports.getContainersFromUid = getContainersFromUid;
module.exports.getImagesFromUid = getImagesFromUid;
module.exports.getUidFromToken = getUidFromToken;
module.exports.incrementContainerStatusTime = incrementContainerStatusTime;
module.exports.saveContainer = saveContainer;
module.exports.deleteContainerFromDB = deleteContainerFromDB;
module.exports.getStatsContainers = getStatsContainers;
module.exports.addObserverForContainer = addObserverForContainer;
module.exports.getObserversForContainer = getObserversForContainer;
module.exports.getObserveSettingsByUidForContainer = getObserveSettingsByUidForContainer;
module.exports.getDocumentsFromCollection = getDocumentsFromCollection;
