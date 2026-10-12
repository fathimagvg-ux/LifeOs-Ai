/* ================= HEALTH & MEDICINE ================= */

document.addEventListener("DOMContentLoaded", function () {

const form =
    document.getElementById("medicineForm");

const medicineList =
    document.getElementById("medicineList");

const medicineCount =
    document.getElementById("medicineCount");

const todayMedicineCount =
    document.getElementById("todayMedicineCount");

const takenMedicineCount =
    document.getElementById("takenMedicineCount");

const missedMedicineCount =
    document.getElementById("missedMedicineCount");

const aiHealthTitle =
    document.getElementById("aiHealthTitle");

const aiHealthMessage =
    document.getElementById("aiHealthMessage");


/* ================= VOICE ELEMENTS ================= */

const voiceButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceAnswer =
    document.getElementById("voiceAnswer");


/* ================= LOGIN CHECK ================= */

const token =
    localStorage.getItem("lifeosToken");


if (!token) {

    alert("Please login first.");

    window.location.href =
        "login.html";

    return;
}


/* ================= MEDICINE DATA ================= */

let medicines = [];


/* ================= LOAD MEDICINES ================= */

loadMedicines();


/* ================= ADD MEDICINE ================= */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const medicineName =
                document
                    .getElementById("medicineName")
                    .value
                    .trim();


            const dosage =
                document
                    .getElementById("medicineDose")
                    .value
                    .trim();


            const time =
                document
                    .getElementById("medicineTime")
                    .value;


            const frequency =
                document
                    .getElementById("medicineFrequency")
                    .value;


            const startDate =
                document
                    .getElementById("medicineStartDate")
                    .value;


            const endDate =
                document
                    .getElementById("medicineEndDate")
                    .value;


            /* ================= VALIDATION ================= */

            if (
                medicineName === "" ||
                dosage === "" ||
                time === "" ||
                frequency === "" ||
                startDate === "" ||
                endDate === ""
            ) {

                alert(
                    "Please fill all medicine details."
                );

                return;
            }


            if (endDate < startDate) {

                alert(
                    "End Date cannot be before Start Date."
                );

                return;
            }


            try {

                /* ================= SEND TO BACKEND ================= */

                const response =
                    await fetch(
                        "http://localhost:5000/api/medicines",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token
                            },

                            body: JSON.stringify({

                                medicineName:
                                    medicineName,

                                dosage:
                                    dosage,

                                time:
                                    time,

                                frequency:
                                    frequency,

                                startDate:
                                    startDate,

                                endDate:
                                    endDate

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to add medicine."
                    );

                    return;
                }


                /* ================= SUCCESS ================= */

                alert(
                    "Medicine added successfully!"
                );


                form.reset();


                /* ================= RELOAD LIST ================= */

                loadMedicines();


            } catch (error) {

                console.error(
                    "ADD MEDICINE ERROR:",
                    error
                );


                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}


/* ========================================================= */
/* ================= LOAD MEDICINES ========================= */
/* ========================================================= */

async function loadMedicines() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/medicines",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to load medicines."
            );

            return;
        }


        medicines = Array.isArray(data)
            ? data
            : [];


        displayMedicines(medicines);


    } catch (error) {

        console.error(
            "LOAD MEDICINES ERROR:",
            error
        );

    }

}


/* ========================================================= */
/* ================= DISPLAY MEDICINES ====================== */
/* ========================================================= */

