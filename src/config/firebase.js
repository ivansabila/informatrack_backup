import { createRequire } from "module";
const require = createRequire(import.meta.url);

import admin from "firebase-admin";
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://informatrack-ta-default-rtdb.firebaseio.com",
});

const auth = admin.auth();
const app = admin.database();
const messaging = admin.messaging();

export { messaging, auth, app };

