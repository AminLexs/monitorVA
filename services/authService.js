const { getError } = require('./responseService');
const { adminAuth } = require('./dbService');
const { getUidFromToken } = require('./dbService');
const { getDocumentsFromCollection } = require('./dbService');
const { getSuccess } = require('./responseService');
const { getDocument } = require('./dbService');
const { firestore } = require('./dbService');

async function checkIsAdmin(uid) {
  const doc = await getDocument(uid);
  if (doc.exists) {
    return doc.data()['role'] === 'admin';
  } else {
    return 'Error getting documents';
  }
}

async function getRoleFromRequest(req) {
  const token = req.get('token');
  const uid = await getUidFromToken(token);
  const doc = await getDocument(uid);
  const message = 'Role sent successfully.';
  const role = doc.data()['role'];
  return getSuccess(role, message);
}

async function getUsers(req) {
  const token = req.get('token');
  const uid = await getUidFromToken(token);
  if (await checkIsAdmin(uid))
    return getSuccess((await getDocumentsFromCollection('users')).filter((user) => user.id !== uid));
}

async function changeUserRole(params, req) {
  const token = req.get('token');
  const uid = await getUidFromToken(token);
  if (await checkIsAdmin(uid)) {
    const washingtonRef = firestore.collection('users').doc(params.uid);

    return await washingtonRef.update({
      role: params.role,
    });
  }
}

async function createUser(params, req) {
  const token = req.get('token');
  const uid = await getUidFromToken(token);
  if (await checkIsAdmin(uid))
    try {
      return new Promise((resolve, reject) => {
        adminAuth
          .createUser({
            email: params.email,
            password: params.password,
          })
          .then(async (userRecord) => {
            resolve(
              getSuccess(
                await firestore.collection('users').doc(userRecord.uid).set({
                  mail: params.email,
                  role: 'user',
                }),
              ),
            );
          })
          .catch((error) => {
            resolve(getError(`Error creating new user: ${error.message}`));
          });
      });
    } catch (err) {
      return getError(err.message);
    }
}

async function deleteUser(params, req) {
  const token = req.get('token');
  const uid = await getUidFromToken(token);
  if (await checkIsAdmin(uid))
    try {
      await adminAuth.deleteUser(params.uid);
      await firestore.collection('users').doc(params.uid).delete();
      return getSuccess('Successfully deleted');
    } catch (err) {
      return getError(err.message);
    }
}

module.exports.checkIsAdmin = checkIsAdmin;
module.exports.getRoleFromRequest = getRoleFromRequest;
module.exports.getUsers = getUsers;
module.exports.changeUserRole = changeUserRole;
module.exports.createUser = createUser;
module.exports.deleteUser = deleteUser;
