import { NextFunction, Request, Response } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { promisify } from "util";
import { myReq } from "../utils/generalTypes";
import client from "../dbClient";
import sendMail from "../utils/sendEmail";

const RandomBytes = promisify(crypto.randomBytes);

export const validateBody = async (req: Request, next: NextFunction) => {
  if (!req.body.email || !req.body.password) {
    next("insufficient information");
  }
  next();
};

export const signup = async (req: Request, res: Response) => {
  const password = await bcrypt.hash(req.body.password, 10);
  await client.user.create({
    data: {
      email: req.body.email,
      password,
    },
  });
  res.status(201).json({
    message: "success",
  });
};

export const login = async (req: Request, res: Response) => {
  const user = await client.user.findUnique({
    where: {
      email: req.body.email,
    },
  });
  if (!user) throw new Error("incorrect email or password");
  const valid = await bcrypt.compare(req.body.email, user.email);
  if (!valid) throw new Error("incorrect email or password");
  const token = jwt.sign(
    { id: user.id.toString() },
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: "7d",
    }
  );
  res.status(201).json({
    message: "success",
    token,
  });
};

export const verify = async (req: myReq, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) throw new Error("unauthorized");
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as Secret
  ) as JwtPayload;
  const user = await client.user.findUnique({
    where: {
      id: decoded.id,
    },
    select: {
      id: true,
      email: true,
    },
  });
  if (!user) next(new Error("invalid user"));
  // ts did not understand without else that user can not be null at this point
  else {
    req.user = user;
    next();
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const user = await client.user.findUnique({
    where: {
      email: req.body.email,
    },
  });
  if (!user) throw new Error("incorrect email");
  let reset: string | Buffer = await RandomBytes(32);
  reset = reset.toString();
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(reset)
    .digest("hex");
  const updatedUser = await client.user.update({
    where: {
      email: user.email,
    },
    data: {
      passwordResetToken,
      passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    select: {
      email: true,
      passwordResetToken: true,
    },
  });
  const sent = await sendMail({
    from: "mishadaro21@gmail.com",
    to: updatedUser.email,
    subject: "reset password",
    text: `send patch request here, mf http://localhost:3000/auth/reset/${updatedUser.passwordResetToken}`,
  });
  if (sent === "success") {
    return res.status(200).json({
      message: "success",
    });
  }
  return res.status(500).json({
    message: "fail",
  });
};
