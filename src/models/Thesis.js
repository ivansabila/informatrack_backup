import { auth, app } from "../config/firebase.js";

class Thesis {
    static async index() {
        const snapshot = await app.ref("pengajuan_judul").once("value");
        const data = snapshot.val();

        return data;
    }

    static async get(uid) {
        const snapshot = await app.ref(`pengajuan_judul/${uid}`).once("value");
        const data = snapshot.val();

        return data;
    }

    static async rejectThesis(uid) {
        await app.ref(`pengajuan_judul/${uid}`).update({
            status: "reviewed",
        });
    }

    static async confirmThesis(uid, chosenThesis) {
        await app.ref(`pengajuan_judul/${uid}`).update({
            approved: parseInt(chosenThesis),
            isApproved: true,
            status: "reviewed",
        });
    }

    static async confirmLecturer(uid, data) {
        await app.ref(`pengajuan_judul/${uid}`).update({
            pembimbing1: data.pembimbingUtama,
            pembimbing2: data.pembimbingPendamping,
            penguji1: data.dosenPenguji1,
            penguji2: data.dosenPenguji2,
            penguji3: data.dosenPenguji3,
        });
    }
}

export default Thesis;
