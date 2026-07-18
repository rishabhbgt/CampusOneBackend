require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});


const users = {};

app.set("io", io);
app.set("users", users);

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("register", (userId) => {

        users[userId] = socket.id;

        console.log("Registered:", userId);

    });

    socket.on("disconnect", () => {

        for (const userId in users) {

            if (users[userId] === socket.id) {

                delete users[userId];
                break;

            }

        }

        console.log("User Disconnected:", socket.id);

    });

});


app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB();

app.get("/", (req, res) => {
    res.send("Welcome to CampusOne API 🚀");
});

app.get("/api/profile", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Welcome to your profile",
        user: req.user,
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/complaints", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, req, res, next) => {
    console.log("========= MULTER ERROR =========");
    console.dir(err, { depth: null });

    res.status(500).json({
        message: err.message,
        error: err,
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});