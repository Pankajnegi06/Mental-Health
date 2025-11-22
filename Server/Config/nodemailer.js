const nodemailer = require('nodemailer');

require('dotenv').config();

const createTransporter = (user, pass) => {
    if (!user || !pass) {
        console.warn("SMTP credentials missing. Email sending will be disabled.");
        return {
            sendMail: async () => {
                console.warn("Mock sending email (credentials missing)");
                return true;
            }
        };
    }
    return nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: { user, pass }
    });
};

const transporter = createTransporter(process.env.SMTP_USER, process.env.SMTP_PASS);
const transporter2 = createTransporter(process.env.SMTP_USER2, process.env.SMTP_PASS2);

module.exports = {transporter,transporter2};