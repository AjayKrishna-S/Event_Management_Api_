const nodemailer = require('nodemailer');
require('dotenv').config();
const ejs = require('ejs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTicketEmail = async (to, userName, event, ticket) => {
  const templatePath = path.join(__dirname, '../view/ticket.ejs');
  const html = await ejs.renderFile(templatePath, { userName, event, ticket });

  const from = process.env.EMAIL_USER
  const mailOptions = {
    from,
    to,
    subject: `🎉 Your Ticket for ${event.title}`,
    html,
  };
  
  return await transporter.sendMail(mailOptions);
};

module.exports = { sendTicketEmail };
