const nodemailer = require('nodemailer');

async function getEmailsToSend(appname, state) {
    var emailsToSend = []
    await common.firestore.collection("users").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var states = [doc.data()["sendOnCrash"], doc.data()["sendOnClose"], doc.data()["sendOnExit"]]
            if (states[state] && (doc.data()["role"] == "admin" || doc.data()["apps"].indexOf(appname) > -1))
                if (doc.data()["mail"] != null)
                    emailsToSend.push(doc.data()["mail"])

        })
        // doc.data() is never undefined for query doc snapshots
        //console.log(doc.id, " => ", doc.data());

    }).catch(function (error) {
        console.log("Error getting documents: ", error);
        emailsToSend = null;
    })
    return emailsToSend
}

async function SetCrashSend(params) {
    await common.firestore.collection("users").doc(params.uid).update({
        sendOnCrash: JSON.parse(params.flag)
    }).then(() => {
        console.log("Document updated ");
    })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
            doc = null
        })
    //crashSend=JSON.parse(params.flag)
    var message = 'Sending mail when the application is crashed changed'
    showInfo(message)
    return getSuccess(null, message)
}

async function SetExitSend(params) {
    await common.firestore.collection("users").doc(params.uid).update({
        sendOnExit: JSON.parse(params.flag)
    }).then(() => {
        console.log("Document updated ");
    })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
            doc = null
        })
    //exitSend=JSON.parse(params.flag)
    var message = 'Sending mail when the application is exited changed'
    showInfo(message)
    return getSuccess(null, message)
}

async function SetCloseSend(params) {
    await common.firestore.collection("users").doc(params.uid).update({
        sendOnClose: JSON.parse(params.flag)
    }).then(() => {
        console.log("Document updated ");
    })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
            doc = null
        })
//	closeSend=JSON.parse(params.flag)
    var message = 'Sending mail when the application is closed changed'
    showInfo(message)
    return getSuccess(null, message)
}

async function SetEmail(params) {
    await common.firestore.collection("users").doc(params.uid).update({
        mail: params.email
    }).then(() => {
        console.log("Document updated ");
    })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
            doc = null
        })
//	closeSend=JSON.parse(params.flag)
    var message = 'Mail was setted'
    showInfo(message)
    return getSuccess(null, message)
}


async function GetSettings(params) {
    var doc = await getDocument(params.uid)
    var settings = []
    settings.push({
        sentexit: doc.data()["sendOnExit"],
        sentcrash: doc.data()["sendOnCrash"],
        sentclose: doc.data()["sendOnClose"],
        toemail: doc.data()["mail"],
    })
    var message = 'Settings sent successfully'
    return getSuccess(settings, message)
}

function SendMail(message, toEmails) {
    let smtpTransport;
    try {
        smtpTransport = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true, // true for 465, false for other ports 587
            auth: {
                user: "vikulya.poddubnaya01@mail.ru",
                pass: "ECIEgt4iop4"
            }
        });
    } catch (e) {
        return console.log('Error: ' + e.name + ":" + e.message);
    }

    let mailOptions = {
        from: 'vikulya.poddubnaya01@mail.ru', // sender address
        to: toEmails, // list of receivers
        subject: '[Сервер] Приложение завершилось', // Subject line
        text: message, // plain text body
        //html: output // html body
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
            // return console.log(error);
            return console.log(error);
        } else {
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    })
}
