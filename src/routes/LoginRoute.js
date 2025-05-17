import express from "express";
import redirectIfAuthenticated from "../middleware/redirectIfAuthenticated.js";
import LoginController from "../controllers/LoginController.js";

const router = express.Router();

router.get("/", redirectIfAuthenticated, LoginController.index);
router.post("/", LoginController.login);

export default router;