function displayMedicines(medicines) {

    if (!medicineList) {
        return;
    }


    medicineList.innerHTML = "";


    /* ================= EMPTY ================= */

    if (
        !medicines ||
        medicines.length === 0
    ) {

        medicineList.innerHTML = `

            <div class="medicine-card">

                <h3>
                    No medicines added yet 💊
                </h3>

                <p>
                    Add your first medicine above.
                </p>

            </div>

        `;


        updateSummary([]);

        return;
    }


    /* ================= CREATE CARDS ================= */

    medicines.forEach(function (medicine) {

        const card =
            document.createElement("div");

        card.className =
            "medicine-card";


        const status =
            medicine.status ||
            "Active";


        const statusClass =
            status === "Completed"
                ? "taken"
                : "pending";


        card.innerHTML = `

            <div class="medicine-info">

                <div class="medicine-icon">
                    💊
                </div>

                <div>

                    <h3>
                        ${escapeHtml(
                            medicine.medicineName
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            medicine.dosage
                        )}
                        •
                        ${escapeHtml(
                            medicine.frequency ||
                            "Daily"
                        )}
                    </p>

                </div>

            </div>


            <div class="medicine-time">

                ⏰
                ${formatTime(
                    medicine.time
                )}

            </div>


            <div class="medicine-status">

                <button
                    class="status-button ${statusClass}"
                    data-id="${medicine._id}"
                    data-status="${status}">

                    ${
                        status === "Completed"
                            ? "Taken"
                            : "Pending"
                    }

                </button>


                <button
                    class="delete-medicine"
                    data-id="${medicine._id}">

                    🗑️

                </button>

            </div>

        `;


        medicineList.appendChild(card);

    });


    /* ================= BUTTON EVENTS ================= */

    addStatusEvents();

    addDeleteEvents();


    /* ================= UPDATE SUMMARY ================= */

    updateSummary(medicines);

}


/* ========================================================= */
/* ================= STATUS BUTTON ========================== */
/* ========================================================= */

function addStatusEvents() {

    const buttons =
        document.querySelectorAll(
            ".status-button"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.dataset.id;

                const currentStatus =
                    button.dataset.status;


                const newStatus =
                    currentStatus === "Completed"
                        ? "Active"
                        : "Completed";


                await updateMedicineStatus(
                    id,
                    newStatus
                );

            }
        );

    });

}


/* ========================================================= */
/* ================= UPDATE STATUS =========================== */
/* ========================================================= */

async function updateMedicineStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/medicines/" +
                id,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update medicine."
            );

            return;
        }


        loadMedicines();


    } catch (error) {

        console.error(
            "UPDATE MEDICINE ERROR:",
            error
        );


        alert(
            "Unable to update medicine."
        );

    }

}


/* ========================================================= */
/* ================= DELETE EVENTS =========================== */
/* ========================================================= */

function addDeleteEvents() {

    const buttons =
        document.querySelectorAll(
            ".delete-medicine"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            async function () {

                const id =
                    button.dataset.id;


                const confirmDelete =
                    confirm(
                        "Are you sure you want to delete this medicine?"
                    );


                if (!confirmDelete) {
                    return;
                }


                await deleteMedicine(id);

            }
        );

    });

}


/* ========================================================= */
/* ================= DELETE MEDICINE ========================= */
/* ========================================================= */

async function deleteMedicine(id) {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/medicines/" +
                id,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete medicine."
            );

            return;
        }


        alert(
            "Medicine deleted successfully!"
        );


        loadMedicines();


    } catch (error) {

        console.error(
            "DELETE MEDICINE ERROR:",
            error
        );


        alert(
            "Unable to delete medicine."
        );

    }

}


/* ========================================================= */
/* ================= SUMMARY ================================ */
/* ========================================================= */

function updateSummary(medicines) {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    let todayCount = 0;

    let takenCount = 0;

    let missedCount = 0;


    medicines.forEach(function (medicine) {

        const startDate =
            new Date(
                medicine.startDate
            );


        const endDate =
            new Date(
                medicine.endDate
            );


        startDate.setHours(
            0,
            0,
            0,
            0
        );


        endDate.setHours(
            0,
            0,
            0,
            0
        );


        /* ================= TODAY ================= */

        if (
            today >= startDate &&
            today <= endDate &&
            medicine.status !== "Completed"
        ) {

            todayCount++;

            missedCount++;

        }


        /* ================= TAKEN ================= */

        if (
            medicine.status === "Completed"
        ) {

            takenCount++;

        }

    });


    if (todayMedicineCount) {

        todayMedicineCount.textContent =
            todayCount;

    }


    if (takenMedicineCount) {

        takenMedicineCount.textContent =
            takenCount;

    }


    if (missedMedicineCount) {

        missedMedicineCount.textContent =
            missedCount;

    }


    if (medicineCount) {

        medicineCount.textContent =
            medicines.length +
            (
                medicines.length === 1
                    ? " Medicine"
                    : " Medicines"
            );

    }


    /* ================= AI INSIGHT ================= */

    if (
        aiHealthTitle &&
        aiHealthMessage
    ) {

        if (medicines.length === 0) {

            aiHealthTitle.textContent =
                "Keep your medicine schedule consistent";

            aiHealthMessage.textContent =
                "Add your medicines to start tracking your daily medicine routine.";

        }

        else if (missedCount === 0) {

            aiHealthTitle.textContent =
                "Great job! 💚";

            aiHealthMessage.textContent =
                "You have no pending medicines for today.";

        }

        else {

            aiHealthTitle.textContent =
                "Medicine reminder 💊";

            aiHealthMessage.textContent =
                "You have " +
                missedCount +
                " medicine(s) pending today. Remember to follow your schedule.";

        }

    }

}


