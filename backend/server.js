const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const colors = require("colors");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST"] }));

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ------------------Deployment----------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build"))); // Correct path to the build folder

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => res.send("API is running..."));
}

// ------------------Deployment----------------------

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT}`.yellow.bold)
);

// Initialize Socket.io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: "http://localhost:3000" },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected to Socket.io");

  // Setup the socket with user ID
  socket.on("setup", (userData) => {
    socket.join(userData._id); // User joins their specific room
    socket.emit("connected");
  });

  // Join chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined Room: ${room}`);
  });

  // Leave chat room
  socket.on("leave chat", (room) => {
    socket.leave(room);
    console.log(`User left Room: ${room}`);
  });

  // Typing event: User typing in a chat
  socket.on("typing", (room) => {
    socket.to(room).emit("typing");
  });

  // Stop typing event: User stops typing
  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing");
  });

  // Message received event: Broadcast message to other users in the chat
  socket.on("new message", (newMessage) => {
    const chat = newMessage.chat;
    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.to(user._id).emit("message received", newMessage);
    });
  });

  // User disconnected event
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
