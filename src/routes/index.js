import express from "express";
import DashboardRoute from "./DashboardRoute.js";
import UserRoute from "./UserRoute.js";
import ActivityRoute from "./ActivityRoute.js";
import ScheduleRoute from "./ScheduleRoute.js";
import LoginRoute from "./LoginRoute.js";

const router = express.Router();

router.use("/login", LoginRoute);
router.use("/", DashboardRoute);
router.use("/users", UserRoute);
router.use("/activity", ActivityRoute);
router.use("/schedule", ScheduleRoute);

export default router;