/* ========================================================= */
/* ================= VOICE ASSISTANT ======================== */
/* ========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (!SpeechRecognition) {

    if (voiceStatus) {

        voiceStatus.textContent =
            "Voice recognition is not supported in this browser. Please use Google Chrome.";

    }

    if (voiceButton) {

        voiceButton.disabled = true;

    }

} else {

    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        1;


    /* ================= START VOICE ================= */

    if (voiceButton) {

        voiceButton.addEventListener(
            "click",
            function () {

                if (medicines.length === 0) {

                    showVoiceResponse(
                        "You don't have any medicines added yet. Please add a medicine first."
                    );

                    speakAnswer(
                        "You don't have any medicines added yet. Please add a medicine first."
                    );

                    return;
                }


                try {

                    recognition.start();

                    voiceStatus.textContent =
                        "🎤 Listening... Please speak now.";

                    voiceButton.textContent =
                        "🎙️ Listening...";

                } catch (error) {

                    console.log(
                        "VOICE START ERROR:",
                        error
                    );

                }

            }
        );

    }


    /* ================= VOICE RESULT ================= */

    recognition.addEventListener(
        "result",
        function (event) {

            const transcript =
                event.results[0][0].transcript
                    .toLowerCase()
                    .trim();


            voiceStatus.textContent =
                'You asked: "' +
                transcript +
                '"';


            const answer =
                getVoiceAnswer(transcript);


            showVoiceResponse(
                answer
            );


            speakAnswer(
                answer
            );

        }
    );


    /* ================= VOICE END ================= */

    recognition.addEventListener(
        "end",
        function () {

            if (voiceButton) {

                voiceButton.textContent =
                    "🎤 Ask LifeOS";

            }

        }
    );


    /* ================= VOICE ERROR ================= */

    recognition.addEventListener(
        "error",
        function (event) {

            console.error(
                "VOICE ERROR:",
                event.error
            );


            if (voiceButton) {

                voiceButton.textContent =
                    "🎤 Ask LifeOS";

            }


            if (voiceStatus) {

                if (
                    event.error ===
                    "not-allowed"
                ) {

                    voiceStatus.textContent =
                        "Microphone permission denied. Please allow microphone access.";

                } else {

                    voiceStatus.textContent =
                        "Sorry, I couldn't hear you. Please try again.";

                }

            }

        }
    );

}


/* ========================================================= */
/* ================= EXAMPLE QUESTIONS ====================== */
/* ========================================================= */

const exampleButtons =
    document.querySelectorAll(
        ".voice-example"
    );


exampleButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const question =
                    button.textContent
                        .toLowerCase()
                        .trim();


                const answer =
                    getVoiceAnswer(
                        question
                    );


                if (voiceStatus) {

                    voiceStatus.textContent =
                        'You asked: "' +
                        button.textContent.trim() +
                        '"';

                }


                showVoiceResponse(
                    answer
                );


                speakAnswer(
                    answer
                );

            }
        );

    }
);


/* ========================================================= */
/* ================= VOICE ANSWER ============================ */
/* ========================================================= */

