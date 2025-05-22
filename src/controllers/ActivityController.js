import User from "../models/User.js";
import Thesis from "../models/Thesis.js";
import Schedule from "../models/Schedule.js";
import capitalize from "../utils/capitalize.js";
import formatDateTime from "../utils/formatDateTime.js";

import PDFDocument from "pdfkit";

import { bucket } from "../config/firebase.js";

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

            const data = {
                time: submissionTime ? submissionTime : "",
                allThesis: allThesis,
                active: "activity",
            };

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
        const { name, numberID, judulUtama, tujuanUtama, pembimbing1, pembimbing2, penguji1, penguji2, penguji3 } = req.body;

        const allUser = await User.index();
        const thesisID = await Thesis.get(uid);

        const numLetter = await Thesis.getNumberLetter();
        const numberLetter = String(numLetter).padStart(3, "0");

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

        const doc = new PDFDocument({ size: "A4", margin: 50 });
        let pdfChunks = [];

        // Modified data for SK
        const monthCode = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        const dateNow = new Date();
        const dayNow = dateNow.getDate();
        const monthNow = monthCode[dateNow.getMonth()];
        const month = months[dateNow.getMonth()];
        const yearNow = dateNow.getFullYear();

        const nomorSurat = `${numberLetter}SEMENTARA/Q.18/FT-UND/${monthNow}/${yearNow}`;
        const tanggalKeluar = `${dayNow} ${month} ${yearNow}`;

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

        // SK PEMBIMBING
        // Header Logo
        doc.image("public/images/_logo_und.png", 70, 40, { width: 50 }); // Ganti path logo sesuai file Anda

        doc.x = 100;
        // Header Text
        doc.font("Times-Bold")
            .fontSize(16)
            .text("UNIVERSITAS DAYANU IKHSANUDDIN", { align: "center" })
            .text("FAKULTAS TEKNIK", { align: "center" })
            .moveDown(0)
            .font("Times-Italic")
            .fontSize(9)
            .text("Jl. Sultan Dayanu Ikhsanuddin No. 124 Baubau Telp (0402) 2821327, Fax(0402) 2826682 Baubau 93724", { align: "center" });

        // Garis
        doc.moveTo(50, 100).lineTo(545, 100).stroke();
        doc.moveTo(50, 102).lineTo(545, 102).stroke();

        doc.moveDown(2)
            .fontSize(11)
            .font("Times-Roman")
            .text("SURAT KEPUTUSAN", {
                align: "center",
            })
            .moveDown(0)
            .text("DEKAN FAKULTAS TEKNIK UNIVERSITAS DAYANU IKHSANUDDIN", {
                align: "center",
            })
            .moveDown(0)
            .text(`NOMOR :  ${nomorSurat}`, {
                align: "center",
            })
            .moveDown()
            .text("TENTANG", {
                align: "center",
            })
            .moveDown()
            .text("PENETAPAN PEMBIMBING TUGAS AKHIR MAHASISWA PROGRAM STRATA SATU", {
                align: "center",
            })
            .moveDown(0)
            .text(`A.N: ${name.toUpperCase()} NOMOR INDUK : ${numberID}`, {
                align: "center",
            })
            .moveDown(0)
            .text("PROGRAM STUDI TEKNIK INFORMATIKA", {
                align: "center",
            })
            .moveDown(0)
            .font("Times-Italic")
            .text("Dengan Rahmat Tuhan Yang Maha Esa", {
                align: "center",
            })
            .moveDown(0)
            .font("Times-Roman")
            .text("DEKAN FAKULTAS TEKNIK UNIVERSITAS DAYANU IKHSANUDDIN", {
                align: "center",
            })
            .moveDown();

        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Menimbang                          :", {
            continued: true,
        });

        createFormattedText(
            doc,
            "",
            `a. Bahwa dalam rangka pelaksanaan Bimbingan Tugas Akhir (Skripsi) bagi Sdr. ${name.toUpperCase()} Nomor Induk ${numberID} Mahasiswa Program Studi Teknik Informatika, maka dipandang perlu mengangkat Pembimbing Utama dan Pembimbing Pendamping.`
        );
        doc.x = 50;
        createFormattedText(doc, "", "b. Bahwa berdasarkan pada huruf (a) diatas, perlu ditetapkan dalam Surat Keputusan Dekan Fakultas Teknik Universitas Dayanu Ikhsanuddin.");
        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Mengingat                           :", {
            continued: true,
        });

        createFormattedText(doc, "", "1. Peraturan Pemerintah Republik Indonesia Nomor 37 Tahun 2009, tentang Dosen.");
        doc.x = 50;
        createFormattedText(doc, "", "2. Keputusan Rektor Nomor : 96/Q.13/UND/XII/2016, tentang Peraturan Akademik Universitas Dayanu Ikhsanuddin");
        doc.x = 50;
        createFormattedText(doc, "", "3. Keputusan Rektor Nomor : 48/Q/UND/VII/2017, tentang Beban Kerja Tri Dharma dan Tugas Tambahan Dosen Universitas Dayanu Ikhsanuddin");
        doc.x = 50;
        createFormattedText(doc, "", "4. Keputusan Rektor Nomor :, tentang Kalender Akademik Universitas Dayanu Ikhsanuddin Surat Ketua Program Studi Teknik Informatika Nomor : tentang Usulan Dosen Pembimbing Tugas Akhir mahasiswa.");
        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Memperhatikan                  :", {
            continued: true,
        });

        createFormattedText(doc, "", "Surat Ketua Program Studi Teknik Informatika Nomor : tentang Usulan Dosen Pembimbing Tugas Akhir mahasiswa.");
        doc.x = 50;

        doc.moveDown()
            .fontSize(10)
            .font("Times-Roman")
            .text("MEMUTUSKAN", {
                align: "center",
            })
            .moveDown();

        doc.fontSize(10).font("Times-Roman").text("Menetapkan                        :");

        doc.fontSize(10).font("Times-Roman").text("Pertama                               :", {
            continued: true,
        });

        createFormattedText(
            doc,
            "",
            `Mengangkat Pembimbing Utama dan Pembimbing Pendamping Tugas Akhir bagi Sdr. ${name.toUpperCase()} Nomor Induk ${numberID} Program Studi Teknik Informatika Fakultas Teknik Universitas Dayanu Ikhsanuddin.`
        );
        doc.x = 50;
        createFormattedText(doc, "", `Judul Skripsi: ${judulUtama.toUpperCase()}`);
        doc.x = 50;
        createFormattedText(doc, "", "dengan susunan sebagai berikut:");
        doc.x = 50;
        createFormattedText(doc, "", `1. ${pembimbingUtama}`);
        doc.x = 50;
        createFormattedText(doc, "", `2. ${pembimbingPendamping}`);
        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Kedua                                 :", {
            continued: true,
        });

        createFormattedText(doc, "", "Segala Biaya yang timbul schubungan dengan Surat keputusan ini di bebankan pada Anggaran Rutin Universitas Dayanu Ikhsanuddin Bau-Bau.");
        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Ketiga                                 :", {
            continued: true,
        });

        createFormattedText(doc, "", "Surat Keputusan ini berlaku sejak tanggal ditetapkan, dan apabila terdapat kekeliruan didalamnya akan di tinjau kembali dan diperbaiki sebagaimana mestinya.");
        doc.x = 50;

        doc.x = 360;

        doc.moveDown().moveDown();

        doc.fontSize(10)
            .font("Times-Roman")
            .text("Ditetapkan di    :  Baubau", {
                align: "left",
            })
            .text(`Pada tanggal     :  ${tanggalKeluar}`, {
                align: "left",
            })

            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .font("Times-Bold")
            .text(`HILDA SULAIMAN NUR, S.T., M.T.`, {
                align: "left",
                underline: 1,
            })
            .text("NPP. 178 31 164", {
                align: "left",
            });

        doc.addPage();
        // SK PENGUJI

        const numLetterPenguji = await Thesis.getNumberLetter();
        const numberLetterPenguji = String(numLetterPenguji).padStart(3, "0");

        const nomorSuratPenguji = `${numberLetterPenguji}SEMENTARA/Q.18/FT-UND/${monthNow}/${yearNow}`;

        // Header Logo
        doc.image("public/images/_logo_und.png", 70, 40, { width: 50 }); // Ganti path logo sesuai file Anda

        doc.x = 100;
        // Header Text
        doc.font("Times-Bold")
            .fontSize(16)
            .text("UNIVERSITAS DAYANU IKHSANUDDIN", { align: "center" })
            .text("FAKULTAS TEKNIK", { align: "center" })
            .moveDown(0)
            .font("Times-Italic")
            .fontSize(9)
            .text("Jl. Sultan Dayanu Ikhsanuddin No. 124 Baubau Telp (0402) 2821327, Fax(0402) 2826682 Baubau 93724", { align: "center" });

        // Garis
        doc.moveTo(50, 100).lineTo(545, 100).stroke();
        doc.moveTo(50, 102).lineTo(545, 102).stroke();

        doc.moveDown(2)
            .fontSize(11)
            .font("Times-Roman")
            .text("SURAT KEPUTUSAN", {
                align: "center",
            })
            .moveDown(0)
            .text("DEKAN FAKULTAS TEKNIK UNIVERSITAS DAYANU IKHSANUDDIN", {
                align: "center",
            })
            .moveDown(0)
            .text(`NOMOR :  ${nomorSuratPenguji}`, {
                align: "center",
            })
            .moveDown()
            .text("TENTANG", {
                align: "center",
            })
            .moveDown()
            .text("PENETAPAN PEMBIMBING TUGAS AKHIR MAHASISWA PROGRAM STRATA SATU", {
                align: "center",
            })
            .moveDown(0)
            .text(`A.N: ${name.toUpperCase()} NOMOR INDUK : ${numberID}`, {
                align: "center",
            })
            .moveDown(0)
            .text("PROGRAM STUDI TEKNIK INFORMATIKA", {
                align: "center",
            })
            .moveDown(0)
            .font("Times-Italic")
            .text("Dengan Rahmat Tuhan Yang Maha Esa", {
                align: "center",
            })
            .moveDown(0)
            .font("Times-Roman")
            .text("DEKAN FAKULTAS TEKNIK UNIVERSITAS DAYANU IKHSANUDDIN", {
                align: "center",
            })
            .moveDown();

        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Menimbang                          :", {
            continued: true,
        });

        createFormattedText(
            doc,
            "",
            `a. Bahwa dalam rangka pelaksanaan Bimbingan Tugas Akhir (Skripsi) bagi Sdr. ${name.toUpperCase()} Nomor Induk ${numberID} Mahasiswa Program Studi Teknik Informatika, maka dipandang perlu mengangkat Pembimbing Utama dan Pembimbing Pendamping.`
        );
        doc.x = 50;
        createFormattedText(doc, "", "b. Bahwa berdasarkan pada huruf (a) diatas, perlu ditetapkan dalam Surat Keputusan Dekan Fakultas Teknik Universitas Dayanu Ikhsanuddin.");
        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Mengingat                           :", {
            continued: true,
        });

        createFormattedText(doc, "", "1. Peraturan Pemerintah Republik Indonesia Nomor 37 Tahun 2009, tentang Dosen.");
        doc.x = 50;
        createFormattedText(doc, "", "2. Keputusan Rektor Nomor : 96/Q.13/UND/XII/2016, tentang Peraturan Akademik Universitas Dayanu Ikhsanuddin");
        doc.x = 50;
        createFormattedText(doc, "", "3. Keputusan Rektor Nomor : 48/Q/UND/VII/2017, tentang Beban Kerja Tri Dharma dan Tugas Tambahan Dosen Universitas Dayanu Ikhsanuddin");
        doc.x = 50;
        createFormattedText(doc, "", "4. Keputusan Rektor Nomor :, tentang Kalender Akademik Universitas Dayanu Ikhsanuddin Surat Ketua Program Studi Teknik Informatika Nomor : tentang Usulan Dosen Pembimbing Tugas Akhir mahasiswa.");
        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Memperhatikan                  :", {
            continued: true,
        });

        createFormattedText(doc, "", "Surat Ketua Program Studi Teknik Informatika Nomor : tentang Usulan Dosen Pembimbing Tugas Akhir mahasiswa.");
        doc.x = 50;

        doc.moveDown()
            .fontSize(10)
            .font("Times-Roman")
            .text("MEMUTUSKAN", {
                align: "center",
            })
            .moveDown();

        doc.fontSize(10).font("Times-Roman").text("Menetapkan                        :");

        doc.fontSize(10).font("Times-Roman").text("Pertama                               :", {
            continued: true,
        });

        createFormattedText(doc, "", `Mengangkat Panitia Penilai Seminar Proposal dan Hasil bagi Sdr. ${name.toUpperCase()} Nomor Induk ${numberID} Program Studi Teknik Informatika Fakultas Teknik Universitas Dayanu Ikhsanuddin.`);
        doc.x = 50;
        createFormattedText(doc, "", `Judul Skripsi: ${judulUtama.toUpperCase()}`);
        doc.x = 50;
        createFormattedText(doc, "", "dengan susunan sebagai berikut:");
        doc.x = 50;
        createFormattedText(doc, "", `1. ${dosenPenguji1}`);
        doc.x = 50;
        createFormattedText(doc, "", `2. ${dosenPenguji2}`);
        doc.x = 50;
        createFormattedText(doc, "", `3. ${dosenPenguji3}`);
        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Kedua                                 :", {
            continued: true,
        });

        createFormattedText(doc, "", "Segala Biaya yang timbul schubungan dengan Surat keputusan ini di bebankan pada Anggaran Rutin Universitas Dayanu Ikhsanuddin Bau-Bau.");
        doc.x = 50;

        doc.fontSize(10).font("Times-Roman").text("Ketiga                                 :", {
            continued: true,
        });

        createFormattedText(doc, "", "Surat Keputusan ini berlaku sejak tanggal ditetapkan, dan apabila terdapat kekeliruan didalamnya akan di tinjau kembali dan diperbaiki sebagaimana mestinya.");
        doc.x = 50;

        doc.x = 360;

        doc.moveDown().moveDown();

        doc.fontSize(10)
            .font("Times-Roman")
            .text("Ditetapkan di    :  Baubau", {
                align: "left",
            })
            .text(`Pada tanggal     :  ${tanggalKeluar}`, {
                align: "left",
            })

            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .font("Times-Bold")
            .text(`HILDA SULAIMAN NUR, S.T., M.T.`, {
                align: "left",
                underline: 1,
            })
            .text("NPP. 178 31 164", {
                align: "left",
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
        const pdfName = `${thesisID.userId}.pdf`;
        const file = bucket.file(`SK/${pdfName}`);

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

        console.log("🚀 ~ ScheduleController ~ store ~ url PEMBIMBING:", url);

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
