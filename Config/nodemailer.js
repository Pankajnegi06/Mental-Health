const nodemailer = require('nodemailer');

require('dotenv').config();

const createTransporter = (user, pass) => {
    if (!user || !pass) {
        console.warn("⚠️  SMTP credentials missing. Using mock email sender for development.");
        console.warn("📧 To enable real emails, add SMTP_USER and SMTP_PASS to your .env file");
        return {
            sendMail: async (mailOptions) => {
                console.log("\n📨 [MOCK EMAIL] Would send email:");
                console.log("  To:", mailOptions.to);
                console.log("  Subject:", mailOptions.subject);
                console.log("  From:", mailOptions.from);
                if (mailOptions.text) {
                    console.log("  Text:", mailOptions.text.substring(0, 100) + "...");
                }
                console.log("✅ Mock email sent successfully\n");
                return { messageId: 'mock-' + Date.now() };
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