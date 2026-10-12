// ================= EXPENSES & BILLS =================

document.addEventListener("DOMContentLoaded", function () {

const form =
    document.getElementById("expenseForm");

const expenseSection =
    document.querySelector(".expenses-section");

const expenseCount =
    document.getElementById("expenseCount");

const token =
    localStorage.getItem("lifeosToken");


// ================= LOGIN CHECK =================

if (!token) {

    alert("Please login first.");

    window.location.href = "login.html";

    return;
}


if (!form) {
    return;
}


// ================= LOAD EXPENSES =================

loadExpenses();


// ================= ADD EXPENSE =================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const expenseName =
            document
                .getElementById("expenseName")
                .value
                .trim();

        const amount =
            document
                .getElementById("expenseAmount")
                .value;

        const category =
            document
                .getElementById("expenseCategory")
                .value;

        const date =
            document
                .getElementById("expenseDate")
                .value;


        if (
            expenseName === "" ||
            amount === "" ||
            category === "" ||
            date === ""
        ) {

            alert(
                "Please fill all required fields."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/expenses",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token

                        },

                        body: JSON.stringify({

                            title:
                                expenseName,

                            amount:
                                Number(amount),

                            category:
                                category,

                            dueDate:
                                date,

                            status:
                                "Pending"

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to add expense."
                );

                return;
            }


            alert(
                "Expense added successfully! ✅"
            );


            form.reset();


            loadExpenses();


        } catch (error) {

            console.error(
                "ADD EXPENSE ERROR:",
                error
            );


            alert(
                "Unable to connect to server."
            );

        }

    }
);


// ================= LOAD EXPENSES =================

async function loadExpenses() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/expenses",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }
            );


        const expenses =
            await response.json();


        if (!response.ok) {

            alert(
                expenses.message ||
                "Failed to load expenses."
            );

            return;
        }


        displayExpenses(expenses);


    } catch (error) {

        console.error(
            "LOAD EXPENSES ERROR:",
            error
        );

    }

}


// ================= DISPLAY EXPENSES =================

function displayExpenses(expenses) {

    const oldCards =
        expenseSection.querySelectorAll(
            ".expense-card"
        );


    oldCards.forEach(
        function (card) {
            card.remove();
        }
    );


    const oldEmpty =
        expenseSection.querySelector(
            ".empty-expenses"
        );


    if (oldEmpty) {
        oldEmpty.remove();
    }


    // ================= COUNT =================

    expenseCount.textContent =
        expenses.length +
        (
            expenses.length === 1
                ? " Expense"
                : " Expenses"
        );


    // ================= NO EXPENSE =================

    if (expenses.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.className =
            "empty-expenses";

        emptyMessage.textContent =
            "No expenses added yet.";

        expenseSection.appendChild(
            emptyMessage
        );

        updateSummary([]);

        return;
    }


    // ================= CREATE CARDS =================

    expenses.forEach(
        function (expense) {

            const card =
                document.createElement("div");

            card.className =
                "expense-card";


            // ================= ICON =================

            let icon = "📌";


            if (expense.category === "Bill") {
                icon = "💡";
            }

            else if (
                expense.category === "Food"
            ) {
                icon = "🍔";
            }

            else if (
                expense.category === "Travel"
            ) {
                icon = "🚗";
            }

            else if (
                expense.category === "Shopping"
            ) {
                icon = "🛍️";
            }

            else if (
                expense.category === "Medicine"
            ) {
                icon = "💊";
            }

            else if (
                expense.category === "Subscription"
            ) {
                icon = "📱";
            }


            // ================= DATE =================

            const expenseDate =
                new Date(
                    expense.dueDate
                );


            const formattedDate =
                expenseDate.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


            // ================= STATUS =================

            const status =
                expense.status ||
                "Pending";


            card.innerHTML = `

                <div class="expense-icon">
                    ${icon}
                </div>


                <div class="expense-info">

                    <h3>
                        ${expense.title}
                    </h3>

                    <p>
                        ${expense.category}
                        •
                        ${formattedDate}
                    </p>

                </div>


                <div class="expense-amount">

                    <strong>
                        ₹${Number(
                            expense.amount
                        ).toLocaleString("en-IN")}
                    </strong>


                    <span>
                        ${status}
                    </span>


                    <button
                        class="status-button"
                        data-id="${expense._id}"
                        data-status="${status}">

                        ${
                            status === "Paid"
                                ? "Mark Pending"
                                : "Mark Paid"
                        }

                    </button>


                    <button
                        class="delete-expense"
                        data-id="${expense._id}">

                        Delete

                    </button>

                </div>

            `;


            expenseSection.appendChild(
                card
            );

        }
    );


    updateSummary(expenses);


    addButtonEvents();

}


