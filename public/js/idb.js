// Variable to hold connection
let db;

// Acts as event listener for db
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new-budget', { autoIncrement: true });
};

// Successful request
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// Save new budget if there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');
    budgetObjectStore.add(record);
}

function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    const getAll = budgetObjectStore.getAll();
}

getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
        fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            const transaction = db.transaction(['new_budget'], 'readwrite');
            const budgetObjectStore = transaction.objectStore('new_budget');
            budgetObjectStore.clear();

            alert('All saved transactions have been submitted!');
        })
        .catch(err => {
            console.log(err);
        });
    }
};

window.addEventListener('online', uploadBudget);