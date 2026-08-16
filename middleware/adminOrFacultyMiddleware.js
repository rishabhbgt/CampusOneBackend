const adminOrFacultyMiddleware = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    if (
        req.user.role !== "admin" &&
        req.user.role !== "faculty"
    ) {
        return res.status(403).json({
            message: "Admin or Faculty access required",
        });
    }

    next();
};

module.exports = adminOrFacultyMiddleware;