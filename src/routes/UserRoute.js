import express from "express";
import UserController from "../controllers/UserController.js";

const router = express.Router();

router.get("/", UserController.index);
router.get("/unapproved", UserController.unapproved);
router.get("/search", UserController.searchData);
router.get("/student/add", UserController.userAddStudent);
router.post("/student/add", UserController.addStudent);
router.get("/lecturer/add", UserController.userAddLecturer);
router.post("/lecturer/add", UserController.addLecturer);
router.get("/unapproved/search", UserController.searchDataUnapproved);
router.get("/edit/:uid", UserController.edit);
router.post("/edit/:uid", UserController.modify);
router.post("/unapproved/accept/:uid", UserController.acceptUser);
router.post("/unapproved/reject/:uid", UserController.rejectUser);

export default router;
