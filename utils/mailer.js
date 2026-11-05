// utils/mailer.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // OAuth2 Transporter Setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN
            }
        });

        const mailOptions = {
            from: `"My Bank API" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        // Send Email
        await transporter.sendMail(mailOptions);
        console.log(`[INFO] OAuth2 Email successfully sent to ${options.email}`);

    } catch (error) {
        console.error(`[ERROR] OAuth2 Email bhejne mein dikkat aayi:`, error.message);
    }
};

module.exports = sendEmail;