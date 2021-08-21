
var pkg = require('../package.json')
var settings = require('../settings.json')
const firebase = require('firebase');

module.exports.pkg = pkg

const results = {
	SPZ_OK: 'SPZ_OK',
	SPZ_FAILED: 'SPZ_FAILED'
}
firebase.initializeApp({
	apiKey: "AIzaSyC26TD0pop_oIwDPmWozuHszxWA9g5jjXI",
	authDomain: "monitorva.firebaseapp.com",
	projectId: "monitorva",
	storageBucket: "monitorva.appspot.com",
	messagingSenderId: "765729795514",
	appId: "1:765729795514:web:3e2fb4d1e1eeb0517a4183"
})
var firestore = firebase.firestore()
const FieldValue = firebase.firestore.FieldValue

module.exports.FieldValue = FieldValue
module.exports.firestore = firestore
module.exports.results = results
module.exports.firebase = firebase
settings.host = settings.host || 'http://localhost'
settings.port = settings.port || 8200
module.exports.settings = settings
