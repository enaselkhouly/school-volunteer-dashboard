"use-strict";

const config      = require("../../configs");
const nodemailer 	= require("nodemailer");
const htmlToText 	= require("nodemailer-html-to-text").htmlToText;

function init(callback) {
  // // Generate SMTP service account from ethereal.email
  // nodemailer.createTestAccount((err, account) => {
  //   if (err) {
  //       console.error('Failed to create a testing account. ' + err.message);
  //       return process.exit(1);
  //   }
  //
  //   console.log('Email credentials obtained ...');
  //   return callback(err, account);
  // });
}

function sendTaskStatusNotification ( sendTo, msg ) {

  let subject = `Volunteer Task Status Update!`;

  let html = fillHTML(subject, msg); // html body

  send(sendTo, subject, html, function(err) {

    if (err) {
      console.log(err.message);
    }
  });
}

function sendAccountNotification ( sendTo, username, password, appurl ) {

  let subject = `Welcome to the School Volunteer Dashboard!`;

  let msg = `<p style="text-align: left; font-size:21px;text-color:#000000">We are so excited to announce that the School Volunteer Dashboard is up and running, an application to help parents, PTA, and teachers communicate volunteer work easily. <br><br>Your login details are:<br> - Username: ${username} <br> - Password: ${password}<br><br>You can access the school volunteer dashboard at ${appurl}/login</p>`;
  let html = fillHTML(subject, msg); // html body

  send(sendTo, subject, html, function(err) {

    if (err) {
      console.log(err.message);
    }
  });
}

function sendPasswordResetNotification ( sendTo, username, password, appurl ) {

  let subject = `Password Reset Notification`;

  let msg = `<p style="text-align: left; font-size:21px;text-color:#000000">This is to inform you that your login credential for the Volunteer Dashboard has changed. <br><br>Your login details are:<br> - Username: ${username} <br> - Password: ${password}<br><br>You can access the school volunteer dashboard at ${appurl}</p>`;
  let html = fillHTML(subject, msg); // html body

  send(sendTo, subject, html, function(err) {

    if (err) {
      console.log(err.message);
    }
  });
}

function send(recipients, subject, body, callback) {

  const mailOptions = {
    from: `<${config.mailer.smtp.auth.user}>`,
    to: recipients,
    subject: subject,
    html: body
  };

  const transporter = nodemailer.createTransport(config.mailer.smtp);

    if (transporter) {
      // verify connection configuration
      transporter.verify( (err) => {
         if (err) {
           console.log('Error verify', err);
           return callback(err, null);
         } else {
           transporter.use("compile", htmlToText());
           transporter.sendMail(mailOptions, (err, info) => {
             if (err) {
               console.log(err);
               return callback(err, null);
             } else {
               return callback(null, info);
             }
           });
         }
      });
    }
    else {
      return callback (new Error("Unable to send email! Invalid mailer transport"), null);
    }
}

function fillHTML (subject, msg) {
return  `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title></title>

    <style type="text/css">

      #outlook a { padding:0; }
      body{ width:100% !important; -webkit-text; size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; }
      .ReadMsgBody { width: 100%; }
      .ExternalClass {width:100%;}
      .backgroundTable {margin:0 auto; padding:0; width:100%;!important;}
      table {border-collapse: collapse;}
      .ExternalClass * {line-height: 115%;}
    </style>
</head>
<body bgcolor="#f3f4f6" style="width:100% !important;size-adjust:100%;-ms-text-size-adjust:100%;margin-top:0 !important;margin-bottom:0 !important;margin-right:0 !important;margin-left:0 !important;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
    <center bgcolor="#f3f4f6" class="wrapper" style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;" >
      <table width="100%">
        <tr>
          <td bgcolor="#f3f4f6">
            <div class="webkit" style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >
              <table width="600" align="center" style="border-collapse:collapse;border-spacing:0;font-family:sans-serif;color:#333333;" >
              <tr>
              <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
              <table class="outer" align="center" style="border-collapse:collapse;border-spacing:0;font-family:sans-serif;color:#333333;Margin:0 auto;width:100%;max-width:600px;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;" >
                <tr>
                  <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
                    <table width="100%" style="border-collapse:collapse;border-spacing:0;font-family:sans-serif;color:#333333;" >
                      <tr>
                        <td bgcolor="#89c639" class="p30 align-center" style="padding-top:30px;padding-bottom:30px;padding-right:20px;padding-left:20px;text-align:center;" >
                          <p class="heading" style="Margin:0;font-size:30px;color:#ffffff;Margin-bottom:0px;" >${subject}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr> <!-- One column -->
                <!-- // Begin Module: One column - text only  -->
                <tr>
                  <td bgcolor="#ffffff" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;" >
                    <table width="100%" style="border-collapse:collapse;border-spacing:0;font-family:sans-serif;color:#333333;" >
                      <tr>
                        <td style="padding-top:60px;padding-bottom:60px;padding-right:60px;padding-left:60px;text-align:center; text-color:#000000" >
                          ${msg}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr> <!-- One column -->
                <tr>
                  <td style="padding-top:30px;padding-bottom:30px;padding-right:30px;padding-left:60px;text-align:center;">
                    <p style="font-size:12px">Volunteer Dashboard | All rights reserved &copy; EnasElkhouly.com</p>
                  </td>
                </tr> <!-- footer -->
              </table> <!-- Outer table-->
              </td>
              </tr>
              </table>
            </div> <!-- Webkit -->
          </td>
        </tr>
      </table>
    </center>
</body>
</html>
`
}
module.exports = {
  init: init,
	send: send,
  sendTaskStatusNotification: sendTaskStatusNotification,
  sendAccountNotification: sendAccountNotification,
  sendPasswordResetNotification: sendPasswordResetNotification
};
