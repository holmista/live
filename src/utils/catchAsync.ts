import { Request, Response, NextFunction } from "express";

interface ControllerFunction extends Function {
  req: Request;
  res: Response;
  next?: NextFunction;
}

// eslint-disable-next-line arrow-body-style, import/prefer-default-export
export const catchAsync = async (func: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((err: Error) => next(err));
  };
};
