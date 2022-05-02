const { getSuccess } = require('./responseService');
const { getDocument } = require('./dbService');

async function isAdmin(uid, option) {
  var doc = await getDocument(uid);
  if (doc.exists) {
    if (doc.data()['role'] === 'admin') {
      return true;
    } else if (option === undefined) return false;
    else return doc.data()[option];
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

/*function Authenticate(params){
	common.firebase.auth().signInWithEmailAndPassword(params.email, params.password)
		.then(userCredential =>{
			var user = userCredential.user;
		})
		.catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;
		// ...
			getError(errorMessage)
	})
}*/

module.exports.isAdmin = isAdmin;
module.exports.getRole = getRole;
