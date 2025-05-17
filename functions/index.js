import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import admin from "firebase-admin";
import { onSchedule } from "firebase-functions/scheduler";

admin.initializeApp();

const app = admin.database();

export const submitThesis = onRequest(async (req, res) => {
    // Izinkan akses dari semua origin
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send(""); // <- penting!
    }

    try {
        const { startTime } = req.body;

        logger.info("Start time received:", startTime);

        if (!startTime) {
            return res.status(400).json({ error: "startTime is required" });
        }

        await app.ref(`submissionTime`).set({
            startTime: startTime,
        });

        return res.status(200).json({ message: "Start time saved" });
    } catch (error) {
        logger.error("Error submitting thesis:", error);
        res.set("Access-Control-Allow-Origin", "*"); // ulangi CORS header
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export const announceThesis = onSchedule(
    {
        schedule: "0 0 * * *",
        timeZone: "Asia/Makassar",
    },
    async () => {
        const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });
        const dateNow = now.split(", ")[1].replace(/\./g, ":").substring(0, 5);

        const snapshot = await app.ref(`pengajuan_judul`).once("value");
        const thesis = snapshot.val();

        const getStartTime = (await app.ref(`submissionTime`).once("value")).val();
        const startTime = getStartTime?.startTime;

        logger.info(startTime);

        if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
            logger.warn("Start time is invalid or missing:", startTime);
            return;
        }

        const updates = {};

        if (dateNow >= startTime) {
            for (const [uid, data] of Object.entries(thesis)) {
                updates[`pengajuan_judul/${uid}/status`] = "announced";
            }

            await app.ref(`submissionTime`).remove();
        }

        if (Object.keys(updates).length > 0) {
            await app.ref().update(updates);
        }
    }
);
