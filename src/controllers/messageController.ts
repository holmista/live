import { Request, Response } from "express";
import client from "../dbClient";

// eslint-disable-next-line import/prefer-default-export
export const createMessage = async (req:Request, res:Response) => {
  try {
    const message = await client.message.create({
      data: {
        body: req.body.message,
        authorId: req.body.author,
        roomId: req.body.author
      }
    });
    res.status(200).json({
      status: "success",
      data: message
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "unknown errow"
    });
  }
};

export const deleteMessage = async (req:Request, res:Response) => {
  try {
    await client.message.delete({
      where: {
        id: Number(req.params.id)
      }
    });
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "unknown errow"
    });
  }
};