// ================= BUTTON EVENTS =================

function addButtonEvents() {

    const statusButtons =
        document.querySelectorAll(
            ".status-button"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-expense"
        );


    // ================= STATUS =================

    statusButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const id =
                        button.dataset.id;

                    const currentStatus =
                        button.dataset.status;


                    const newStatus =
                        currentStatus === "Paid"
                            ? "Pending"
                            : "Paid";


                    try {

                        const response =
                            await fetch(
                                "http://localhost:5000/api/expenses/" +
                                id,
                                {

                                    method: "PUT",

                                    headers: {

                                        "Content-Type":
                                            "application/json",

                                        "Authorization":
                                            "Bearer " +
                                            token

                                    },

                                    body:
                                        JSON.stringify({

                                            status:
                                                newStatus

                                        })

                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            alert(
                                data.message ||
                                "Failed to update status."
                            );

                            return;
                        }


                        loadExpenses();


                    } catch (error) {

                        console.error(
                            "STATUS UPDATE ERROR:",
                            error
                        );


                        alert(
                            "Unable to update expense."
                        );

                    }

                }
            );

        }
    );


    // ================= DELETE =================

    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const id =
                        button.dataset.id;


                    const confirmDelete =
                        confirm(
                            "Are you sure you want to delete this expense?"
                        );


                    if (!confirmDelete) {
                        return;
                    }


                    try {

                        const response =
                            await fetch(
                                "http://localhost:5000/api/expenses/" +
                                id,
                                {

                                    method: "DELETE",

                                    headers: {

                                        "Authorization":
                                            "Bearer " +
                                            token

                                    }

                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            alert(
                                data.message ||
                                "Failed to delete expense."
                            );

                            return;
                        }


                        alert(
                            "Expense deleted successfully."
                        );


                        loadExpenses();


                    } catch (error) {

                        console.error(
                            "DELETE EXPENSE ERROR:",
                            error
                        );


                        alert(
                            "Unable to delete expense."
                        );

                    }

                }
            );

        }
    );

}


// ================= SUMMARY =================

function updateSummary(expenses) {

    const summaryCards =
        document.querySelectorAll(
            ".summary-card"
        );


    if (summaryCards.length < 3) {
        return;
    }


    let monthlyTotal = 0;

    let upcomingBills = 0;

    let subscriptions = 0;


    // Today's date
    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    expenses.forEach(
        function (expense) {

            const amount =
                Number(
                    expense.amount
                ) || 0;


            const expenseDate =
                new Date(
                    expense.dueDate
                );


            expenseDate.setHours(
                0,
                0,
                0,
                0
            );


            // ================= MONTHLY EXPENSES =================

            if (
                expenseDate.getMonth() ===
                    today.getMonth() &&

                expenseDate.getFullYear() ===
                    today.getFullYear()
            ) {

                monthlyTotal += amount;

            }


            // ================= UPCOMING BILLS =================

            /*
                Upcoming Bills includes only:

                1. Category = Bill
                2. Status = Pending
                3. Due date is after today
            */

            if (
                expense.category === "Bill" &&

                expense.status !== "Paid" &&

                expenseDate > today
            ) {

                upcomingBills += amount;

            }


            // ================= SUBSCRIPTIONS =================

            if (
                expense.category ===
                "Subscription"
            ) {

                subscriptions += amount;

            }

        }
    );


    // ================= UPDATE MONTHLY =================

    summaryCards[0]
        .querySelector("h2")
        .textContent =
        "₹" +
        monthlyTotal.toLocaleString(
            "en-IN"
        );


    // ================= UPDATE UPCOMING BILLS =================

    summaryCards[1]
        .querySelector("h2")
        .textContent =
        "₹" +
        upcomingBills.toLocaleString(
            "en-IN"
        );


    // ================= UPDATE SUBSCRIPTIONS =================

    summaryCards[2]
        .querySelector("h2")
        .textContent =
        "₹" +
        subscriptions.toLocaleString(
            "en-IN"
        );

}

});

