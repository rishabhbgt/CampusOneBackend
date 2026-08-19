const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "CampusOne/complaints",
        resource_type: "image",
        public_id: `${Date.now()}-${file.originalname
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9-_]/g, "-")}`,
    }),
});

const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
            new Error(
                "Only JPG, PNG and WEBP images are allowed"
            )
        );
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = upload;