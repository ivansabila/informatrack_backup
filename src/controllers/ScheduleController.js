import User from "../models/User.js";
import Thesis from "../models/Thesis.js";
import Schedule from "../models/Schedule.js";
import capitalize from "../utils/capitalize.js";
import formatDateTime from "../utils/formatDateTime.js";

class ScheduleController {
    static async index(req, res) {
        const schedules = await Schedule.index();

        if (!schedules) {
            const data = {
                allSchedule: {},
                active: "schedule",
            };

            res.render("schedule/schedule", { data });
        }

        const allSchedule = await Promise.all(
            Object.entries(schedules).map(async ([uid, schedule]) => {
                const thesis = await Thesis.get(schedule.thesisID);
                const user = await User.get(thesis.userId);

                schedule.jenisUjian = capitalize(schedule.jenisUjian);
                schedule.date = formatDateTime(schedule.date);

                user.name = capitalize(user.name);
                switch (thesis.approved) {
                    case 0:
                        thesis.judulUtama = capitalize(thesis.judulUtama);
                        break;
                    case 1:
                        thesis.judulUtama = capitalize(thesis.judulCadangan1);
                        break;
                    case 2:
                        thesis.judulUtama = capitalize(thesis.judulCadangan2);
                        break;
                }

                return { uid, ...schedule, ...thesis, ...user };
            })
        );

        const data = {
            allSchedule: allSchedule,
            active: "schedule",
        };

        res.render("schedule/schedule", { data });
    }

    static async addSearch(req, res) {
        const data = {
            active: "schedule",
        };
        res.render("schedule/scheduleAddSearch", { data });
    }

    static async searchStudent(req, res) {
        const datas = await Thesis.index();

        const keyword = (req.query.keyword || "").toLowerCase();

        if (keyword === "") {
            return res.json({});
        } else {
            const allThesis = await Promise.all(
                Object.entries(datas)
                    .filter(([uid, thesis]) => {
                        return thesis.isApproved === true;
                    })
                    .map(async ([uid, thesis]) => {
                        thesis.judulUtama = capitalize(thesis.judulUtama);
                        thesis.judulCadangan1 = capitalize(thesis.judulCadangan1);
                        thesis.judulCadangan2 = capitalize(thesis.judulCadangan2);

                        const user = await User.get(thesis.userId);

                        user.name = capitalize(user.name);

                        return { uid, ...thesis, ...user };
                    })
            );

            const result = allThesis.filter((item) => {
                const matchKeyword = item.judulUtama.includes(capitalize(keyword)) || item.name.includes(capitalize(keyword)) || item.numberID.includes(keyword);
                return matchKeyword;
            });

            return res.json(result);
        }
    }

    static async add(req, res) {
        const thesisID = req.params.uid;

        const thesis = await Thesis.get(thesisID);
        const user = await User.get(thesis.userId);

        user.name = capitalize(user.name);
        switch (thesis.approved) {
            case 0:
                thesis.judulUtama = capitalize(thesis.judulUtama);
                thesis.tujuanUtama = capitalize(thesis.tujuanUtama);
                break;
            case 1:
                thesis.judulUtama = capitalize(thesis.judulCadangan1);
                thesis.tujuanUtama = capitalize(thesis.tujuanCadangan1);
                break;
            case 2:
                thesis.judulUtama = capitalize(thesis.judulCadangan2);
                thesis.tujuanUtama = capitalize(thesis.tujuanCadangan2);
                break;
        }

        thesis.pembimbing1 = capitalize(thesis.pembimbing1);
        thesis.pembimbing2 = capitalize(thesis.pembimbing2);
        thesis.penguji1 = capitalize(thesis.penguji1);
        thesis.penguji2 = capitalize(thesis.penguji2);
        thesis.penguji3 = capitalize(thesis.penguji3);

        const thesisData = { thesisID, ...thesis, ...user };

        const data = {
            thesisData: thesisData,
            active: "schedule",
        };
        res.render("schedule/scheduleAdd", { data });
    }

