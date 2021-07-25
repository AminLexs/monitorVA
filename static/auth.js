var firebase = require('firebase/firebase')
var firebaseConfig = {
    apiKey: "AIzaSyC26TD0pop_oIwDPmWozuHszxWA9g5jjXI",
    authDomain: "monitorva.firebaseapp.com",
    projectId: "monitorva",
    storageBucket: "monitorva.appspot.com",
    messagingSenderId: "765729795514",
    appId: "1:765729795514:web:3e2fb4d1e1eeb0517a4183"
}
var userid = ""
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
function Auth(){
    if(validateEmail($('#email').val()) && $('#psw').val().length>5) {

        firebase.auth().signInWithEmailAndPassword($('#email').val(), $('#psw').val())
            .then(userCredential =>{
                setUserId(userCredential.user.uid)
                getList()
                document.getElementById('btnStartStop').style.display = ""
                document.getElementById('btnAdd').style.display = ""
                document.getElementById('btnEdit').style.display = ""
                document.getElementById('btnList').style.display = ""
                document.getElementById('btnMonit').style.display = ""
                document.getElementById('btnMonit').style.display = ""
                document.getElementById('settings').style.display = ""

            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                document.getElementById('errorLabel').innerText=errorMessage+" ("+errorCode+")"
            })
      /*  $.ajax({
            url: '/auth',
            method: 'POST',
            json: true,
            data: {email:$('#email').val(), password:$('#psw').val()},
            success: function (response) {
                getList()
                document.getElementById('btnStartStop').style.display = ""
            }
        })*/
    }
}
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
global.Auth = Auth
global.userid = userid