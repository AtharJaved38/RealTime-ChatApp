import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const port = 3001;
const secretKey = "abcd";

app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "Athar" }, secretKey);
  res
    .cookie("token", token, { httpOnly: false, secure: true, sameSite: "none" })
    .json({
      message: "Login Success!",
    });
});

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    
    if (err) return next(err);
    
    const token = socket.request.cookies.token;
    
    if(!token) return next(new Error("Authentication Error"));
    
    const decoded =jwt.verify(token, secretKey);

    next();
    
  });
});

io.on("connection", (socket) => {
  console.log("User Connected");
  console.log("Id", socket.id);
  socket.on("message", ({ room, message }) => {
    console.log({ room, message });
    socket.to(room).emit("recieve-message", message);
  });

  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    console.log(`User Join ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected ", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
