//This function fires when you open the popup.
document.addEventListener("DOMContentLoaded", async () => {
    addElements();
    fillPlaceholders();

    testFunctions();
});

function addElements() {
    const submitGoalChange = document.getElementById("submit-btn");
    addGoalListener(submitGoalChange);

    const hideButton = document.getElementById("hideButton");
    addHideListener(hideButton);

    const submitMSToggle = document.getElementById("msButton");
    addMSListener(submitMSToggle)
}

function fillPlaceholders() {
    let goalField = document.getElementById("newGoal")
    let breakField = document.getElementById("newBreak")

    
    chrome.storage.local.get("breakLen", (result) => {
        let break_len;
        if (result["breakLen"] !== undefined) {
            break_len = result["breakLen"]   
        }
        breakField.setAttribute("value", break_len);
    });

    chrome.storage.local.get("workLen", (result) => {
        let work_len;
        if (result["workLen"] !== undefined) {
            work_len = result["workLen"]   
        }
        goalField.setAttribute("value", work_len);
    });

}

function addGoalListener(submitGoalChange) {
    submitGoalChange.onclick = function() {
        var goalInput = document.getElementById("newGoal"); //newGoal is made in the html file
        var goalValue = goalInput.value; //so no input gives you an empty string
        if (goalValue !== "") {
            sendNewGoal(goalValue);
        }
        
        var breakInput = document.getElementById("newBreak"); //newBreak is made in the html file
        var breakValue = breakInput.value; 
        if (breakValue !== "") {
            sendNewBreak(breakValue);
        }
    }
}

function sendNewGoal(newGoal) {
    chrome.runtime.sendMessage({ 
        action: "changeGoal", 
        value: newGoal 
    });
}

function sendNewBreak(newBreak) {
    chrome.runtime.sendMessage({ 
        action: "changeBreak", 
        value: newBreak 
    });
}


function addHideListener(hideButton) {
    hideButton.onclick = function() {
        sendHideBuddy();
        /*
        if (hideButton.innerHTML === "Hide Buddy") {
            hideButton.innerHTML = "Show Buddy";
        } else {
            hideButton.innerHTML = "Hide Buddy";
        }*/  
    }
}

function sendHideBuddy() {
    chrome.runtime.sendMessage({
        action: "hideBuddy"    
    })
}



function addMSListener(msButton) {
    msButton.onclick = function() {
        sendMSToggle();
        
    }
}

function sendMSToggle() {
    chrome.runtime.sendMessage({
        action: "toggleMS"    
    })
}









//testing functions
var saveF = function() {
    var myVal = 12;
    myVal = document.getElementById("testField").value
    
    chrome.storage.local.set({"test": myVal}, () => {
        console.log('Stored name: ' + myVal)
    });
}

var retrieveF = function() {
    chrome.storage.local.get("test", (result) => {
        console.log(result)
        console.log(result["test"]);
    });
    
}

function testFunctions() {
    /*var save = document.getElementById("saveButton")
    var retrieve = document.getElementById("retrieveButton")
    save.onclick = saveF;
    retrieve.onclick = retrieveF;*/
}
