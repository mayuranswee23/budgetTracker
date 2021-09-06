let db; 
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction',
    {
        autoIncrement: true
    });

//if request is successful, check if app is working ad run fxn
request.onsuccess = function(event){
    db = event.target.result;
    if (navigator.onLine){
        newTransaction();
    }
};

request.onerror = function(event){
    //show error
    console.log(event.target.errorCode);
};

function saveTransaction(record){
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetStore = transaction.objectStore('new_transaction');
    budgetStore.add(record);
};

//get pending transactions, get all records from the store and save successful
function newTransaction(){
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetStore = transaction.objectStore('new_transaction');
    const allRecords = budgetStore.getAll()

    allRecords.onsuccess = function(){
        if (allRecords.result.length > 0){
            fetch('/api/transaction', {
                method: 'POST', 
                body: JSON.stringify(allRecords.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
         })
         .then(response => response.json())
        .then(serverResponse => {
             if(serverResponse.message){
                 throw new Error(serverResponse)
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const budgetStore = transaction.objectStore('new_transaction');
                budgetStore.clear();
            })
        .catch(err => {
            console.log(err);
        })
        }
    }
}

}

window.addEventListener('online', newTransaction)