const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use(
  cors({
    origin: "*",
  })
);
dotenv.config();

app.use(express.json());

const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");

/**
 * Establishes a connection to the MongoDB database.
 * The MONGO_URI environment variable must be set to the URI of the MongoDB database.
 * If the connection is successful, logs a message to the console indicating that the server is connected to the database.
 * If the connection fails, logs an error message to the console indicating that the server is NOT connected to the database.
 */
const connectDb = async () => {
  try {
    //connectMongoDb('mongodb://127.0.0.1:27017/chat-app')
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log("Server is Connected to Database");
  } catch (err) {
    console.log("Server is NOT connected to Database", err.message);
  }
};
connectDb();

app.get("/", (req, res) => {
  res.send("API is running123");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (user) => {
    socket.join(user._id);
    console.log("User Joined: " + user._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // Handle new message
  // Handle new message
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    // Emit the message to all users in the chat, including the sender
    chat.users.forEach((user) => {
      // Emit to all users in the chat room, including the sender
      socket.to(user._id).emit("message received", newMessageReceived); // Use socket.to for the other users
      socket.emit("message received", newMessageReceived); // Emit to the sender
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    socket.leave(socket.id);
  });
});
