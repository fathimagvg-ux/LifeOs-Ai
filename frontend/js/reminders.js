/* =========================================================
LIFEOS AI - SMART REMINDER SYSTEM
FULL GAMIFIED VERSION

Reminder
Countdown
Notification
Alarm
AI Motivation
5-Minute Challenge
Timer
Life Points
Progress Roadmap

LIFE POINTS:
Challenge = +20 points
Main Reminder = +100 points

IMPORTANT:
Life Points are saved in MongoDB through backend APIs.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

// =========================================================
// ELEMENTS
// =========================================================

const reminderForm =
    document.getElementById("reminderForm");

const reminderList =
    document.getElementById("reminderList");

const reminderCount =
    document.getElementById("reminderCount");

const challengeModal =
    document.getElementById("challengeModal");

const closeChallenge =
    document.getElementById("closeChallenge");

const challengeTask =
    document.getElementById("challengeTask");

const motivationText =
    document.getElementById("motivationText");

const challengeText =
    document.getElementById("challengeText");

const challengeTimer =
    document.getElementById("challengeTimer");

const timerProgressBar =
    document.getElementById("timerProgressBar");

const startTimerButton =
    document.getElementById("startTimerButton");

const resetTimerButton =
    document.getElementById("resetTimerButton");

const challengeCompleteBox =
    document.getElementById("challengeCompleteBox");

const finishChallengeButton =
    document.getElementById("finishChallengeButton");

const lifePointsElement =
    document.getElementById("lifePoints");


// =========================================================
// VARIABLES
// =========================================================

let editingId = null;

let allReminders = [];

let currentChallengeReminder = null;

let timerInterval = null;

let remainingSeconds = 300;

const TOTAL_SECONDS = 300;


// =========================================================
// TOKEN
// =========================================================

function getToken() {

    return localStorage.getItem("lifeosToken");

}


// =========================================================
// LIFE POINTS - LOCAL DISPLAY
// =========================================================

function getLifePoints() {

    return Number(
        localStorage.getItem("lifeosLifePoints") || 0
    );

}


function saveLifePoints(points) {

    localStorage.setItem(
        "lifeosLifePoints",
        String(points)
    );

    updateLifePointsUI();

    updateRoadmap();

}


function addLifePoints(points) {

    const current =
        getLifePoints();

    saveLifePoints(
        current + points
    );

}


function updateLifePointsUI() {

    if (!lifePointsElement)
        return;

    lifePointsElement.innerText =
        getLifePoints();

}


// =========================================================
// LOAD LIFE POINTS FROM MONGODB
// =========================================================

async function loadLifePoints() {

    const token =
        getToken();


    if (!token)
        return;


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/reminders/life-points",
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

            console.error(
                "LOAD LIFE POINTS ERROR:",
                data.message
            );

            return;

        }


        const points =
            Number(
                data.points || 0
            );


        saveLifePoints(points);


    } catch (error) {

        console.error(
            "LOAD LIFE POINTS ERROR:",
            error
        );

    }

}


// =========================================================
// ADD POINTS TO MONGODB
// =========================================================

async function addPointsToBackend(
    points,
    type,
    reminderId
) {

    const token =
        getToken();


    if (!token)
        return false;


    try {

        const endpoint =
            type === "challenge"
                ? "/challenge-complete"
                : "/complete";


        const response =
            await fetch(
                "http://localhost:5000/api/reminders/" +
                reminderId +
                endpoint,
                {
                    method:
                        type === "challenge"
                            ? "POST"
                            : "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "POINTS BACKEND ERROR:",
                data.message
            );

            return false;

        }


        const totalPoints =
            Number(
                data.totalLifePoints ||
                getLifePoints() + points
            );


        saveLifePoints(
            totalPoints
        );


        return true;


    } catch (error) {

        console.error(
            "POINTS CONNECTION ERROR:",
            error
        );

        return false;

    }

}


// =========================================================
// CATEGORY ICON
// =========================================================

function getCategoryIcon(category) {

    if (category === "Bill")
        return "💰";

    if (category === "Document")
        return "📄";

    if (category === "Vehicle")
        return "🚗";

    if (category === "Medicine")
        return "💊";

    return "📌";

}


// =========================================================
// PRIORITY CLASS
// =========================================================

function getPriorityClass(priority) {

    if (priority === "High")
        return "high";

    if (priority === "Medium")
        return "medium";

    return "low";

}


// =========================================================
// LOAD REMINDERS
// =========================================================

async function loadReminders() {

    const token =
        getToken();


    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;

    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/reminders",
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
                "Failed to load reminders."
            );

            return;

        }


        allReminders =
            data;


        displayReminders(data);

        updateSmartReminders();

        updateRoadmap();


    } catch (error) {

        console.error(
            "LOAD REMINDERS ERROR:",
            error
        );

        alert(
            "Cannot connect to backend. Please make sure server is running."
        );

    }

}


// =========================================================
// ADD / UPDATE REMINDER
// =========================================================

if (reminderForm) {

    reminderForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("reminderName")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value;


            const date =
                document
                    .getElementById("reminderDate")
                    .value;


            const dueTimeElement =
                document.getElementById("dueTime");


            const dueTime =
                dueTimeElement
                    ? dueTimeElement.value
                    : "";


            const estimatedElement =
                document.getElementById(
                    "estimatedCompletionDate"
                );


            const estimatedCompletionDate =
                estimatedElement
                    ? estimatedElement.value
                    : "";


            const earlyElement =
                document.getElementById(
                    "earlyReminderDays"
                );


            const earlyReminderDays =
                earlyElement
                    ? Number(earlyElement.value)
                    : 7;


            const alarmElement =
                document.getElementById(
                    "alarmEnabled"
                );


            const alarmEnabled =
                alarmElement
                    ? alarmElement.value === "true"
                    : true;


            const priority =
                document
                    .getElementById("priority")
                    .value;


            if (
                name === "" ||
                category === "" ||
                date === ""
            ) {

                alert(
                    "Please fill all reminder details."
                );

                return;

            }


            const token =
                getToken();


            if (!token) {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;

            }


            requestNotificationPermission();


            try {

                let url =
                    "http://localhost:5000/api/reminders";


                let method =
                    "POST";


                if (editingId) {

                    url =
                        "http://localhost:5000/api/reminders/" +
                        editingId;

                    method =
                        "PUT";

                }


                const response =
                    await fetch(
                        url,
                        {
                            method: method,

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token
                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    category:
                                        category,

                                    date:
                                        date,

                                    dueTime:
                                        dueTime,

                                    estimatedCompletionDate:
                                        estimatedCompletionDate,

                                    earlyReminderDays:
                                        earlyReminderDays,

                                    alarmEnabled:
                                        alarmEnabled,

                                    priority:
                                        priority

                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Operation failed."
                    );

                    return;

                }


                if (editingId) {

                    alert(
                        "Smart reminder updated successfully! ✓"
                    );

                } else {

                    alert(
                        "Smart reminder added successfully! ✓"
                    );

                }


                editingId = null;


                const button =
                    reminderForm.querySelector(
                        ".add-button"
                    );


                if (button) {

                    button.innerText =
                        "+ Add Smart Reminder";

                }


                reminderForm.reset();

                loadReminders();


            } catch (error) {

                console.error(
                    "SAVE REMINDER ERROR:",
                    error
                );

                alert(
                    "Cannot connect to backend. Please make sure server is running."
                );

            }

        }
    );

}


// =========================================================
// DISPLAY REMINDERS
// =========================================================

function displayReminders(reminders) {

    if (!reminderList)
        return;


    reminderList.innerHTML = "";


    if (reminders.length === 0) {

        reminderList.innerHTML = `

            <div class="loading-card">

                <h3>
                    No reminders yet
                </h3>

                <p>
                    Add your first smart reminder above.
                </p>

            </div>

        `;


        if (reminderCount) {

            reminderCount.innerText =
                "0 Reminders";

        }


        return;

    }


    reminders.forEach(function (reminder) {

        const card =
            document.createElement("div");


        card.className =
            "reminder-card";


        if (reminder.completed) {

            card.classList.add("completed");

        }


        const countdown =
            getCountdownText(reminder);


        const estimatedText =
            reminder.estimatedCompletionDate
                ? formatDate(
                    reminder.estimatedCompletionDate
                )
                : "Not set";


        const dueTimeText =
            reminder.dueTime
                ? formatTime(reminder.dueTime)
                : "Time not set";


        card.innerHTML = `

            <div class="reminder-icon">

                ${getCategoryIcon(
                    reminder.category
                )}

            </div>


            <div class="reminder-info">

                <h3>
                    ${escapeHtml(
                        reminder.name
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        reminder.category
                    )}
                    reminder
                </p>

                <p>
                    🗓 Estimated completion:
                    <strong>
                        ${estimatedText}
                    </strong>
                </p>

            </div>


            <div class="reminder-date">

                <strong class="countdown-text">
                    ${countdown.text}
                </strong>

                <span>
                    ⏰ ${dueTimeText}
                </span>

                <span class="${getPriorityClass(
                    reminder.priority
                )}">

                    ${reminder.priority}
                    Priority

                </span>

            </div>


            <div class="reminder-actions">

                <button
                    type="button"
                    class="complete-btn"
                    data-id="${reminder._id}"
                    data-completed="${reminder.completed}"
                >

                    ${
                        reminder.completed
                            ? "✓ Completed"
                            : "✓ Complete"
                    }

                </button>


                <button
                    type="button"
                    class="edit-btn"
                    data-id="${reminder._id}"
                >

                    ✏️ Edit

                </button>


                <button
                    type="button"
                    class="delete-btn"
                    data-id="${reminder._id}"
                >

                    🗑 Delete

                </button>


                ${
                    !reminder.completed
                        ? `

                            <button
                                type="button"
                                class="motivation-btn"
                                data-id="${reminder._id}"
                            >

                                🤖 AI Motivation

                            </button>

                          `
                        : ""
                }

            </div>

        `;


        reminderList.appendChild(card);

    });


    if (reminderCount) {

        reminderCount.innerText =
            reminders.length +
            (
                reminders.length === 1
                    ? " Reminder"
                    : " Reminders"
            );

    }


    attachReminderEvents(reminders);

}


// =========================================================
// ATTACH EVENTS
// =========================================================

function attachReminderEvents(reminders) {

    document
        .querySelectorAll(".complete-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    toggleComplete(
                        button.dataset.id,
                        button.dataset.completed === "true"
                    );

                }
            );

        });


    document
        .querySelectorAll(".edit-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    editReminder(
                        button.dataset.id,
                        reminders
                    );

                }
            );

        });


    document
        .querySelectorAll(".delete-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    deleteReminder(
                        button.dataset.id,
                        reminders
                    );

                }
            );

        });


    document
        .querySelectorAll(".motivation-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const reminder =
                        reminders.find(
                            function (item) {

                                return (
                                    item._id ===
                                    button.dataset.id
                                );

                            }
                        );


                    if (reminder) {

                        generateAIMotivation(
                            reminder
                        );

                    }

                }
            );

        });

}


// =========================================================
// EDIT REMINDER
// =========================================================

function editReminder(id, reminders) {

    const reminder =
        reminders.find(
            function (item) {

                return item._id === id;

            }
        );


    if (!reminder)
        return;


    document.getElementById(
        "reminderName"
    ).value =
        reminder.name || "";


    document.getElementById(
        "category"
    ).value =
        reminder.category || "";


    document.getElementById(
        "reminderDate"
    ).value =
        formatInputDate(reminder.date);


    const dueTime =
        document.getElementById("dueTime");


    if (dueTime) {

        dueTime.value =
            reminder.dueTime || "";

    }


    const estimated =
        document.getElementById(
            "estimatedCompletionDate"
        );


    if (estimated) {

        estimated.value =
            reminder.estimatedCompletionDate
                ? formatInputDate(
                    reminder.estimatedCompletionDate
                )
                : "";

    }


    const early =
        document.getElementById(
            "earlyReminderDays"
        );


    if (early) {

        early.value =
            reminder.earlyReminderDays || 7;

    }


    const alarm =
        document.getElementById(
            "alarmEnabled"
        );


    if (alarm) {

        alarm.value =
            reminder.alarmEnabled === false
                ? "false"
                : "true";

    }


    document.getElementById(
        "priority"
    ).value =
        reminder.priority || "Medium";


    editingId =
        id;


    const button =
        reminderForm.querySelector(
            ".add-button"
        );


    if (button) {

        button.innerText =
            "Update Smart Reminder";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =========================================================
// COMPLETE / UNCOMPLETE
// =========================================================

async function toggleComplete(
    id,
    currentStatus
) {

    const token =
        getToken();


    if (!token) {

        alert("Please login first.");

        return;

    }


    try {

        // =================================================
        // MAIN REMINDER COMPLETION
        // =================================================

        if (!currentStatus) {

            const rewardKey =
                "completedReward_" + id;


            // Prevent duplicate +100
            if (
                localStorage.getItem(
                    rewardKey
                )
            ) {

                alert(
                    "This reminder has already received its reward."
                );

                return;

            }


            const success =
                await addPointsToBackend(
                    100,
                    "complete",
                    id
                );


            if (!success) {

                alert(
                    "Could not save Life Points. Please try again."
                );

                return;

            }


            localStorage.setItem(
                rewardKey,
                "true"
            );


            alert(
                "🏆 Mission Completed!\n\n" +
                "⭐ +100 Life Points"
            );


            await loadReminders();

            updateRoadmap();

            return;

        }


        // =================================================
        // UNCOMPLETE
        // =================================================

        const response =
            await fetch(
                "http://localhost:5000/api/reminders/" +
                id,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body:
                        JSON.stringify({

                            completed:
                                false

                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update reminder."
            );

            return;

        }


        await loadReminders();

        updateRoadmap();


    } catch (error) {

        console.error(
            "COMPLETE REMINDER ERROR:",
            error
        );

        alert(
            "Failed to update reminder."
        );

    }

}


// =========================================================
// DELETE
// =========================================================

async function deleteReminder(
    id,
    reminders
) {

    const reminder =
        reminders.find(
            function (item) {

                return item._id === id;

            }
        );


    const reminderName =
        reminder
            ? reminder.name
            : "this reminder";


    const confirmDelete =
        confirm(
            "Delete '" +
            reminderName +
            "' reminder?"
        );


    if (!confirmDelete)
        return;


    const token =
        getToken();


    if (!token) {

        alert("Please login first.");

        return;

    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/reminders/" +
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
                "Failed to delete reminder."
            );

            return;

        }


        alert(
            "Reminder deleted successfully!"
        );


        loadReminders();


    } catch (error) {

        console.error(
            "DELETE REMINDER ERROR:",
            error
        );

    }

}


// =========================================================
// COUNTDOWN
// =========================================================

function getCountdownText(reminder) {

    if (reminder.completed) {

        return {

            text: "✓ Completed",

            days: 0

        };

    }


    const dueDate =
        new Date(reminder.date);


    if (reminder.dueTime) {

        const parts =
            reminder.dueTime.split(":");


        if (parts.length >= 2) {

            dueDate.setHours(
                Number(parts[0]),
                Number(parts[1]),
                0,
                0
            );

        }

    } else {

        dueDate.setHours(
            23,
            59,
            59,
            999
        );

    }


    const now =
        new Date();


    const difference =
        dueDate - now;


    if (difference <= 0) {

        return {

            text: "Due Today",

            days: 0

        };

    }


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (days === 1) {

        return {

            text: "1 Day Remaining",

            days: 1

        };

    }


    return {

        text:
            days +
            " Days Remaining",

        days: days

    };

}


// =========================================================
// SMART NOTIFICATIONS
// =========================================================

function updateSmartReminders() {

    allReminders.forEach(
        function (reminder) {

            if (reminder.completed)
                return;


            const countdown =
                getCountdownText(reminder);


            const earlyDays =
                Number(
                    reminder.earlyReminderDays || 7
                );


            if (
                countdown.days > 0 &&
                countdown.days <= earlyDays
            ) {

                const key =
                    "lifeosReminder_" +
                    reminder._id +
                    "_" +
                    countdown.days;


                if (
                    !localStorage.getItem(key)
                ) {

                    localStorage.setItem(
                        key,
                        "true"
                    );


                    showBrowserNotification(
                        "⏰ LifeOS Smart Reminder",
                        reminder.name +
                        " — " +
                        countdown.text
                    );


                    if (
                        reminder.alarmEnabled !== false
                    ) {

                        playAlarm();

                    }

                }

            }


            if (countdown.days === 0) {

                const dueKey =
                    "lifeosDueToday_" +
                    reminder._id;


                if (
                    !localStorage.getItem(dueKey)
                ) {

                    localStorage.setItem(
                        dueKey,
                        "true"
                    );


                    showBrowserNotification(
                        "🚨 Due Today",
                        reminder.name +
                        " is due today."
                    );


                    if (
                        reminder.alarmEnabled !== false
                    ) {

                        playAlarm();

                    }

                }

            }

        }
    );

}


// =========================================================
// NOTIFICATION PERMISSION
// =========================================================

async function requestNotificationPermission() {

    if (!("Notification" in window))
        return;


    if (
        Notification.permission === "default"
    ) {

        try {

            await Notification.requestPermission();

        } catch (error) {

            console.log(error);

        }

    }

}


// =========================================================
// BROWSER NOTIFICATION
// =========================================================

function showBrowserNotification(
    title,
    message
) {

    if (!("Notification" in window))
        return;


    if (
        Notification.permission !== "granted"
    )
        return;


    try {

        new Notification(
            title,
            {
                body: message
            }
        );

    } catch (error) {

        console.log(error);

    }

}


// =========================================================
// ALARM
// =========================================================

function playAlarm() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext)
            return;


        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.setValueAtTime(
            800,
            audioContext.currentTime
        );


        oscillator.frequency.setValueAtTime(
            1000,
            audioContext.currentTime + 0.2
        );


        gain.gain.setValueAtTime(
            0.3,
            audioContext.currentTime
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime + 0.5
        );

    } catch (error) {

        console.log(
            "Alarm error:",
            error
        );

    }

}


// =========================================================
// FALLBACK AI MOTIVATION
// =========================================================

function getFallbackMotivation(reminder) {

    const task =
        reminder.name;


    return (
        "You can make progress on " +
        task +
        " by starting with one small step."
    );

}


// =========================================================
// FALLBACK 5-MINUTE CHALLENGE
// =========================================================

function getFallbackChallenge(reminder) {

    const task =
        reminder.name;


    const category =
        String(
            reminder.category || "Other"
        ).toLowerCase();


    if (category === "medicine") {

        return (
            "Spend 5 minutes checking your medicine schedule " +
            "for " +
            task +
            "."
        );

    }


    if (category === "vehicle") {

        return (
            "Spend 5 minutes checking the service or maintenance " +
            "details related to " +
            task +
            "."
        );

    }


    if (category === "bill") {

        return (
            "Spend 5 minutes checking the amount, due date " +
            "and payment details for " +
            task +
            "."
        );

    }


    if (category === "document") {

        return (
            "Spend 5 minutes opening " +
            task +
            " and checking what information or work is still needed."
        );

    }


    return (
        "Spend 5 minutes working on the smallest unfinished part of " +
        task +
        "."
    );

}


// =========================================================
// CHECK WHETHER AI RESPONSE IS RELATED
// =========================================================

function isAIResponseRelevant(
    motivation,
    challenge,
    reminder
) {

    const fullText =
        (
            String(motivation || "") +
            " " +
            String(challenge || "")
        ).toLowerCase();


    const category =
        String(
            reminder.category || "Other"
        ).toLowerCase();


    const task =
        String(
            reminder.name || ""
        ).toLowerCase();


    const wrongCategoryWords = {

        medicine: [
            "medicine",
            "medication",
            "tablet",
            "dose",
            "dosage",
            "pill"
        ],

        vehicle: [
            "vehicle",
            "bike",
            "car",
            "service",
            "engine"
        ],

        bill: [
            "bill",
            "payment",
            "electricity bill",
            "invoice"
        ],

        document: [
            "document",
            "passport",
            "certificate",
            "file"
        ]

    };


    const categories =
        Object.keys(
            wrongCategoryWords
        );


    for (
        let i = 0;
        i < categories.length;
        i++
    ) {

        const categoryName =
            categories[i];


        if (
            categoryName !== category
        ) {

            const words =
                wrongCategoryWords[
                    categoryName
                ];


            for (
                let j = 0;
                j < words.length;
                j++
            ) {

                if (
                    fullText.includes(
                        words[j]
                    )
                ) {

                    return false;

                }

            }

        }

    }


    if (
        String(challenge || "").trim() === ""
    ) {

        return false;

    }


    const actionWords = [
        "start",
        "work",
        "review",
        "check",
        "prepare",
        "practice",
        "read",
        "open",
        "write",
        "complete",
        "spend 5",
        "for 5 minutes"
    ];


    let hasAction =
        false;


    for (
        let i = 0;
        i < actionWords.length;
        i++
    ) {

        if (
            challenge
                .toLowerCase()
                .includes(
                    actionWords[i]
                )
        ) {

            hasAction = true;

            break;

        }

    }


    if (!hasAction) {

        return false;

    }


    const taskWords =
        task
            .split(/\s+/)
            .filter(function (word) {

                return word.length >= 4;

            });


    if (
        taskWords.length > 0
    ) {

        let taskConnection =
            false;


        for (
            let i = 0;
            i < taskWords.length;
            i++
        ) {

            if (
                fullText.includes(
                    taskWords[i]
                )
            ) {

                taskConnection = true;

                break;

            }

        }


        if (
            !taskConnection
        ) {

            if (
                category === "other"
            ) {

                return false;

            }

        }

    }


    return true;

}


// =========================================================
// AI MOTIVATION + CHALLENGE
// =========================================================

async function generateAIMotivation(
    reminder
) {

    const token =
        getToken();


    if (!token) {

        alert("Please login first.");

        return;

    }


    currentChallengeReminder =
        reminder;


    openChallengeModal(reminder);


    motivationText.innerText =
        "🤖 LifeOS AI is preparing your personalized challenge...";


    challengeText.innerText =
        "Please wait while Ollama creates your 5-minute mission.";


    try {

        const taskName =
            String(
                reminder.name || ""
            ).trim();


        const category =
            String(
                reminder.category || "Other"
            ).trim();


        const dueDate =
            formatDate(
                reminder.date
            );


        const dueTime =
            reminder.dueTime ||
            "Not specified";


        const estimatedCompletion =
            reminder.estimatedCompletionDate
                ? formatDate(
                    reminder.estimatedCompletionDate
                )
                : "Not specified";


        const priority =
            reminder.priority ||
            "Medium";


        const prompt =

`
You are the LifeOS AI productivity assistant.

IMPORTANT:
You MUST talk ONLY about the exact reminder below.

EXACT REMINDER TASK:
${taskName}

EXACT CATEGORY:
${category}

DUE DATE:
${dueDate}

DUE TIME:
${dueTime}

ESTIMATED COMPLETION:
${estimatedCompletion}

PRIORITY:
${priority}

RULES:

1. The user's actual task is "${taskName}".
2. Never replace the task with another task.
3. Never invent another activity.
4. The motivation must encourage the user to work on "${taskName}".
5. The 5-minute challenge must be a tiny first step for "${taskName}".
6. The challenge must be possible to start within 5 minutes.
7. Do NOT mention medicine unless the exact category is Medicine.
8. Do NOT mention tablets, doses or medication unless the exact category is Medicine.
9. Do NOT mention vehicles, bikes or cars unless the exact category is Vehicle.
10. Do NOT mention bills or payments unless the exact category is Bill.
11. Do NOT mention documents or passports unless the exact category is Document.
12. Do NOT give medical advice.
13. Do NOT give legal advice.
14. Do NOT give financial advice.
15. Do NOT give generic unrelated advice.
16. Do NOT change the reminder task.
17. Keep both answers very short.

Return EXACTLY this format:

MOTIVATION:
One short encouraging sentence about ${taskName}.

CHALLENGE:
One small action directly related to ${taskName} that can be done for 5 minutes.
`;

        const response =
            await fetch(
                "http://localhost:5000/api/ai-assistant",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body:
                        JSON.stringify({

                            question:
                                prompt,

                            mode:
                                "WHAT-NEXT"

                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "AI request failed"
            );

        }


        const aiMessage =
            data.aiMessage || "";


        parseAIResponse(
            aiMessage,
            reminder
        );


    } catch (error) {

        console.error(
            "AI MOTIVATION ERROR:",
            error
        );


        motivationText.innerText =
            getFallbackMotivation(
                reminder
            );


        challengeText.innerText =
            getFallbackChallenge(
                reminder
            );

    }

}


// =========================================================
// PARSE AI RESPONSE
// =========================================================

function parseAIResponse(
    message,
    reminder
) {

    let motivation = "";

    let challenge = "";


    const upper =
        String(message || "")
            .toUpperCase();


    const motivationIndex =
        upper.indexOf(
            "MOTIVATION:"
        );


    const challengeIndex =
        upper.indexOf(
            "CHALLENGE:"
        );


    if (
        motivationIndex !== -1 &&
        challengeIndex !== -1
    ) {

        motivation =
            String(message)
                .substring(
                    motivationIndex +
                    "MOTIVATION:".length,
                    challengeIndex
                )
                .trim();


        challenge =
            String(message)
                .substring(
                    challengeIndex +
                    "CHALLENGE:".length
                )
                .trim();

    }


    motivation =
        motivation
            .replace(/^["'\s]+|["'\s]+$/g, "")
            .trim();


    challenge =
        challenge
            .replace(/^["'\s]+|["'\s]+$/g, "")
            .trim();


    const valid =
        isAIResponseRelevant(
            motivation,
            challenge,
            reminder
        );


    if (!valid) {

        console.warn(
            "AI response was unrelated. Using LifeOS safe fallback."
        );


        motivation =
            getFallbackMotivation(
                reminder
            );


        challenge =
            getFallbackChallenge(
                reminder
            );

    }


    motivationText.innerText =
        motivation ||
        getFallbackMotivation(
            reminder
        );


    challengeText.innerText =
        challenge ||
        getFallbackChallenge(
            reminder
        );


    challengeTask.innerText =
        reminder.name;

}


// =========================================================
// OPEN CHALLENGE
// =========================================================

function openChallengeModal(
    reminder
) {

    if (!challengeModal)
        return;


    challengeTask.innerText =
        reminder.name;


    resetChallengeTimer();


    if (challengeCompleteBox) {

        challengeCompleteBox.classList.remove(
            "show"
        );

    }


    const timerSection =
        document.getElementById(
            "timerSection"
        );


    if (timerSection) {

        timerSection.style.display =
            "block";

    }


    challengeModal.classList.add(
        "show"
    );

}


// =========================================================
// CLOSE CHALLENGE
// =========================================================

function closeChallengeModal() {

    stopTimer();


    if (challengeModal) {

        challengeModal.classList.remove(
            "show"
        );

    }

}


if (closeChallenge) {

    closeChallenge.addEventListener(
        "click",
        closeChallengeModal
    );

}


if (challengeModal) {

    challengeModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                challengeModal
            ) {

                closeChallengeModal();

            }

        }
    );

}


// =========================================================
// TIMER
// =========================================================

function startTimer() {

    if (timerInterval)
        return;


    if (startTimerButton) {

        startTimerButton.innerText =
            "⏳ Challenge Running...";

    }


    timerInterval =
        setInterval(
            function () {

                remainingSeconds--;

                updateTimerUI();


                if (
                    remainingSeconds <= 0
                ) {

                    finishTimer();

                }

            },
            1000
        );

}


function stopTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;

    }

}


function resetChallengeTimer() {

    stopTimer();


    remainingSeconds =
        TOTAL_SECONDS;


    updateTimerUI();


    if (startTimerButton) {

        startTimerButton.innerText =
            "▶ Start Challenge";

    }


    if (challengeCompleteBox) {

        challengeCompleteBox.classList.remove(
            "show"
        );

    }


    const timerSection =
        document.getElementById(
            "timerSection"
        );


    if (timerSection) {

        timerSection.style.display =
            "block";

    }

}


function updateTimerUI() {

    if (!challengeTimer)
        return;


    const minutes =
        Math.floor(
            remainingSeconds / 60
        );


    const seconds =
        remainingSeconds % 60;


    challengeTimer.innerText =
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(seconds)
            .padStart(2, "0");


    const completed =
        TOTAL_SECONDS -
        remainingSeconds;


    const percentage =
        (
            completed /
            TOTAL_SECONDS
        ) * 100;


    if (timerProgressBar) {

        timerProgressBar.style.width =
            percentage + "%";

    }

}


// =========================================================
// FINISH TIMER +20 POINTS
// =========================================================

async function finishTimer() {

    stopTimer();


    remainingSeconds = 0;


    updateTimerUI();


    playAlarm();


    showBrowserNotification(
        "🎉 Challenge Complete!",
        "You completed your 5-minute LifeOS mission."
    );


    const reminder =
        currentChallengeReminder;


    if (!reminder) {

        return;

    }


    const rewardKey =
        "challengeReward_" +
        reminder._id;


    // Prevent duplicate challenge reward
    if (
        localStorage.getItem(
            rewardKey
        )
    ) {

        showChallengeComplete();

        updateRoadmap();

        return;

    }


    const success =
        await addPointsToBackend(
            20,
            "challenge",
            reminder._id
        );


    if (success) {

        localStorage.setItem(
            rewardKey,
            "true"
        );


        alert(
            "🎯 Challenge Complete!\n\n" +
            "⭐ +20 Life Points"
        );


        updateRoadmap();

    } else {

        alert(
            "Challenge completed, but Life Points could not be saved. Please try again."
        );

    }


    showChallengeComplete();

}


function showChallengeComplete() {

    const timerSection =
        document.getElementById(
            "timerSection"
        );


    if (timerSection) {

        timerSection.style.display =
            "none";

    }


    if (challengeCompleteBox) {

        challengeCompleteBox.classList.add(
            "show"
        );

    }

}


if (startTimerButton) {

    startTimerButton.addEventListener(
        "click",
        startTimer
    );

}


if (resetTimerButton) {

    resetTimerButton.addEventListener(
        "click",
        resetChallengeTimer
    );

}


if (finishChallengeButton) {

    finishChallengeButton.addEventListener(
        "click",
        function () {

            closeChallengeModal();

        }
    );

}


// =========================================================
// ROADMAP
// =========================================================
//
// FLOW:
//
// Started
//    ↓
// Working
//    ↓
// Almost Done
//    ↓
// Completed
//
// Challenge completed = Working
// Reminder completed = Almost Done
// All reminders completed = Completed
//
// roadmap-line elements are automatically activated.
// =========================================================

function updateRoadmap() {

    const started =
        document.getElementById(
            "roadmapStarted"
        );

    const working =
        document.getElementById(
            "roadmapWorking"
        );

    const almost =
        document.getElementById(
            "roadmapAlmost"
        );

    const completed =
        document.getElementById(
            "roadmapCompleted"
        );


    if (
        !started ||
        !working ||
        !almost ||
        !completed
    ) {

        return;

    }


    // -----------------------------------------------------
    // RESET ALL ROADMAP STEPS
    // -----------------------------------------------------

    started.classList.remove("active");

    working.classList.remove("active");

    almost.classList.remove("active");

    completed.classList.remove("active");


    // -----------------------------------------------------
    // RESET ALL ROADMAP LINES
    // -----------------------------------------------------

    const roadmapLines =
        document.querySelectorAll(
            ".roadmap-line"
        );


    roadmapLines.forEach(
        function (line) {

            line.classList.remove(
                "active"
            );

        }
    );


    // -----------------------------------------------------
    // NO REMINDERS
    // -----------------------------------------------------

    if (
        allReminders.length === 0
    ) {

        return;

    }


    // -----------------------------------------------------
    // STARTED
    // -----------------------------------------------------
    //
    // At least one reminder exists.
    // -----------------------------------------------------

    started.classList.add(
        "active"
    );


    // -----------------------------------------------------
    // CHECK CHALLENGE PROGRESS
    // -----------------------------------------------------

    const hasWorking =
        allReminders.some(
            function (reminder) {

                const challengeKey =
                    "challengeReward_" +
                    reminder._id;


                return Boolean(
                    localStorage.getItem(
                        challengeKey
                    )
                );

            }
        );


    // -----------------------------------------------------
    // CHECK REMINDER COMPLETION
    // -----------------------------------------------------

    const completedCount =
        allReminders.filter(
            function (reminder) {

                return reminder.completed;

            }
        ).length;


    const hasAlmostDone =
        completedCount > 0;


    // -----------------------------------------------------
    // CHECK ALL COMPLETED
    // -----------------------------------------------------

    const allCompleted =
        allReminders.every(
            function (reminder) {

                return reminder.completed;

            }
        );


    // -----------------------------------------------------
    // WORKING
    // -----------------------------------------------------

    if (hasWorking) {

        working.classList.add(
            "active"
        );


        // First line:
        // Started → Working

        if (roadmapLines[0]) {

            roadmapLines[0].classList.add(
                "active"
            );

        }

    }


    // -----------------------------------------------------
    // ALMOST DONE
    // -----------------------------------------------------

    if (hasAlmostDone) {

        almost.classList.add(
            "active"
        );


        // Second line:
        // Working → Almost Done

        if (roadmapLines[1]) {

            roadmapLines[1].classList.add(
                "active"
            );

        }

    }


    // -----------------------------------------------------
    // COMPLETED
    // -----------------------------------------------------

    if (allCompleted) {

        completed.classList.add(
            "active"
        );


        // Third line:
        // Almost Done → Completed

        if (roadmapLines[2]) {

            roadmapLines[2].classList.add(
                "active"
            );

        }

    }

}


// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(dateString) {

    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not set";

    }


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const year =
        date.getFullYear();


    return (
        day +
        "/" +
        month +
        "/" +
        year
    );

}


// =========================================================
// TIME FORMAT
// =========================================================

function formatTime(timeString) {

    if (!timeString)
        return "Time not set";


    const parts =
        timeString.split(":");


    if (parts.length < 2)
        return timeString;


    let hour =
        Number(parts[0]);


    const minute =
        parts[1];


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return (
        hour +
        ":" +
        minute +
        " " +
        period
    );

}


// =========================================================
// INPUT DATE FORMAT
// =========================================================

function formatInputDate(dateString) {

    if (!dateString)
        return "";


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    )
        return "";


    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );

}


// =========================================================
// HTML SECURITY
// =========================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


// =========================================================
// UPDATE COUNTDOWN EVERY MINUTE
// =========================================================

setInterval(
    function () {

        if (
            allReminders.length > 0
        ) {

            displayReminders(
                allReminders
            );

            updateSmartReminders();

            updateRoadmap();

        }

    },
    60000
);


// =========================================================
// START
// =========================================================

updateLifePointsUI();

loadLifePoints();

loadReminders();

});