    static async store(req, res) {
        const thesisID = req.params.uid;

        const { date, time, jenisUjian, name, numberID, judulUtama, tujuanUtama, pembimbing1, pembimbing2, penguji1, penguji2, penguji3 } = req.body;
        const objData = { thesisID, date, jenisUjian, name, numberID, judulUtama, tujuanUtama, pembimbing1, pembimbing2, penguji1, penguji2, penguji3 };

        const targetDate = new Date(objData.date);

        objData.name = objData.name.toLowerCase();
        objData.judulUtama = objData.judulUtama.toLowerCase();
        objData.tujuanUtama = objData.tujuanUtama.toLowerCase();
        objData.pembimbing1 = objData.pembimbing1.toLowerCase();
        objData.pembimbing2 = objData.pembimbing2.toLowerCase();
        objData.penguji1 = objData.penguji1.toLowerCase();
        objData.penguji2 = objData.penguji2.toLowerCase();
        objData.penguji3 = objData.penguji3.toLowerCase();
        objData.date = new Date(`${date}T${time}:00`).toISOString("id-ID", { timeZone: "Asia/Makassar" });

        const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });
        const [dateStr] = now.split(", ");
        const [day, month, year] = dateStr.split("/").map(Number);
        const nowParsed = new Date(year, month - 1, day);

        let error = "";

        if (targetDate.getTime() < nowParsed.getTime()) {
            error = "Tanggal yang dimasukkan sudah lewat";
        }

        const data = {
            thesisData: { thesisID, ...req.body },
            error: error,
            active: "schedule",
        };

        if (error) {
            return res.render("schedule/scheduleAdd", { data });
        }

        await Schedule.store(objData);

        return res.redirect("/schedule");
    }

    static async searchData(req, res) {
        const schedule = await Schedule.index();

        const keyword = (req.query.keyword || "").toLowerCase();

        const allSchedule = await Promise.all(
            Object.entries(schedule).map(async ([uid, schedule]) => {
                const thesis = await Thesis.get(schedule.thesisID);
                const user = await User.get(thesis.userId);

                schedule.jenisUjian = capitalize(schedule.jenisUjian);
                schedule.date = formatDateTime(schedule.date);

                user.name = capitalize(user.name);
                switch (thesis.approved) {
                    case 0:
                        thesis.judulUtama = capitalize(thesis.judulUtama);
                        break;
                    case 1:
                        thesis.judulUtama = capitalize(thesis.judulCadangan1);
                        break;
                    case 2:
                        thesis.judulUtama = capitalize(thesis.judulCadangan2);
                        break;
                }

                return { uid, ...schedule, ...thesis, ...user };
            })
        );

        const result = allSchedule.filter((item) => {
            const matchKeyword = item.judulUtama.includes(capitalize(keyword)) || item.name.includes(capitalize(keyword)) || item.numberID.includes(keyword);
            return matchKeyword;
        });

        return res.json(result);
    }

    static async detail(req, res) {
        const uid = req.params.uid;

        const schedule = await Schedule.get(uid);

        schedule.name = capitalize(schedule.name);
        schedule.date = formatDateTime(schedule.date);
        
        schedule.jenisUjian = capitalize(schedule.jenisUjian);
        schedule.judulUtama = capitalize(schedule.judulUtama);
        schedule.tujuanUtama = capitalize(schedule.tujuanUtama);
        schedule.pembimbing1 = capitalize(schedule.pembimbing1);
        schedule.pembimbing2 = capitalize(schedule.pembimbing2);
        schedule.penguji1 = capitalize(schedule.penguji1);
        schedule.penguji2 = capitalize(schedule.penguji2);
        schedule.penguji3 = capitalize(schedule.penguji3);

        const data = {
            schedule: schedule,
            active: "schedule",
        };

        res.render("schedule/scheduleDetail", { data });
    }
}

export default ScheduleController;
