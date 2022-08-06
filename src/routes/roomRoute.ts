import { Router } from "express";
import {
  getRoom, getRooms, createRoom, deleteRoom
} from "../controllers/roomController";

const router = Router();

router.get("/", getRooms);
router.get("/:id", getRoom);
router.post("/", createRoom);
router.delete("/:id", deleteRoom);

export default router;
