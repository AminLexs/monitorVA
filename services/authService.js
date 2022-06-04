const { getSuccess } = require('./responseService');
const { getDocument } = require('./dbService');

async function checkIsAdmin(uid) {
  const doc = await getDocument(uid);
  if (doc.exists) {
    return doc.data()['role'] === 'admin';
  } else {
    return 'Error getting documents';
  }
}

async function getRole(params) {
  var doc = await getDocument(params.uid);
  var message = 'Role sent successfully.';
  var role = doc.data()['role'];
  return getSuccess(role, message);
}

module.exports.checkIsAdmin = checkIsAdmin;
module.exports.getRole = getRole;
