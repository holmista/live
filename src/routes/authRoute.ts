import Router from "express";
import {
  signup,
  login,
  forgotPassword,
  validateBody,
  getUsers,
} from "../controllers/authController";

const router = Router();

router.get("/users", getUsers);
router.post("/signup", validateBody, signup);
router.post("/login", validateBody, login);
router.post("/forgotPassword", forgotPassword);

export default router;
