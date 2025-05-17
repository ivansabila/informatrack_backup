import express from "express";
import ActivityController from "../controllers/ActivityController.js";

const router = express.Router();

router.get("/", ActivityController.index);
router.get("/search", ActivityController.searchData);
router.get("/unapproved", ActivityController.unapproved);
router.get("/:uid", ActivityController.detailActivity);
router.post("/:uid", ActivityController.pushNotification);
router.get("/unapproved/search", ActivityController.searchDataUnapproved);
router.get("/unapproved/:uid", ActivityController.detail);
router.post("/unapproved/:uid", ActivityController.detailSubmit);
router.get("/unapproved/mentor/:uid", ActivityController.mentor);
router.post("/unapproved/mentor/:uid", ActivityController.mentorSubmit);

export default router;