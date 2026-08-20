const transporter = require("../config/mail");

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"CampusOne Administration" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
        });

        return true;
    } catch (error) {
        console.error("Email Send Error:", error);
        throw error;
    }
};

module.exports = sendEmail;