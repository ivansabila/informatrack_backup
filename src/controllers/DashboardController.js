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

        const oneMonthAgo = dayjs().subtract(1, "month");

        let countUnapprovedUsers = 0;
        let countAllUsers = 0;
        let countThesisSubmission = 0;
        let countAllThesis = 0;
        let countSchedule = 0;
        let countAllStudent = 0;
        let countProposal = 0;
        let countHasil = 0;
        let countTutup = 0;
        let percentageProposal = 0;
        let percentageHasil = 0;
        let percentageTutup = 0;

        if (users) {
            countUnapprovedUsers = Object.entries(users).filter(([uid, user]) => {
                return user.isApproved == false;
            }).length;

            countAllUsers = Object.entries(users).filter(([uid, user]) => {
                return user.isApproved == true;
            }).length;
        }

        if (thesis) {
            countThesisSubmission = Object.entries(thesis).filter(([uid, thesis]) => {
                return thesis.status == "under review";
            }).length;

            countAllThesis = Object.entries(thesis).filter(([uid, thesis]) => {
                return thesis.status !== "under review";
            }).length;

            countAllStudent = Object.entries(thesis).filter(([uid, thesis]) => {
                return thesis.status !== "under review" && thesis.isApproved === true;
            }).length;
        }

        if (schedule) {
            countSchedule = Object.entries(schedule).length;

            countProposal = Object.entries(schedule).filter(([uid, schedule]) => {
                const scheduleDate = dayjs(schedule.date);
                return scheduleDate.isAfter(oneMonthAgo) && schedule.jenisUjian === "proposal";
            }).length;

            countHasil = Object.entries(schedule).filter(([uid, schedule]) => {
                const scheduleDate = dayjs(schedule.date);
                return scheduleDate.isAfter(oneMonthAgo) && schedule.jenisUjian === "hasil";
            }).length;

            countTutup = Object.entries(schedule).filter(([uid, schedule]) => {
                const scheduleDate = dayjs(schedule.date);
                return scheduleDate.isAfter(oneMonthAgo) && schedule.jenisUjian === "tutup";
            }).length;

            percentageProposal = Math.floor((countProposal / countSchedule) * 100);
            percentageHasil = Math.floor((countHasil / countSchedule) * 100);
            percentageTutup = Math.floor((countTutup / countSchedule) * 100);
        }

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
