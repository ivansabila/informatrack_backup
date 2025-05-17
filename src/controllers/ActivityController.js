import User from "../models/User.js";
import Thesis from "../models/Thesis.js";
import Schedule from "../models/Schedule.js";
import capitalize from "../utils/capitalize.js";
import formatDateTime from "../utils/formatDateTime.js";

class ActivityController {
    static async index(req, res) {
        const thesis = await Thesis.index();

        if (!thesis) {
            const data = {
                allThesis: {},
                active: "activity",
            };

            res.render("activity/activity", { data });
        } else {
            const allThesis = await Promise.all(
                Object.entries(thesis)
                    .filter(([uid, thesis]) => {
                        return thesis.status !== "under review";
                    })
                    .map(async ([uid, thesis]) => {
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

                        thesis.status = capitalize(thesis.status);

                        const user = await User.get(thesis.userId);

                        user.name = capitalize(user.name);

                        return { uid, ...thesis, ...user };
                    })
                );
            
                const submissionTime = await Schedule.getSubmissionTime();
                console.log("🚀 ~ ActivityController ~ index ~ submissionTime:", submissionTime)
                
                const data = {
                    time: submissionTime ? submissionTime : "",
                    allThesis: allThesis,
                    active: "activity",
                };
                console.log("🚀 ~ ActivityController ~ index ~ data:", data.time)

            res.render("activity/activity", { data });
        }
    }

    static async searchData(req, res) {
        const thesis = await Thesis.index();

        const keyword = capitalize(req.query.keyword || "");

        const allThesis = await Promise.all(
            Object.entries(thesis)
                .filter(([uid, thesis]) => {
                    return thesis.isApproved === true;
                })
                .map(async ([uid, thesis]) => {
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

                    const user = await User.get(thesis.userId);

                    user.name = capitalize(user.name);

                    return { uid, ...thesis, ...user };
                })
        );

        const result = allThesis.filter((item) => {
            const matchKeyword = item.judulUtama.includes(keyword) || item.name.includes(keyword) || item.numberID.includes(keyword);
            return matchKeyword;
        });

        res.json(result);
    }

    static async unapproved(req, res) {
        const thesis = await Thesis.index();

        if (!thesis) {
            const data = {
                allThesis: {},
                active: "activity",
            };

            res.render("activity/activityUnapproved", { data });
        } else {
            const allThesis = await Promise.all(
                Object.entries(thesis)
                    .filter(([uid, thesis]) => {
                        return thesis.status === "under review";
                    })
                    .map(async ([uid, thesis]) => {
                        thesis.tanggalPengajuan = formatDateTime(thesis.tanggalPengajuan);

                        const user = await User.get(thesis.userId);

                        user.name = capitalize(user.name);

                        return { uid, ...thesis, ...user };
                    })
            );

            const data = {
                allThesis: allThesis,
                active: "activity",
            };

            res.render("activity/activityUnapproved", { data });
        }
    }

    static async searchDataUnapproved(req, res) {
        const thesis = await Thesis.index();

        const keyword = capitalize(req.query.keyword || "");

        const allThesis = await Promise.all(
            Object.entries(thesis)
                .filter(([uid, thesis]) => {
                    return thesis.isApproved === false;
                })
                .map(async ([uid, thesis]) => {
                    thesis.tanggalPengajuan = formatDateTime(thesis.tanggalPengajuan);

                    const user = await User.get(thesis.userId);

                    user.name = capitalize(user.name);

                    return { uid, ...thesis, ...user };
                })
        );

        const result = allThesis.filter((item) => {
            const matchKeyword = item.name.includes(keyword) || item.numberID.includes(keyword);
            return matchKeyword;
        });

        res.json(result);
    }

    static async detail(req, res) {
        const uid = req.params.uid;

        const thesis = await Thesis.get(uid);

        const data = {
            thesis: { ...thesis, uid },
            active: "activity",
        };

        res.render("activity/activityUnapprovedDetail", { data });
    }

