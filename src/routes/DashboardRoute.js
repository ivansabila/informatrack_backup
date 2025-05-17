import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import DashboardController from "../controllers/DashboardController.js";

const router = express.Router();

router.use(isAuthenticated);
router.get("/", DashboardController.index);
router.get("/logout", DashboardController.logout);

export default router;