function getVoiceAnswer(question) {

    if (
        !medicines ||
        medicines.length === 0
    ) {

        return "You don't have any medicines added yet. Please add a medicine first.";

    }


    /* ================= ALL MEDICINES ================= */

    if (
        question.includes("what medicines") ||
        question.includes("which medicines") ||
        question.includes("all medicines") ||
        question.includes("my medicines") ||
        question.includes("medicine do i have") ||
        question.includes("medicines do i have") ||
        question.includes("what do i take")
    ) {

        return getAllMedicinesAnswer();

    }


    /* ================= NEXT MEDICINE ================= */

    if (
        question.includes("next medicine") ||
        question.includes("next tablet") ||
        question.includes("next dose") ||
        question.includes("what is next") ||
        question.includes("which medicine is next")
    ) {

        return getNextMedicineAnswer();

    }


    /* ================= PENDING ================= */

    if (
        question.includes("pending") ||
        question.includes("not taken") ||
        question.includes("remaining") ||
        question.includes("missed")
    ) {

        return getPendingMedicinesAnswer();

    }


    /* ================= TAKEN ================= */

    if (
        question.includes("taken") ||
        question.includes("completed")
    ) {

        return getTakenMedicinesAnswer();

    }


    /* ================= TODAY ================= */

    if (
        question.includes("today") ||
        question.includes("scheduled today")
    ) {

        return getTodayMedicinesAnswer();

    }


    /* ================= SPECIFIC MEDICINE ================= */

    for (
        let i = 0;
        i < medicines.length;
        i++
    ) {

        const medicineName =
            medicines[i].medicineName
                .toLowerCase();


        if (
            question.includes(
                medicineName
            )
        ) {

            return getSpecificMedicineAnswer(
                medicines[i]
            );

        }

    }


    /* ================= HELP ================= */

    if (
        question.includes("help") ||
        question.includes("what can you do")
    ) {

        return "You can ask me what medicines you have, your next medicine, pending medicines, today's medicines, or the dosage and time of a specific medicine.";

    }


    /* ================= DEFAULT ================= */

    return "I can help with your medicine schedule. Try asking: What medicines do I have? What is my next medicine? Which medicines are pending? Or what medicines are scheduled today?";

}


/* ========================================================= */
/* ================= ALL MEDICINES ANSWER =================== */
/* ========================================================= */

function getAllMedicinesAnswer() {

    if (medicines.length === 1) {

        const medicine =
            medicines[0];

        return (
            "You have one medicine: " +
            medicine.medicineName +
            ", " +
            medicine.dosage +
            ", scheduled at " +
            formatTime(
                medicine.time
            ) +
            "."
        );

    }


    let answer =
        "You have " +
        medicines.length +
        " medicines. ";


    medicines.forEach(
        function (medicine, index) {

            answer +=
                (index + 1) +
                ". " +
                medicine.medicineName +
                ", " +
                medicine.dosage +
                ", at " +
                formatTime(
                    medicine.time
                ) +
                ". ";

        }
    );


    return answer;

}


/* ========================================================= */
/* ================= TODAY MEDICINES ======================== */
/* ========================================================= */

function getTodayMedicines() {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    return medicines.filter(
        function (medicine) {

            const startDate =
                new Date(
                    medicine.startDate
                );


            const endDate =
                new Date(
                    medicine.endDate
                );


            startDate.setHours(
                0,
                0,
                0,
                0
            );


            endDate.setHours(
                0,
                0,
                0,
                0
            );


            return (
                today >= startDate &&
                today <= endDate
            );

        }
    );

}


/* ========================================================= */
/* ================= TODAY ANSWER =========================== */
/* ========================================================= */

function getTodayMedicinesAnswer() {

    const todayMedicines =
        getTodayMedicines();


    if (
        todayMedicines.length === 0
    ) {

        return "You don't have any medicines scheduled for today.";

    }


    let answer =
        "You have " +
        todayMedicines.length +
        " medicine(s) scheduled today. ";


    todayMedicines.forEach(
        function (medicine, index) {

            answer +=
                (index + 1) +
                ". " +
                medicine.medicineName +
                " at " +
                formatTime(
                    medicine.time
                ) +
                ". ";

        }
    );


    return answer;

}


/* ========================================================= */
/* ================= NEXT MEDICINE ========================== */
/* ========================================================= */

