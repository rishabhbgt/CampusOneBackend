const express = require("express");
const { signup, login , verifyPhone , forgotPassword , resetPassword , forgotPasswordByPhone , verifyPasswordResetOtp , resetPasswordByPhone} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-phone" , verifyPhone);
router.post(
    "/forgot-password",
    forgotPassword
);

router.put(
    "/reset-password/:token",
    resetPassword
);

router.post(
    "/forgot-password-phone",
    forgotPasswordByPhone
);

router.post(
    "/verify-password-reset-otp",
    verifyPasswordResetOtp
);

router.put(
    "/reset-password-phone",
    resetPasswordByPhone
);

module.exports = router;