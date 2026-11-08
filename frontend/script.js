const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const expenseIdInput = document.getElementById("expense-id");
const submitButton = document.getElementById("submit-button");
const API_URL = "https://qkuy0vdnh5.execute-api.eu-north-1.amazonaws.com/prod/expenses";
let expenses = [];

function loadExpenses() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error("Failed to load expenses");
            return response.json();
        })
        .then(data => {
            expenses = data.map(expense => ({ ...expense, amount: Number(expense.amount) }));
            displayExpenses();
            updateDashboard();
        })
        .catch(error => {
            console.error(error);
            alert("Could not load expenses from AWS.");
        });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    const description = document.getElementById("description").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const expenseID = expenseIdInput.value;
    const expense = { description, amount, category, date };
    const method = expenseID ? "PUT" : "POST";
    if (expenseID) expense.expenseID = expenseID;

    fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
    })
    .then(response => {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
    })
    .then(() => {
        alert(expenseID ? "Expense updated successfully!" : "Expense saved successfully!");
        form.reset();
        expenseIdInput.value = "";
        submitButton.textContent = "Add Expense";
        loadExpenses();
    })
    .catch(error => {
        console.error(error);
        alert("Failed to save expense.");
    });
});

function displayExpenses() {
    expenseList.innerHTML = "";
    expenses.forEach(expense => {
        const li = document.createElement("li");
        li.textContent = `${expense.description} - ₹${expense.amount.toFixed(2)} - ${expense.category} - ${expense.date}`;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = function() {
            document.getElementById("description").value = expense.description;
            document.getElementById("amount").value = expense.amount;
            document.getElementById("category").value = expense.category;
            document.getElementById("date").value = expense.date;
            expenseIdInput.value = expense.expenseID;
            submitButton.textContent = "Update Expense";
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function() {
            if (!confirm("Are you sure you want to delete this expense?")) return;
            fetch(API_URL, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expenseID: expense.expenseID })
            })
            .then(response => {
                if (!response.ok) throw new Error("Delete failed");
                alert("Expense deleted successfully!");
                loadExpenses();
            })
            .catch(error => {
                console.error(error);
                alert("Failed to delete expense.");
            });
        };
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        expenseList.appendChild(li);
    });
}

function updateDashboard() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById("total").textContent = `₹${total.toFixed(2)}`;
    document.getElementById("transaction-count").textContent = expenses.length;
    const highest = expenses.length ? Math.max(...expenses.map(expense => expense.amount)) : 0;
    document.getElementById("highest-expense").textContent = `₹${highest.toFixed(2)}`;

    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    const summary = document.getElementById("category-summary");
    summary.innerHTML = "";
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        const item = document.createElement("div");
        item.className = "category-item";
        const label = document.createElement("p");
        label.textContent = `${category}: ₹${amount.toFixed(2)} (${percentage.toFixed(1)}%)`;
        const bar = document.createElement("div");
        bar.className = "progress-bar";
        const fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = `${percentage}%`;
        bar.appendChild(fill);
        item.appendChild(label);
        item.appendChild(bar);
        summary.appendChild(item);
    });
    if (expenses.length === 0) summary.textContent = "No expenses recorded yet.";
}

loadExpenses();
