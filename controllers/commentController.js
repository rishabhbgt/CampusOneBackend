const Comment = require("../models/Comment");

const addComment = async (req, res) => {
    try {

        console.log("BODY:", req.body);
        console.log("PARAM ID:", req.params.id);
        console.log("USER:", req.user);

        const { message } = req.body;

        const comment = await Comment.create({
            complaint: req.params.id,
            user: req.user.id,
            message,
        });

        console.log("Saved Comment:", comment);

        res.status(201).json({
            message: "Comment Added Successfully",
            comment,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({
            complaint: req.params.id,
        })
            .populate("user", "fullName role")
            .sort({ createdAt: 1 });

        res.status(200).json({
            comments,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    addComment,
    getComments,
};