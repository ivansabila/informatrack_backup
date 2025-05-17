import User from "../models/User.js";
import capitalize from "../utils/capitalize.js";
import formatDateTime from "../utils/formatDateTime.js";

class UserController {
    static async index(req, res) {
        const users = await User.index();

        if (!users) {
            const data = {
                allUsers: {},
                active: "users",
            };

            res.render("users", { data });
        } else {
            const allUsers = Object.entries(users)
                .filter(([uid, user]) => {
                    return user.role !== "admin" && user.isApproved !== false;
                })
                .map(([uid, user]) => {
                    user.name = capitalize(user.name);
                    user.role = capitalize(user.role);
                    user.registerDate = formatDateTime(user.registerDate);
                    return { uid, ...user };
                });

            const data = {
                allUsers: allUsers,
                active: "users",
            };

            res.render("users/users", { data });
        }
    }

    static async unapproved(req, res) {
        const users = await User.index();

        const userUnapproved = Object.entries(users)
            .filter(([uid, user]) => {
                return user.role !== "admin" && user.isApproved === false;
            })
            .map(([uid, user]) => {
                user.name = capitalize(user.name);
                user.role = capitalize(user.role);
                user.registerDate = formatDateTime(user.registerDate);
                return { uid, ...user };
            });

        const data = {
            userUnapproved: userUnapproved,
            active: "users",
        };

        res.render("users/userUnapproved", { data });
    }

    static async searchData(req, res) {
        const users = await User.index();

        const keyword = (req.query.keyword || "").toLowerCase();
        const roles = req.query.roles ? req.query.roles.split(",") : [];

        const result = Object.entries(users)
            .map(([uid, user]) => ({ uid, ...user }))
            .filter((user) => {
                if (user.role === "admin") return false;
                if (user.isApproved === false) return false;

                const name = user.name.toLowerCase();
                const numberID = user.numberID;
                const matchKeyword = name.includes(keyword) || numberID.includes(keyword);
                const matchRole = roles.length === 0 || roles.includes(user.role?.toLowerCase());

                return matchKeyword && matchRole;
            })
            .map((user) => {
                user.name = capitalize(user.name);
                user.role = capitalize(user.role);
                user.registerDate = formatDateTime(user.registerDate);
                return user;
            });

        res.json(result);
    }

    static async searchDataUnapproved(req, res) {
        const users = await User.index();

        const keyword = (req.query.keyword || "").toLowerCase();

        const result = Object.entries(users)
            .map(([uid, user]) => ({ uid, ...user }))
            .filter((user) => {
                if (user.role === "admin") return false;
                if (user.isApproved === true) return false;
                return user.name.includes(keyword);
            })
            .map((user) => {
                user.name = capitalize(user.name);
                user.role = capitalize(user.role);
                user.registerDate = formatDateTime(user.registerDate);
                return user;
            });

        res.json(result);
    }

    static async acceptUser(req, res) {
        const uid = req.params.uid;
        await User.acceptUser(uid);
        res.json({ success: true });
    }

    static async rejectUser(req, res) {
        const uid = req.params.uid;
        await User.rejectUser(uid);
        res.json({ success: true });
    }

    static async userAddStudent(req, res) {
        const data = {
            oldData: {},
            error: {},
            active: "users",
        };
        res.render("users/userAddStudent", { data });
    }

    static async addStudent(req, res) {
        const { name, numberID, email, password } = req.body;
        const objData = { name, numberID, email, password };

        let error = {};

        const nameRegex = /^[a-zA-Z., ]+$/;
        if (!nameRegex.test(objData.name)) {
            error.name = "Masukkan nama anda dengan benar";
        }

        const nimRegex = /^d+$/;
        if (!nimRegex.test(objData.numberID)) {
            if (objData.numberID.length < 8 || objData.numberID.length > 9) {
                error.nim = "Masukkan NIM anda dengan benar";
            }
        }

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(objData.email)) {
            error.email = "Masukkan email anda dengan benar";
        }

        const data = {
            oldData: req.body,
            error: error,
            active: "users",
        };

        if (Object.keys(error).length) {
            return res.render("users/userAddStudent", { data });
        }

        objData.name = objData.name.toLowerCase();
        objData.email = objData.email.toLowerCase();

        await User.storeStudent(objData);

        return res.redirect("/users");
    }

    static async userAddLecturer(req, res) {
        const data = {
            oldData: {},
            error: {},
            active: "users",
        };
        res.render("users/userAddLecturer", { data });
    }

    static async addLecturer(req, res) {
        const { name, numberID, email, password } = req.body;
        const objData = { name, numberID, email, password };

        let error = {};

        const nameRegex = /^[a-zA-Z., ]+$/;
        if (!nameRegex.test(objData.name)) {
            error.name = "Masukkan nama anda dengan benar";
        }

        const nidnRegex = /^d+$/;
        if (!nidnRegex.test(objData.numberID)) {
            if (objData.numberID.length < 10 || objData.numberID.length > 10) {
                error.nidn = "Masukkan NIDN anda dengan benar";
            }
        }

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(objData.email)) {
            error.email = "Masukkan email anda dengan benar";
        }

        const data = {
            oldData: req.body,
            error: error,
            active: "users",
        };

        if (Object.keys(error).length) {
            return res.render("users/userAddLecturer", { data });
        }

        objData.name = objData.name.toLowerCase();
        objData.email = objData.email.toLowerCase();

        await User.storeLecturer(objData);

        return res.redirect("/users");
    }

    static async edit(req, res) {
        const uid = req.params.uid;

        const user = await User.get(uid);

        user.name = capitalize(user.name);

        const data = {
            user: { uid, ...user },
            oldData: {},
            error: {},
            active: "users",
        };
        res.render("users/userDetail", { data });
    }

    static async modify(req, res) {
        const uid = req.params.uid;
        const { name, numberID } = req.body;
        const objData = { name, numberID };

        let error = {};

        const nameRegex = /^[a-zA-Z., ]+$/;
        if (!nameRegex.test(objData.name)) {
            error.name = "Masukkan nama anda dengan benar";
        }

        const nidnRegex = /^d+$/;
        if (!nidnRegex.test(objData.numberID)) {
            if (objData.numberID.length < 10 || objData.numberID.length > 10) {
                error.numberID = "Masukkan NIDN anda dengan benar";
            }
        }

        const user = await User.get(uid);

        const data = {
            user: { uid, ...user },
            oldData: req.body,
            error: error,
            active: "users",
        };

        if (Object.keys(error).length) {
            return res.render("users/userDetail", { data });
        }

        objData.name = objData.name.toLowerCase();

        await User.modify(uid, objData);

        return res.redirect("/users");
    }
}

export default UserController;
