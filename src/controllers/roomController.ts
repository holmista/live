import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import client from "../dbClient";
import { AppError } from "../utils/generalTypes";

export const getRoom = async (req:Request, res:Response) => {
  try {
    const { id } = req.params;
    const room = await client.room.findUnique({
      where: { id: Number(id) }
    });
    if (!room) throw new AppError("room not found", 404);
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    res.status(statusCode).json({
      status: "fail",
      message: "could not get a room"
    });
  }
};

export const getRooms = async (req:Request, res:Response) => {
  try {
    const rooms = await client.room.findMany();
    res.status(200).json({
      status: "success",
      data: rooms
    });
  } catch {
    res.status(500).json({
      status: "fail",
      message: "unknown errow"
    });
  }
};

export const createRoom = async (req:Request, res:Response) => {
  try {
    const room = await client.room.create({
      data: {
        name: req.body.name
      }
    });
    res.status(200).json({
      status: "success",
      data: room
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        res.status(422).json({
          status: "fail",
          mesage: "the name already exists"
        });
      }
    }
    res.status(500).json({
      status: "fail",
      message: "unknown errow"
    });
  }
};

export const deleteRoom = async (req:Request, res:Response) => {
  try {
    const { id } = req.params;
    await client.room.delete({
      where: {
        id: Number(id)
      }
    });
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2001") {
        res.status(422).json({
          status: "fail",
          message: "invalid room"
        });
      }
    }
    res.status(500).json({
      status: "fail",
      message: "unknown errow"
    });
  }
};
