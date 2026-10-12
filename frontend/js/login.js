document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (email === "") {
            alert("Please enter your email.");
            return;
        }

        if (!email.includes("@")) {
            alert("Please enter a valid email.");
            return;
        }

        if (password === "") {
            alert("Please enter your password.");
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed");
                return;
            }

            // Save login information
            localStorage.setItem("lifeosLoggedIn", "true");
            localStorage.setItem("lifeosToken", data.token);
            localStorage.setItem("lifeosUserId", data.user.id);
            localStorage.setItem("lifeosUserName", data.user.name);
            localStorage.setItem("lifeosUserEmail", data.user.email);

            if (data.user.phone) {
                localStorage.setItem("lifeosUserPhone", data.user.phone);
            }

            alert("Login successful! Welcome to LifeOS AI.");

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            alert(
                "Cannot connect to server. Please make sure backend is running."
            );
        }

    });

});