    static async detailSubmit(req, res) {
        const uid = req.params.uid;
        const { chosenThesis, action } = req.body;

        if (action === "reject") {
            await Thesis.rejectThesis(uid);
            return res.redirect("/activity/unapproved");
        } else if (action === "confirm") {
            await Thesis.confirmThesis(uid, chosenThesis);
            return res.redirect(`/activity/unapproved/mentor/${uid}`);
        }
    }

    static async detailActivity(req, res) {
        const uid = req.params.uid;

        const thesis = await Thesis.get(uid);
        const user = await User.get(thesis.userId);

        thesis.status = capitalize(thesis.status);
        user.name = capitalize(user.name);

        switch (thesis.approved) {
            case 0:
                thesis.judul = capitalize(thesis.judulUtama);
                thesis.tujuan = capitalize(thesis.tujuanUtama);
                break;
            case 1:
                thesis.judul = capitalize(thesis.judulCadangan1);
                thesis.tujuan = capitalize(thesis.tujuanCadangan1);
                break;
            case 2:
                thesis.judul = capitalize(thesis.judulCadangan2);
                thesis.tujuan = capitalize(thesis.tujuanCadangan2);
                break;
        }

        const data = {
            thesis: { uid, ...user, ...thesis },
            active: "activity",
        };

        res.render("activity/activityDetail", { data });
    }

    static async mentor(req, res) {
        const uid = req.params.uid;

        const thesis = await Thesis.get(uid);
        const user = await User.get(thesis.userId);

        user.name = capitalize(user.name);

        switch (thesis.approved) {
            case 0:
                thesis.judul = capitalize(thesis.judulUtama);
                thesis.tujuan = capitalize(thesis.tujuanUtama);
                break;
            case 1:
                thesis.judul = capitalize(thesis.judulCadangan1);
                thesis.tujuan = capitalize(thesis.tujuanCadangan1);
                break;
            case 2:
                thesis.judul = capitalize(thesis.judulCadangan2);
                thesis.tujuan = capitalize(thesis.tujuanCadangan2);
                break;
        }

        const allUser = await User.index();

        const allLecturer = Object.entries(allUser)
            .filter(([uid, user]) => {
                return user.role === "dosen";
            })
            .map(([uid, user]) => {
                user.name = capitalize(user.name);
                return user.name;
            });

        const data = {
            thesis: { uid, ...thesis, ...user },
            lecturer: allLecturer,
            active: "activity",
        };

        res.render("activity/activityMentor", { data });
    }

    static async mentorSubmit(req, res) {
        const uid = req.params.uid;
        const { pembimbing1, pembimbing2, penguji1, penguji2, penguji3 } = req.body;

        const allUser = await User.index();

        const allLecturer = Object.entries(allUser)
            .filter(([uid, user]) => {
                return user.role === "dosen";
            })
            .map(([uid, user]) => {
                user.name = capitalize(user.name);
                return user.name;
            });

        const dosenList = allLecturer.map((name, index) => ({
            id: String(index),
            name,
        }));

        const pembimbingUtama = dosenList.find((d) => d.id === pembimbing1)?.name;
        const pembimbingPendamping = dosenList.find((d) => d.id === pembimbing2)?.name;
        const dosenPenguji1 = dosenList.find((d) => d.id === penguji1)?.name;
        const dosenPenguji2 = dosenList.find((d) => d.id === penguji2)?.name;
        const dosenPenguji3 = dosenList.find((d) => d.id === penguji3)?.name;

        const data = { pembimbingUtama, pembimbingPendamping, dosenPenguji1, dosenPenguji2, dosenPenguji3 };

        await Thesis.confirmLecturer(uid, data);

        return res.redirect("/activity");
    }

    static async pushNotification(req, res) {
        const uid = req.params.uid;

        const thesis = await Thesis.get(uid);

        const response = await User.notification(thesis.userId);

        res.status(200).json({ success: true, response });
    }
}

export default ActivityController;
