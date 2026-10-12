document.addEventListener("DOMContentLoaded", async function () {

const token = localStorage.getItem("lifeosToken");

if (!token) {
alert("Please login first.");
return;
}

try {

// =====================================================
// GET LIFE SCORE
// =====================================================

const scoreResponse = await fetch(
    "http://localhost:5000/api/life-score",
    {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    }
);


const scoreData = await scoreResponse.json();


if (!scoreResponse.ok) {
    throw new Error(
        scoreData.message || "Failed to load Life Score"
    );
}


// =====================================================
// GET LIFE POINTS FROM MONGODB
// =====================================================

const pointsResponse = await fetch(
    "http://localhost:5000/api/reminders/life-points",
    {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    }
);


const pointsData = await pointsResponse.json();


if (!pointsResponse.ok) {
    throw new Error(
        pointsData.message || "Failed to load Life Points"
    );
}


// =====================================================
// BASE SCORE
// =====================================================

const baseScore =
    Number(scoreData.lifeScore || 0);


// =====================================================
// LIFE POINTS
// =====================================================

const lifePoints =
    Number(pointsData.points || 0);


// =====================================================
// LIFE POINTS → SCORE BONUS
//
// Every 20 Life Points = +1 Life Score
// Maximum score = 100
// =====================================================

const pointsBonus =
    Math.floor(lifePoints / 20);


const finalScore =
    Math.min(
        100,
        baseScore + pointsBonus
    );


// =====================================================
// MAIN SCORE
// =====================================================

const scoreElement =
    document.querySelector(".score-number");


if (scoreElement) {

    scoreElement.textContent =
        finalScore;

}


// =====================================================
// STATUS
// =====================================================

const statusElement =
    document.querySelector(".score-status");


if (statusElement) {

    if (finalScore >= 90) {

        statusElement.textContent =
            "Excellent 🎉";

    } else if (finalScore >= 75) {

        statusElement.textContent =
            "Very Good 👍";

    } else if (finalScore >= 50) {

        statusElement.textContent =
            "Good 🙂";

    } else {

        statusElement.textContent =
            "Needs Improvement ⚠️";

    }

}


// =====================================================
// SCORE MESSAGE
// =====================================================

const messageElement =
    document.querySelector(".score-message");


if (messageElement) {

    messageElement.textContent =
        "You have completed " +
        scoreData.completedReminders +
        " out of " +
        scoreData.totalReminders +
        " reminders and earned " +
        lifePoints +
        " Life Points ⭐.";

}


// =====================================================
// REMINDER AREA SCORE
// =====================================================

const areaScores =
    document.querySelectorAll(".area-score");


const progressBars =
    document.querySelectorAll(".progress-bar");


if (areaScores[3]) {

    areaScores[3].textContent =
        finalScore + "%";

}


if (progressBars[3]) {

    progressBars[3].style.width =
        finalScore + "%";

}


// =====================================================
// AI LIFE INSIGHT
// =====================================================

const aiHeading =
    document.querySelector(".ai-box h2");


const aiText =
    document.querySelector(".ai-insight-text");


if (aiHeading) {

    if (lifePoints === 0) {

        aiHeading.textContent =
            "Start earning Life Points 🚀";

    } else if (lifePoints < 100) {

        aiHeading.textContent =
            "You're making progress! 🌱";

    } else if (lifePoints < 250) {

        aiHeading.textContent =
            "Great productivity! 🔥";

    } else {

        aiHeading.textContent =
            "You're on a strong streak! 🏆";

    }

}


if (aiText) {

    aiText.textContent =
        "Your Life Score combines your reminder activity " +
        "with the Life Points you earn from completing " +
        "challenges and reminders. You currently have " +
        lifePoints +
        " Life Points ⭐.";

}


// =====================================================
// CONSOLE
// =====================================================

console.log(
    "BASE LIFE SCORE:",
    baseScore
);

console.log(
    "LIFE POINTS:",
    lifePoints
);

console.log(
    "LIFE POINT BONUS:",
    pointsBonus
);

console.log(
    "FINAL LIFE SCORE:",
    finalScore
);

} catch (error) {

console.error(
    "LIFE SCORE ERROR:",
    error
);


alert(
    "Unable to load Life Score. Please check the backend."
);

}

});