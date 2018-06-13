"use-strict";

let config      = require("../../configs");
let nodemailer 	= require("nodemailer");
let htmlToText 	= require("nodemailer-html-to-text").htmlToText;

function init(callback) {
  // Generate SMTP service account from ethereal.email
  nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Email credentials obtained ...');
    return callback(err, account);
  });
}

function send(recipients, subject, body, callback) {

    let mailOptions = {
      from: config.mailer.from,
      to: recipients,
      subject: subject,
      html: body
    };

    let transporter = nodemailer.createTransport(config.mailer.smtp);

    if (transporter) {
      // verify connection configuration
      transporter.verify(function(err, success) {
         if (err) {
           console.log('Error verify', err);
           return callback(err, null);
         } else {
           console.log('success verify');
           transporter.use("compile", htmlToText());
           transporter.sendMail(mailOptions, (err, info) => {
             if (err) {
               console.log(err);
               return callback(err, null);
             } else {
               console.log(info);
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

module.exports = {
	send: send
};
