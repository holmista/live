import { NextFunction, Request, Response } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { promisify } from "util";
import { myReq, AppError } from "../utils/generalTypes";
import client from "../dbClient";
import sendMail from "../utils/sendEmail";
// import { catchAsync } from "../utils/catchAsync";

const RandomBytes = promisify(crypto.randomBytes);

export const validateBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.email || !req.body.password) {
    next(new AppError("insufficient information", 422));
  }
  next();
};

export const getUsers = async (req: Request, res: Response) => {
  const users = await client.user.findMany();
  res.json(users);
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (err: any) {
    next(new AppError("could not sign up", 400));
  }
};

export const login = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const user = await client.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (!user) throw new AppError("incorrect email or password", 404);
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) throw new AppError("incorrect email or password", 401);
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
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 400));
  }
};

export const verify = async (req: myReq, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) throw new AppError("unauthorized", 401);
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
  if (!user) next(new AppError("invalid user", 404));
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
  if (!user) throw new AppError("incorrect email", 404);
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
