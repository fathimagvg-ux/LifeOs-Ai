// ================= DASHBOARD JS =================

// Get saved profile name
const savedName = localStorage.getItem("profileName");

// Show user's name
if (savedName) {

    const welcomeText = document.querySelector(".welcome-section h1");

    if (welcomeText) {

        welcomeText.innerText =
            "Hello, " + savedName + " 👋";

    }

}


// ================= MODULE CARD CLICK =================

// Get all dashboard module cards
const moduleCards =
    document.querySelectorAll(".module-card");


moduleCards.forEach(function(card) {

    card.addEventListener("click", function() {

        console.log(
            "Opening: " +
            card.querySelector("h3").innerText
        );

    });

});


// ================= DASHBOARD LOAD =================

document.addEventListener("DOMContentLoaded", function() {

    console.log("LifeOS AI Dashboard loaded successfully.");

});