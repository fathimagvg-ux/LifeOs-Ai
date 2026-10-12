// ================= REGISTER =================

const registerForm = document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");

const createAccountButton =
    document.getElementById("createAccountButton");


registerForm.addEventListener("submit", async function (event) {

    // Stop page from refreshing
    event.preventDefault();


    // Get form values
    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const password =
        document.getElementById("password").value;


    // Clear old message
    registerMessage.textContent = "";

    registerMessage.className = "";


    // ================= VALIDATION =================

    if (!name || !email || !phone || !password) {

        registerMessage.textContent =
            "Please fill all fields.";

        registerMessage.className = "error";

        return;
    }


    if (password.length < 6) {

        registerMessage.textContent =
            "Password must contain at least 6 characters.";

        registerMessage.className = "error";

        return;
    }


    // ================= BUTTON LOADING =================

    createAccountButton.disabled = true;

    createAccountButton.textContent =
        "Creating Account...";


    try {

        // ================= BACKEND REQUEST =================

        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    name: name,

                    email: email,

                    phone: phone,

                    password: password

                })

            }
        );


        // Convert response to JSON
        const data = await response.json();


        // ================= SUCCESS =================

        if (response.ok) {

            registerMessage.textContent =
                "Registration successful! 🎉";

            registerMessage.className =
                "success";


            // Small delay
            setTimeout(function () {

                window.location.href =
                    "login.html";

            }, 1000);

        }


        // ================= ERROR =================

        else {

            registerMessage.textContent =
                data.message ||
                "Registration failed.";

            registerMessage.className =
                "error";


            createAccountButton.disabled =
                false;

            createAccountButton.textContent =
                "Create Account";

        }


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );


        registerMessage.textContent =
            "Cannot connect to backend. Please make sure the server is running.";

        registerMessage.className =
            "error";


        createAccountButton.disabled =
            false;

        createAccountButton.textContent =
            "Create Account";

    }

});