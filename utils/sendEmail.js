const { Resend } = require("resend");

const resend = new Resend(
    process.env.RESEND_API_KEY
);

const sendEmail = async (to, subject, html) => {
    try {
        const { data, error } =
            await resend.emails.send({
                from: "CampusOne <onboarding@resend.dev>",
                to,
                subject,
                html,
            });

        if (error) {
            throw new Error(
                error.message ||
                "Email could not be sent"
            );
        }

        return data;
    } catch (error) {
        console.error(
            "Email Send Error:",
            error
        );

        throw error;
    }
};

module.exports = sendEmail;