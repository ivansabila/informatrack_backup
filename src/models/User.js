import { messaging, auth, app } from "../config/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { appClient, authClient } from "../config/firebaseClient.js";

class User {
    static async index() {
        const snapshot = await app.ref(`users`).once("value");
        const data = snapshot.val();

        return data;
    }

    static async get(uid) {
        const snapshot = await app.ref(`users/${uid}`).once("value");
        const data = snapshot.val();
        return data;
    }

    static async acceptUser(uid) {
        await app.ref(`users/${uid}`).update({
            isApproved: true,
        });
    }

    static async rejectUser(uid) {
        await app.ref(`users/${uid}`).remove();
        await auth.deleteUser(uid);
    }

    static async storeStudent(objData) {
        const { name, numberID, email, password } = objData;

        const userRecord = await auth.createUser({
            email: email,
            password: password,
        });

        const uid = userRecord.uid;

        const data = {
            name: name,
            numberID: numberID,
            email: email,
            isApproved: true,
            role: "mahasiswa",
            registerDate: new Date().toISOString(),
        };

        await app.ref(`users/${uid}`).set(data);
    }

    static async storeLecturer(objData) {
        const { name, numberID, email, password } = objData;

        const userRecord = await auth.createUser({
            email: email,
            password: password,
        });

        const uid = userRecord.uid;

        const data = {
            name: name,
            numberID: numberID,
            email: email,
            isApproved: true,
            role: "dosen",
            registerDate: new Date().toISOString(),
        };

        await app.ref(`users/${uid}`).set(data);
    }

    static async modify(uid, objData) {
        await app.ref(`users/${uid}`).update({
            name: objData.name,
            numberID: objData.numberID,
        });
    }

    static async login(token) {
        const decoded = await auth.verifyIdToken(token);
        return decoded;
    }

    static async notification(uid) {
        const snapshot = await app.ref(`users/${uid}/fcm_token`).once("value");
        const token = snapshot.val();

        const title = "INI JUDUL";
        const body = "INI DESKRIPSI";

        const message = {
            token,
            data: {
                title,
                message: body,
                uid,
            },
        };
        console.log("🚀 ~ User ~ notification ~ message:", message);

        const response = await messaging.send(message);
        return response;
    }
}

export default User;
