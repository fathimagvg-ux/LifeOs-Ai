document.addEventListener("DOMContentLoaded", function () {

    const profileForm = document.getElementById("profileForm");

    const nameInput = document.getElementById("profileName");
    const emailInput = document.getElementById("profileEmail");
    const phoneInput = document.getElementById("profilePhone");

    const userId = localStorage.getItem("lifeosUserId");


    // ================= CHECK LOGIN =================

    if (!userId) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    // ================= LOAD PROFILE =================

    async function loadProfile() {

        try {

            const response = await fetch(
                `http://localhost:5000/api/profile/${userId}`
            );

            const data = await response.json();


            if (!response.ok) {

                alert(data.message || "Failed to load profile");

                return;
            }


            const user = data.user;


            nameInput.value = user.name || "";

            emailInput.value = user.email || "";

            phoneInput.value = user.phone || "";


        } catch (error) {

            console.error("PROFILE LOAD ERROR:", error);

            alert(
                "Cannot connect to server. Please make sure backend is running."
            );

        }

    }


    // ================= SAVE PROFILE =================

    profileForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const name = nameInput.value.trim();

        const email = emailInput.value.trim();

        const phone = phoneInput.value.trim();


        if (name === "") {

            alert("Please enter your name.");

            nameInput.focus();

            return;
        }


        if (email === "") {

            alert("Please enter your email.");

            emailInput.focus();

            return;
        }


        if (!email.includes("@")) {

            alert("Please enter a valid email.");

            emailInput.focus();

            return;
        }


        try {

            const response = await fetch(

                `http://localhost:5000/api/profile/${userId}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        phone: phone

                    })

                }

            );


            const data = await response.json();


            if (!response.ok) {

                alert(data.message || "Profile update failed");

                return;
            }


            // Update localStorage

            localStorage.setItem(
                "lifeosUserName",
                data.user.name
            );

            localStorage.setItem(
                "lifeosUserEmail",
                data.user.email
            );

            localStorage.setItem(
                "lifeosUserPhone",
                data.user.phone || ""
            );


            alert("Profile updated successfully! ✅");


        } catch (error) {

            console.error("PROFILE UPDATE ERROR:", error);

            alert(
                "Cannot connect to server. Please make sure backend is running."
            );

        }

    });


    // Load user data when page opens

    loadProfile();

});