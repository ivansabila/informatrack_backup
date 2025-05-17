import express from "express";
import ScheduleController from "../controllers/ScheduleController.js";

const router = express.Router();

router.get("/", ScheduleController.index);
router.get("/search", ScheduleController.searchData);
router.get("/add", ScheduleController.addSearch);
router.get("/:uid", ScheduleController.detail);
router.get("/add/search", ScheduleController.searchStudent);
router.get("/add/:uid", ScheduleController.add);
router.post("/add/:uid", ScheduleController.store);

export default router;
