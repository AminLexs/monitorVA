const { getObserversForContainer } = require('./dbService');
const nodemailer = require('nodemailer');
const { getShortContainersID } = require('../utils/stringUtils');
const { htmlForMessage } = require('../utils/htmlForMessage');

async function sendNotification(containerId, containerName, imageName, status, event, timeWhenChange) {
  const emails = await getObserversForContainer(containerId, event);
  if (emails && emails.length !== 0) {
    let smtpTransport;
    try {
      smtpTransport = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, // true for 465, false for other ports 587
        auth: {
          user: process.env.emailAuthUser,
          pass: process.env.emailAuthPassword,
        },
      });
    } catch (e) {
      return console.log('Error: ' + e.name + ':' + e.message);
    }

    let mailOptions = {
      from: process.env.emailAuthUser, // sender address
      to: emails, // list of receivers
      subject: 'Контейнер изменил статус', // Subject line
      html: htmlForMessage(
        getShortContainersID(containerId),
        containerName,
        imageName,
        status,
        new Date(timeWhenChange * 1000),
      ), // html body
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      } else {
        //success sent
      }
    });
  }
}

async function sendReportToEmails(filePath, emails) {
  if (emails && emails.length !== 0) {
    let smtpTransport;
    try {
      smtpTransport = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, // true for 465, false for other ports 587
        auth: {
          user: process.env.emailAuthUser,
          pass: process.env.emailAuthPassword,
        },
      });
    } catch (e) {
      return console.log('Error: ' + e.name + ':' + e.message);
    }

    let mailOptions = {
      from: process.env.emailAuthUser, // sender address
      to: emails, // list of receivers
      subject: 'Новый отчёт', // Subject line
      attachments: [
        {
          // file on disk as an attachment
          filename: 'Containers_Report.pdf',
          path: filePath, // stream this file
        },
      ],
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      } else {
        //success sent
      }
    });
  }
}

module.exports.sendNotification = sendNotification;
module.exports.sendReportToEmails = sendReportToEmails;
