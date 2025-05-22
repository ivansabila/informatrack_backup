import { auth, app } from "../config/firebase.js";

class Schedule {
    static async index() {
        const snapshot = await app.ref("jadwal_ujian").once("value");
        const data = snapshot.val();

        return data;
    }

    static async get(uid) {
        const snapshot = await app.ref(`jadwal_ujian/${uid}`).once("value");
        const data = snapshot.val();

        return data;
    }

    static async store(objData) {
        const id = app.ref(`jadwal_ujian`).push();

        await id.set(objData);
    }

    static async getSubmissionTime() {
        const snapshot = await app.ref(`submissionTime/startTime`).once("value");
        const data = snapshot.val();

        return data;
    }

    static async getNumberLetter() {
        const result = await app.ref(`numberLetter/prodi`).transaction((currentValue) => {
            return (currentValue || 0) + 1;
        });

        const data = result.snapshot.val();

        return data
    }
}

export default Schedule;
