import express, { NextFunction, Request, Response } from "express";
import authRoute from "./routes/authRoute";
import { AppError } from "./utils/generalTypes";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoute);

app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "undefined route",
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => `listening on port ${port}`);
