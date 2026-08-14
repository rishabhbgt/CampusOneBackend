const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader =
            req.header("Authorization");

        if (!authHeader) {

            return res.status(401).json({
                message:
                    "Access Denied. No Token Provided.",
            });

        }

        const token =
            authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : authHeader;


        if (!token) {

            return res.status(401).json({
                message:
                    "Access Denied. Invalid Token.",
            });

        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();

    } catch (error) {

        console.error(
            "Auth Middleware Error:",
            error.message
        );


        return res.status(401).json({
            message:
                "Invalid or expired token",
        });

    }

};

module.exports = authMiddleware;