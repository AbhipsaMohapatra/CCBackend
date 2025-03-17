// dotenv.config();
// const dotenv = require('dotenv');
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
// const chats = require('./data/data');
const cors = require("cors");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("NODE_ENV:", process.env.NODE_ENV);

const app = express();
const messageRoutes = require("./routes/messageRoutes");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");


const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
connectDB();
app.use(express.json());
const axios = require("axios");

// app.use(cors());
app.use(
  cors({
    origin: ["https://ccfrontend.onrender.com"], // Allow frontend port
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
// app.use(express.json());
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/", (req, res) => {
  res.send("API has started");
});
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);



app.use(notFound);
app.use(errorHandler);
// const server = app.listen(PORT,"localhost",console.log(`server started on port ${PORT}`));
const server = app.listen(PORT, () =>
  console.log(`server started on port ${PORT}`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://ccfrontend.onrender.com", // Fix CORS issue
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("connected to socket io");

  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    socket.userId = userData._id;
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      return console.log("chat users is not defined");
    }
    chat.users.forEach((user) => {
      if (user?._id == newMessageReceived.sender?._id) {
        return;
      }
      socket.in(user?._id).emit("message received", newMessageReceived);
    });
  });

  // socket.off("setup",()=>{
  //     console.log("User Disconnected");
  //     socket.leave(userData._id);
  // })
  // let currentRoom = null;
  // let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    console.log(`Join event received from ${userName} for room ${roomId}`);
    console.log("Current rooms state before join:", rooms);
    // socket.currentRoom = null; // Initialize to prevent accidental errors
    // socket.userId = null;

    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      rooms.get(socket.currentRoom)?.delete(socket.currentUser);
      io.to(socket.currentRoom).emit("UserJoined", Array.from(rooms.get(socket.currentRoom)));
    }
    socket.currentRoom = roomId;
    socket.currentUser = userName;

    socket.userId = userName;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(userName);
    console.log(
      `User ${userName} joined room ${roomId}. Users now:`,
      Array.from(rooms.get(roomId))
    );
    console.log("Current rooms state before join:", rooms);

    io.to(roomId).emit("UserJoined", Array.from(rooms.get(roomId)));
    // console.log("user Joined room for Code",roomId);

    // ✅ Emit 'joinSuccess' to inform the frontend that the join is complete
    socket.emit("joinSuccess");

    socket.on("getUsers", (roomId) => {
      if (rooms.has(roomId)) {
        const users = Array.from(rooms.get(roomId));
        console.log("🔄 getUsers called, sending:", users);
        // socket.emit("UserJoined", users);
          io.to(roomId).emit("UserJoined", users); // Send the list to the requesting user
      }
    });

    socket.on("codeChange", ({ roomId, code }) => {
      socket.to(roomId).emit("codeUpdate", code);
    });

    socket.on("userLeft", ({ roomId, userName ,manual}) => {
      // socket.to(roomId).emit("userLeft", userName);
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(userName);
        
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId); // Remove empty room
        } else {
          io.to(roomId).emit("UserJoined", Array.from(rooms.get(roomId)));
        }
      }
      socket.to(roomId).emit("userLeft", {userName,manual});
    });

    socket.on("typing", ({ roomId, userName }) => {
      socket.to(roomId).emit("userTyping", userName);
    });

    socket.on("languageChange", ({ roomId, language }) => {
      socket.to(roomId).emit("languageUpdate", language);
    });

    socket.on("compileCode", async ({ code, roomId, language, version }) => {
      if (rooms.has(roomId)) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 sec before calling API
          const response = await axios.post(
            "https://emkc.org/api/v2/piston/execute",
            {
              language,
              version,
              files: [{ content: code }],
            }
          );

          const room = rooms.get(roomId);
          room.output = response.data.run.output; // ✅ Store last output

          io.to(roomId).emit("codeResponse", response.data);
        } catch (error) {
          console.error("Error compiling code:", error.message);
          socket.emit("codeResponse", {
            error: "Compilation failed. Try again.",
          });
        }
      }
    });
  });

 

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.userId);

    

    if (socket.currentRoom && rooms.has(socket.currentRoom)) {
      const users = rooms.get(socket.currentRoom);
      
      // Remove the user from the room
      users.delete(socket.currentUser);

      console.log(`📢 Updated Users List After Disconnect:`, Array.from(users));

      // Manually call userLeft event with correct parameters
      io.to(socket.currentRoom).emit("userLeft", { 
          roomId: socket.currentRoom, 
          userName: socket.currentUser 
      });

      // Notify remaining users
      io.to(socket.currentRoom).emit("UserJoined", Array.from(users)); 

      // Delete the room if empty
      if (users.size === 0) {
          rooms.delete(socket.currentRoom);
      }
  }


    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
  }

    if (socket.userId) {
      socket.leave(socket.userId); // Leave the room properly
    }
  });
});
