import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoute from "./routes/authRoute";
import roomRouter from "./routes/roomRoute";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("new connection!");
});
app.use(cors());
app.use(express.json());

app.use("/api/room", roomRouter);

app.use("/api/auth", authRoute);

app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "undefined route",
  });
});

const port = process.env.PORT || 5000;
httpServer.listen(port, () => `listening on port ${port}`);
// app.listen(port, () => `listening on port ${port}`);
