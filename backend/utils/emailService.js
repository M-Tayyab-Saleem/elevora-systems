const nodemailer = require('nodemailer');
require('dotenv').config();

// Initialize Nodemailer Transport for Brevo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    // We fall back to GMAIL variables if SMTP variables are not explicitly set
    user: process.env.SMTP_USER || process.env.GMAIL,
    pass: process.env.SMTP_PASSWORD || process.env.GMAIL_PASSWORD,
  },
});

const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL_ADDRESS || 'tsaleem@abidisolutions.com',
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };


    const info = await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail; 