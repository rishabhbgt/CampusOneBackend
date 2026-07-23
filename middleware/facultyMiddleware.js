const facultyMiddleware = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    if (req.user.role !== "faculty") {
        return res.status(403).json({
            message: "Faculty access required",
        });
    }

    next();
};

module.exports = facultyMiddleware;