function htmlForMessage(containerId, containerName, imageName, status, timeWhenChange) {
  return (
    '' +
    '    <body yahoo bgcolor="#f6f8f1" style="margin: 0; padding: 0; min-width: 100%; background-color: #f6f8f1;">' +
    '<table class="content" align="center" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px;">' +
    '<!--Header-->' +
    '                        <tr>                         ' +
    '                             <td bgcolor="#c7d8a7" style="padding: 40px 30px 20px 30px;">' +
    '           ' +
    ' <table class="col425" align="left" border="0" cellpadding="0" style="width: 100%; max-width: 400px;">' +
    '<tr>' +
    '<td height="70">' +
    '<table width="100%" border="0" cellspacing="0">' +
    '<tr>' +
    '<td style="padding: 0 0 0 3px; font-size: 20px; color: #ffffff; font-family: sans-serif; letter-spacing: 5px; font-weight: bold;">' +
    `${containerName}(id:${containerId})` +
    '</td>' +
    '</tr>' +
    '<tr>' +
    '<td class="h1" style="padding: 5px 0 0 0; font-size: 33px; line-height: 38px; font-weight: bold; color: #153643; font-family: sans-serif;">' +
    `Moved to status ${status}` +
    '</td>' +
    '</tr>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    '' +
    '<!--ТЕЛО ПИСЬМА-->' +
    '<tr>' +
    '<td class="content" bgcolor="#ffffff" style="width: 100%; max-width: 600px; padding: 30px 30px 30px 30px; border-bottom: 1px solid #f2eeed;">' +
    '  ' +
    '  <table width="100%" border="0" cellspacing="0" cellpadding="0">' +
    '' +
    '<!--ВСТУПЛЕНИЕ-->' +
    '<tr>' +
    '<td style="color: #153643; font-family: sans-serif; padding: 0 0 15px 0; font-size: 24px; line-height: 28px; font-weight: bold;">' +
    '' +
    ' Dear recipient, please note! ' +
    ' ' +
    '</td>' +
    '</tr><!--/ВСТУПЛЕНИЕ-->' +
    '' +
    '' +
    '<!--НАЧАЛО-->' +
    '<tr>' +
    '<td style="color: #153643; font-family: sans-serif; font-size: 16px; line-height: 22px;">' +
    `   <p>Image name: ${imageName}</p>` +
    `    <p>Status time: ${timeWhenChange.toString()}</p>` +
    '  ' +
    '</td>' +
    '</tr><!--/НАЧАЛО-->' +
    '' +
    '' +
    '<!--ОКОНЧАНИЕ ПИСЬМА-->' +
    '<tr>' +
    '<td style="color: #153643; font-family: sans-serif; font-size: 16px; line-height: 22px;">' +
    '   <p>Best regards, <br />' +
    '   <strong>MonitorVA</strong></p>' +
    '</td>' +
    '</tr><!--/ОКОНЧАНИЕ ПИСЬМА-->' +
    '' +
    '</table>' +
    '                            </td>' +
    ' </tr>' +
    '<!--Footer-->' +
    '         <tr>' +
    ' <td class="footer" bgcolor="#44525f" style="padding: 20px 30px 15px 30px;">' +
    '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
    '<tr>' +
    '<td align="center" style="font-family: sans-serif; font-size: 14px; color: #ffffff;">' +
    '&reg;All rights reserved<br/>' +
    '<a  style="color: #ffffff;">MonitorVA</a>' +
    '</td>' +
    '</tr>' +
    '</table>' +
    '</td>' +
    '</tr>' +
    '' +
    '    </body>'
  );
  // return `
  //     <p>${containerId}</p>
  //     <p>Moved to status ${status}</p>
  // `
}

module.exports.htmlForMessage = htmlForMessage;
