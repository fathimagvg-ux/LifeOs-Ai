console.log("AI BRIEFING JS LOADED");
document.addEventListener("DOMContentLoaded", async function () {

const today = new Date();
const hour = today.getHours();

let greeting = "Good Evening";

if (hour < 12) {
    greeting = "Good Morning";
} else if (hour < 18) {
    greeting = "Good Afternoon";
}

const greetingElement = document.getElementById("greeting");
const dateElement = document.getElementById("todayDate");
const summaryElement = document.getElementById("summaryText");
const reminderContainer = document.getElementById("taskList");
const suggestionElement = document.getElementById("aiSuggestion");

if (greetingElement) {
    greetingElement.textContent = greeting;
}

if (dateElement) {
    dateElement.textContent = today.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

const token = localStorage.getItem("lifeosToken");

if (!token) {

    if (summaryElement) {
        summaryElement.textContent =
            "Please login first to view your AI Daily Briefing.";
    }

    if (reminderContainer) {
        reminderContainer.innerHTML =
            '<div class="no-task">Please login to load your reminders.</div>';
    }

    if (suggestionElement) {
        suggestionElement.textContent =
            "Please login to get your personalized suggestion.";
    }

    return;
}

try {

    const response = await fetch(
        "http://localhost:5000/api/ai-briefing",
        {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    );

    const data = await response.json();

    if (response.status === 401) {

        if (summaryElement) {
            summaryElement.textContent =
                "Session expired. Please login again.";
        }

        if (reminderContainer) {
            reminderContainer.innerHTML =
                '<div class="no-task">Please login again to load your reminders.</div>';
        }

        if (suggestionElement) {
            suggestionElement.textContent =
                "Please login again.";
        }

        return;
    }

    if (!response.ok) {
        throw new Error(
            data.message || "AI briefing request failed"
        );
    }

    if (summaryElement) {
        summaryElement.textContent =
            data.aiMessage ||
            "Your daily briefing is ready.";
    }

    if (!reminderContainer) {
        return;
    }

    reminderContainer.innerHTML = "";

    if (!data.reminders || data.reminders.length === 0) {

        reminderContainer.innerHTML =
            '<div class="no-task">' +
            '<h3>No Pending Reminders</h3>' +
            '<p>You have completed all your reminders.</p>' +
            '</div>';

    } else {

        data.reminders.forEach(function (reminder) {

            const task = document.createElement("div");

            task.className = "task";

            const taskLeft = document.createElement("div");
            taskLeft.className = "task-left";

            const icon = document.createElement("div");
            icon.className = "task-icon";
            icon.textContent = "📌";

            const taskInfo = document.createElement("div");
            taskInfo.className = "task-info";

            const name = document.createElement("h3");
            name.textContent =
                reminder.name || "Reminder";

            const details = document.createElement("p");
            details.textContent =
                (reminder.category || "Reminder") +
                " • " +
                (reminder.priority || "Normal") +
                " Priority";

            const time = document.createElement("div");
            time.className = "task-time";
            time.textContent =
                reminder.timing || "";

            taskInfo.appendChild(name);
            taskInfo.appendChild(details);

            taskLeft.appendChild(icon);
            taskLeft.appendChild(taskInfo);

            task.appendChild(taskLeft);
            task.appendChild(time);

            reminderContainer.appendChild(task);
        });
    }

    const total =
        Number(data.totalReminders) || 0;

    if (suggestionElement) {

        if (total > 0) {

            suggestionElement.textContent =
                "You have " +
                total +
                " pending reminder" +
                (total > 1 ? "s" : "") +
                ". Stay organized and complete your important tasks on time.";

        } else {

            suggestionElement.textContent =
                "You have no pending reminders. Enjoy your day.";
        }
    }

} catch (error) {

    console.error(
        "AI DAILY BRIEFING ERROR:",
        error
    );

    if (summaryElement) {
        summaryElement.textContent =
            "Unable to load the AI Daily Briefing.";
    }

    if (reminderContainer) {
        reminderContainer.innerHTML =
            '<div class="no-task">' +
            'Unable to load reminders. Please check the backend.' +
            '</div>';
    }

    if (suggestionElement) {
        suggestionElement.textContent =
            "Please check the LifeOS AI backend.";
    }
}


});
