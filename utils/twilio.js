const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const sendVerificationCode = async (phone) => {

    return client.verify.v2
        .services(
            process.env.TWILIO_VERIFY_SERVICE_SID
        )
        .verifications
        .create({
            to: phone,
            channel: "sms",
        });

};

const checkVerificationCode = async (
    phone,
    code
) => {

    return client.verify.v2
        .services(
            process.env.TWILIO_VERIFY_SERVICE_SID
        )
        .verificationChecks
        .create({
            to: phone,
            code,
        });

};

module.exports = {
    sendVerificationCode,
    checkVerificationCode,
};