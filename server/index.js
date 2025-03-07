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

dotenv.config(); // Ensure this is called before using process.env

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");

console.log("MONGO_URI from env:", process.env.MONGO_URI);

/**
 * Establishes a connection to the MongoDB database.
 */
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.info(
      `[${new Date().toISOString()}] Server is connected to Database`
    );
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Server is NOT connected to Database: ${
        err.message
      }`
    );
  }
};
connectDb();

app.get("/", (req, res) => {
  console.log(
    `[${new Date().toISOString()}] Someone pinged the server from ${req.ip}`
  );
  res.send({
    message: "API is running",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.info(
    `[${new Date().toISOString()}] Server is running on port ${PORT}`
  );
});

io.on("connection", (socket) => {
  console.info(
    `[${new Date().toISOString()}] [SOCKET CONNECTED] ID: ${socket.id}`
  );

  socket.on("setup", (user) => {
    socket.join(user._id);
    console.info(`[${new Date().toISOString()}] [USER JOINED] ID: ${user._id}`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.info(
      `[${new Date().toISOString()}] [USER JOINED CHAT] ID: ${room}`
    );
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // Handle new message
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) {
      console.error(
        `[${new Date().toISOString()}] [ERROR] chat.users not defined`
      );
      return;
    }

    // Emit the message to all users in the chat, including the sender
    chat.users.forEach((user) => {
      socket.to(user._id).emit("message received", newMessageReceived); // Send to other users
      socket.emit("message received", newMessageReceived); // Send to the sender

      console.info(
        `[${new Date().toISOString()}] [MESSAGE SENT] Chat ID: ${
          chat._id
        }, Sender: ${newMessageReceived.sender._id}, Receiver: ${user._id}`
      );
    });
  });

  socket.on("disconnect", () => {
    console.info(
      `[${new Date().toISOString()}] [SOCKET DISCONNECTED] ID: ${socket.id}`
    );
    socket.leave(socket.id);
  });
});
