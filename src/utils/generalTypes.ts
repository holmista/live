import { Request } from "express";

export interface myReq extends Request {
  user: {
    id: number;
    email: string;
  };
}
