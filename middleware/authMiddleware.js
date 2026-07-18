const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
    // Token lena
    const token = req.header("Authorization");

    console.log("Received Token:", token);

    if (!token) {
        return res.status(401).json({
        message: "Access Denied. No Token Provided.",
        });
    }

    // Token verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User ki info request me store karna
    req.user = decoded;

    // Next middleware/controller
    next();
    } catch (error) {
        console.log(error.message);
    return res.status(401).json({
        message: "Invalid Token",
        });
    }
};

module.exports = authMiddleware;