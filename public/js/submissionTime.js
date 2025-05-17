const submissionButton = document.querySelector("#submissionButton");
const addIcon = document.querySelector("#addIcon");
const addCalendar = document.querySelector("#addCalendar");
const submissionContent = document.querySelector(".submissionContent");
const submissionText = document.querySelector(".submissionText");

const thesisForm = document.querySelector("#thesisForm");
const time = document.querySelector("#startTime");

function clickSubmissionButton() {
    addCalendar.classList.remove("hidden");
    addIcon.classList.add("hidden");

    submissionContent.classList.remove("hidden");
    submissionText.classList.add("hidden");
}

thesisForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const startTime = time.value;
    console.log("🚀 ~ thesisForm.addEventListener ~ startTime:", startTime);

    try {
        const response = await fetch("https://submitthesis-men42ug4ia-uc.a.run.app", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ startTime }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errText}`);
        }

        console.log("✅ Data terkirim");
        window.location.href = "/activity";
        console.log("reload dong");
    } catch (err) {
        console.error("❌ Gagal mengirim data:", err);
        alert("Gagal mengirim data. Silakan coba lagi.");
    }
    
});
