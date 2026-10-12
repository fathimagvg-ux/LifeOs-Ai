// ================= AI ASSISTANT =================

document.addEventListener("DOMContentLoaded", function () {

    const form =
        document.getElementById("assistantForm");

    const input =
        document.getElementById("userQuestion");

    const response =
        document.getElementById("aiResponse");


    if (!form) {
        return;
    }


    form.addEventListener("submit", function (event) {

        event.preventDefault();


        const question =
            input.value.trim();


        if (question === "") {

            response.textContent =
                "Please enter a question.";

            return;
        }


        // Temporary frontend response

        response.textContent =
            "🤖 LifeOS AI: I received your question — \"" +
            question +
            "\". AI response will be connected to the backend later.";


        input.value = "";

    });

});