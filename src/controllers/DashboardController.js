import User from "../models/User.js";
import Thesis from "../models/Thesis.js";
import Schedule from "../models/Schedule.js";

import dayjs from "dayjs";
import session from "express-session";

class DashboardController {
    static async index(req, res) {
        const users = await User.index();
        const thesis = await Thesis.index();
        const schedule = await Schedule.index();

        const countUnapprovedUsers = Object.entries(users).filter(([uid, user]) => {
            return user.isApproved == false;
        }).length;

        const countAllUsers = Object.entries(users).filter(([uid, user]) => {
            return user.isApproved == true;
        }).length;

        const countThesisSubmission = Object.entries(thesis).filter(([uid, thesis]) => {
            return thesis.isApproved == false;
        }).length;

        const countAllThesis = Object.entries(thesis).filter(([uid, thesis]) => {
            return thesis.status !== "under review";
        }).length;

        const countSchedule = Object.entries(schedule).length;

        const countAllStudent = Object.entries(thesis).filter(([uid, thesis]) => {
            return thesis.status !== "under review" && thesis.isApproved === true;
        }).length;

        const oneMonthAgo = dayjs().subtract(1, "month");

        const countProposal = Object.entries(schedule).filter(([uid, schedule]) => {
            const scheduleDate = dayjs(schedule.date);
            return scheduleDate.isAfter(oneMonthAgo) && schedule.jenisUjian === "proposal";
        }).length;
        
        const countHasil = Object.entries(schedule).filter(([uid, schedule]) => {
            const scheduleDate = dayjs(schedule.date);
            return scheduleDate.isAfter(oneMonthAgo) && schedule.jenisUjian === "hasil";
        }).length;

        const countTutup = Object.entries(schedule).filter(([uid, schedule]) => {
            const scheduleDate = dayjs(schedule.date);
            return scheduleDate.isAfter(oneMonthAgo) && schedule.jenisUjian === "tutup";
        }).length;
        
        const percentageProposal = Math.floor((countProposal / countSchedule) * 100);
        const percentageHasil = Math.floor((countHasil / countSchedule) * 100);
        const percentageTutup = Math.floor((countTutup / countSchedule) * 100);


        const data = {
            dashboard: {
                countUnapprovedUsers,
                countAllUsers,
                countThesisSubmission,
                countAllThesis,
                countSchedule,
                countAllStudent,
                countProposal,
                countHasil,
                countTutup,
                percentageProposal,
                percentageHasil,
                percentageTutup,
            },
            active: "dashboard",
        };

        return res.render("dashboard", { data });
    }

    static async logout(req, res) {
        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            res.redirect("/login");
        });
    }
}

export default DashboardController;
