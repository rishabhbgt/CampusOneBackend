const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllUsers,
    blockUser,
    unblockUser,
    deleteUser,
    changeRole,
} = require("../controllers/userController");

router.get("/", authMiddleware, adminMiddleware, getAllUsers);

router.put("/block/:id", authMiddleware, adminMiddleware, blockUser);

router.put("/unblock/:id", authMiddleware, adminMiddleware, unblockUser);

router.put("/role/:id", authMiddleware, adminMiddleware, changeRole);

router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;