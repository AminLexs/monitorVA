const firebase = require('firebase');

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
module.exports.FieldValue = FieldValue;
module.exports.firestore = firestore;
module.exports.firebase = firebase;
module.exports.getDocument = getDocument;