function getNextMedicineAnswer() {

    const todayMedicines =
        getTodayMedicines();


    const activeMedicines =
        todayMedicines.filter(
            function (medicine) {

                return (
                    medicine.status !==
                    "Completed"
                );

            }
        );


    if (
        activeMedicines.length === 0
    ) {

        return "You don't have any pending medicines for today.";

    }


    const now =
        new Date();


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    let nextMedicine =
        null;


    let smallestDifference =
        Infinity;


    activeMedicines.forEach(
        function (medicine) {

            const medicineMinutes =
                timeToMinutes(
                    medicine.time
                );


            let difference =
                medicineMinutes -
                currentMinutes;


            if (difference < 0) {

                difference += 24 * 60;

            }


            if (
                difference <
                smallestDifference
            ) {

                smallestDifference =
                    difference;

                nextMedicine =
                    medicine;

            }

        }
    );


    if (!nextMedicine) {

        return "I couldn't find your next medicine.";

    }


    return (
        "Your next medicine is " +
        nextMedicine.medicineName +
        ". Take " +
        nextMedicine.dosage +
        " at " +
        formatTime(
            nextMedicine.time
        ) +
        "."
    );

}


/* ========================================================= */
/* ================= PENDING MEDICINES ====================== */
/* ========================================================= */

function getPendingMedicinesAnswer() {

    const todayMedicines =
        getTodayMedicines();


    const pendingMedicines =
        todayMedicines.filter(
            function (medicine) {

                return (
                    medicine.status !==
                    "Completed"
                );

            }
        );


    if (
        pendingMedicines.length === 0
    ) {

        return "You don't have any pending medicines for today. Great job!";

    }


    let answer =
        "You have " +
        pendingMedicines.length +
        " pending medicine(s). ";


    pendingMedicines.forEach(
        function (medicine, index) {

            answer +=
                (index + 1) +
                ". " +
                medicine.medicineName +
                " at " +
                formatTime(
                    medicine.time
                ) +
                ". ";

        }
    );


    return answer;

}


/* ========================================================= */
/* ================= TAKEN MEDICINES ======================== */
/* ========================================================= */

function getTakenMedicinesAnswer() {

    const takenMedicines =
        medicines.filter(
            function (medicine) {

                return (
                    medicine.status ===
                    "Completed"
                );

            }
        );


    if (
        takenMedicines.length === 0
    ) {

        return "You haven't marked any medicines as taken yet.";

    }


    let answer =
        "You have marked " +
        takenMedicines.length +
        " medicine(s) as taken. ";


    takenMedicines.forEach(
        function (medicine, index) {

            answer +=
                (index + 1) +
                ". " +
                medicine.medicineName +
                ". ";

        }
    );


    return answer;

}


/* ========================================================= */
/* ================= SPECIFIC MEDICINE ====================== */
/* ========================================================= */

function getSpecificMedicineAnswer(
    medicine
) {

    return (
        medicine.medicineName +
        " has a dosage of " +
        medicine.dosage +
        " and is scheduled at " +
        formatTime(
            medicine.time
        ) +
        ". The frequency is " +
        (
            medicine.frequency ||
            "Daily"
        ) +
        "."
    );

}


/* ========================================================= */
/* ================= SHOW VOICE RESPONSE ==================== */
/* ========================================================= */

function showVoiceResponse(
    answer
) {

    if (voiceAnswer) {

        voiceAnswer.textContent =
            answer;

    }

}


/* ========================================================= */
/* ================= SPEAK ANSWER =========================== */
/* ========================================================= */

function speakAnswer(answer) {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();


        const speech =
            new SpeechSynthesisUtterance(
                answer
            );


        speech.lang =
            "en-IN";

        speech.rate =
            0.95;

        speech.pitch =
            1;


        window.speechSynthesis.speak(
            speech
        );

    }

}


/* ========================================================= */
/* ================= TIME TO MINUTES ======================== */
/* ========================================================= */

function timeToMinutes(time) {

    if (!time) {
        return 0;
    }


    const parts =
        time.split(":");


    const hour =
        parseInt(parts[0], 10);


    const minute =
        parseInt(parts[1], 10);


    return (
        hour * 60 +
        minute
    );

}


/* ========================================================= */
/* ================= FORMAT TIME ============================= */
/* ========================================================= */

function formatTime(time) {

    if (!time) {
        return "";
    }


    const parts =
        time.split(":");


    let hour =
        parseInt(parts[0]);


    const minute =
        parts[1];


    const ampm =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {
        hour = 12;
    }


    return (
        hour +
        ":" +
        minute +
        " " +
        ampm
    );

}


/* ========================================================= */
/* ================= HTML SECURITY =========================== */
/* ========================================================= */

function escapeHtml(value) {

    if (!value) {
        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

});
