import { Request } from "express";

export interface myReq extends Request {
  user: {
    id: number;
    email: string;
  };
}

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
