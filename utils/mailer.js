// utils/mailer.js

const nodemailer = require('nodemailer');
require('dotenv').config();  // Load your .env variables

//  Create transporter using explicit SMTP settings for Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // Gmail SMTP server
  port: 465,               // Secure SSL port
  secure: true,            // True for 465, false for 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSCODE,
  },
});

exports.sendOtpMail = async (to, otp) => {
  const mailOptions = {
    from: `"Dangal Analytics" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: 'Your One-Time Password (OTP) for Password Reset',
    text: `Dear User,

We received a request to reset your password for your Dangal Analytics account.

Your One-Time Password (OTP) is: ${otp}

Please enter this OTP in the password reset page to verify your identity. This OTP is valid for the next 10 minutes.

If you did not request a password reset, please ignore this email or contact our support team immediately.

Thank you,
Dangal Analytics Team`,
    html: `
      <p>Dear User,</p>
      <p>We received a request to reset your password for your <strong>Dangal Analytics</strong> account.</p>
      <p>Your One-Time Password (OTP) is:</p>
      <h2 style="color: #2e6c80;">${otp}</h2>
      <p>Please enter this OTP on the password reset page to verify your identity. This OTP is valid for the next <strong>10 minutes</strong>.</p>
      <p>Thank you,<br/>
      Dangal Analytics Team</p>
    `,
  };

  // Send the mail
  const info = await transporter.sendMail(mailOptions);
  console.log(' Email sent:', info.response);
};
