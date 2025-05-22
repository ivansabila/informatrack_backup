import User from "../models/User.js";
import Thesis from "../models/Thesis.js";
import Schedule from "../models/Schedule.js";
import capitalize from "../utils/capitalize.js";
import formatDateTime from "../utils/formatDateTime.js";

import PDFDocument from "pdfkit";

import { bucket } from "../config/firebase.js";

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

        const thesis = await Thesis.get(thesisID);

        const numLetter = await Schedule.getNumberLetter();
        const numberLetter = String(numLetter).padStart(3, "0");

        const { date, time, jenisUjian, name, numberID, judulUtama, tujuanUtama, pembimbing1, pembimbing2, penguji1, penguji2, penguji3 } = req.body;
        const objData = { thesisID, numberLetter, date, jenisUjian, name, numberID, judulUtama, tujuanUtama, pembimbing1, pembimbing2, penguji1, penguji2, penguji3 };

        console.log("🚀 ~ ScheduleController ~ store ~ objData:", objData);

        // Modified data for letter
        const monthCode = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        const dateNow = new Date();
        const dayNow = dateNow.getDate();
        const monthNow = monthCode[dateNow.getMonth()];
        const yearNow = dateNow.getFullYear();

        const dateTest = new Date(date);
        const dayName = days[dateTest.getDay()];
        const hari = dateTest.getDate();
        const monthName = months[dateTest.getMonth()];

        const nomorSurat = `${numberLetter}/Q19/TI-UND/${monthNow}/${yearNow}`;
        const hariUjian = `${dayName}, ${hari} ${monthName} ${yearNow}`;
        const tanggalKeluar = `Baubau, ${dayNow} ${monthName} ${yearNow}`;

        const doc = new PDFDocument({ size: "A4", margin: 50 });
        let pdfChunks = [];

        // Kumpulkan data PDF sebagai buffer
        doc.on("data", (chunk) => pdfChunks.push(chunk));

        // Fungsi untuk format teks dinamis multi-baris
        const createFormattedText = (doc, label, value, labelWidth = 104, marginLeft = 20) => {
            const initialX = doc.x;
            const initialY = doc.y;

            // Tulis label (kiri)
            doc.text(label, initialX, initialY, { width: labelWidth, align: "left" });

            // Hitung X dan width untuk teks value
            const valueX = initialX + labelWidth + marginLeft;
            const maxWidth = doc.page.width - valueX - doc.page.margins.right;

            // Tulis value (kanan, wrapping otomatis setelah titik dua)
            doc.text(`${value}`, valueX, initialY, {
                width: maxWidth,
                align: "left",
            });

            // Hitung tinggi teks dan pindahkan posisi Y ke bawah
            const textHeight = doc.heightOfString(`: ${value}`, {
                width: maxWidth,
            });

            doc.y = initialY + textHeight;
        };

        // Header Logo
        doc.image("public/images/_logo_und.png", 70, 40, { width: 60 }); // Ganti path logo sesuai file Anda

        // Header Text
        doc.font("Helvetica-Bold")
            .fontSize(12)
            .text("UNIVERSITAS DAYANU IKHSANUDDIN", { align: "center" })
            .text("FAKULTAS TEKNIK", { align: "center" })
            .text("PROGRAM STUDI TEKNIK INFORMATIKA", { align: "center" })
            .moveDown(0.5)
            .font("Courier")
            .fontSize(9)
            .text("Terakreditasi (S-1) No. 3084/SK/BAN-PT/Ak-PPJ/S/V/2020", { align: "center" })
            .text("Kampus Palagimata Jl. Sultan Dayanu Ikhsanuddin No.124 Telp (0402) 2821327 Baubau", { align: "center" });

        // Garis
        doc.moveTo(50, 123).lineTo(545, 123).stroke();
        doc.moveTo(50, 125).lineTo(545, 125).stroke();

        // Nomor Surat
        doc.moveDown(3)
            .fontSize(12)
            .font("Helvetica")
            .text("Nomor", {
                continued: true,
            })
            .text(`: ${nomorSurat}`, 76)
            .moveDown(0)
            .text("Lampiran", {
                continued: true,
            })
            .text(`: -`, 63)
            .moveDown(0)
            .text("Hal", {
                continued: true,
            })
            .text(`: UNDANGAN SEMINAR ${jenisUjian.toUpperCase()}`, 95)
            .moveDown();

        doc.moveDown().font("Helvetica").text("Kepada Yth,");
        doc.moveDown()
            .fontSize(12)
            .font("Helvetica")
            .text("1.", {
                continued: true,
            })
            .font("Helvetica-Bold")
            .text(` ${penguji1}`)
            .moveDown(0)
            .font("Helvetica")
            .text("2.", {
                continued: true,
            })
            .font("Helvetica-Bold")
            .text(` ${penguji2}`)
            .moveDown(0)
            .font("Helvetica")
            .text("3.", {
                continued: true,
            })
            .font("Helvetica-Bold")
            .text(` ${penguji3}`)
            .moveDown(0);

        doc.moveDown()
            .fontSize(12)
            .font("Helvetica")
            .text("Dengan hormat,")
            .moveDown(0.5)
            .text(`Kami mengundang Bapak/Ibu, Saudara (i) untuk menghadiri Seminar Proposal bagi saudara (i) ${name.toUpperCase()} No. Stambuk ${numberID} Program Studi Teknik Informatika, yang akan dilaksanakan pada :`, {
                lineGap: 2,
                align: "justify",
            })
            .moveDown();

        doc.fontSize(12)
            .font("Helvetica")
            .text("Hari/Tanggal", {
                continued: true,
            })
            .text(`: ${hariUjian}`, 100)
            .moveDown(0)
            .text("Pukul", {
                continued: true,
            })
            .text(`: ${time} Wita s/d Selesai`, 138)
            .moveDown(0)
            .text("Bertempat di", {
                continued: true,
            })
            .text(`: R. Teknik Informatika`, 99)
            .moveDown(0);

        doc.fontSize(12).font("Helvetica").text("Judul                           :", {
            continued: true,
        });

        createFormattedText(doc, "", `${judulUtama.toUpperCase()}`);

        doc.x = 50;

        doc.fontSize(12)
            .font("Helvetica")
            .text("Dosen Pembimbing", {
                continued: true,
            })
            .text(`: `, 64)
            .moveDown(0)
            .text("Utama", {
                continued: true,
            })
            .text(`: ${pembimbing1}`, 133)
            .moveDown(0)
            .text("Pendamping", {
                continued: true,
            })
            .text(`: ${pembimbing2}`, 101)
            .moveDown(0);

        doc.moveDown().fontSize(12).font("Helvetica").text("Atas perhatian dan kehadirannya, disampaikan terima kasih", { lineGap: 2, align: "justify" }).moveDown().moveDown().moveDown();

        doc.x = 300;

        doc.fontSize(12)
            .font("Helvetica")
            .text(`${tanggalKeluar}`, {
                align: "center",
            })
            .font("Helvetica-Bold")
            .text("Kaprodi Teknik Informatika", {
                align: "center",
            })
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .font("Helvetica")
            .text(`Ir. ERY MUCHYAR HASIRI, S.Kom., M.T.`, {
                align: "center",
                underline: 1,
            })
            .font("Helvetica-Bold")
            .text("NIDN. 0913098203", {
                align: "center",
            });

        doc.end();

        // Tunggu sampai PDF selesai dibuat
        const pdfBuffer = await new Promise((resolve) => {
            doc.on("end", () => {
                const pdfData = Buffer.concat(pdfChunks);
                resolve(pdfData);
            });
        });

        // Upload ke Firebase Storage
        const pdfName = `${thesis.userId}-${jenisUjian.toLowerCase()}.pdf`;
        const file = bucket.file(`surat_undangan/${pdfName}`);

        await file.save(pdfBuffer, {
            metadata: {
                contentType: "application/pdf",
            },
        });

        // Dapatkan URL download
        const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        });
        console.log("🚀 ~ ScheduleController ~ store ~ url:", url)

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

        // const objData = { thesisID, numberLetter, date, jenisUjian, name, numberID, judulUtama, tujuanUtama, pembimbing1, pembimbing2, penguji1, penguji2, penguji3 };

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
