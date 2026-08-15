const express = require("express");
const { signup, login , verifyPhone , forgotPassword , resetPassword} = require("../controllers/authController");

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

module.exports = router;