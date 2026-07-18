const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
        folder: "CampusOne",
        format: "png",
        public_id: Date.now() + "-" + file.originalname,
    }),
});

module.exports = multer({ storage });