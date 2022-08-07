import Router from "express";
import { createMessage, deleteMessage } from "../controllers/messageController";

const router = Router();

router.post("/", createMessage);
router.delete("/:id", deleteMessage);

export default router;
