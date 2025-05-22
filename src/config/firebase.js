import { createRequire } from "module";
const require = createRequire(import.meta.url);

import admin from "firebase-admin";
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://informatrack-ta-default-rtdb.firebaseio.com",
    storageBucket: "gs://informatrack-ta.firebasestorage.app",
});

const auth = admin.auth();
const app = admin.database();
const messaging = admin.messaging();
const bucket = admin.storage().bucket();


export { bucket, messaging, auth, app };
