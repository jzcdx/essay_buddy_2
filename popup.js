//This function fires when you open the popup.
document.addEventListener("DOMContentLoaded", async () => {
    addElements();
});

function addElements() {
    const submitGoalChange = document.getElementById("submit-btn");
    addGoalListener(submitGoalChange);

    const hideButton = document.getElementById("hideButton");
    addHideListener(hideButton);
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
        if (hideButton.innerHTML === "Hide Buddy") {
            hideButton.innerHTML = "Show Buddy";
        } else {
            hideButton.innerHTML = "Hide Buddy";
        }   
    }
}

function sendHideBuddy() {
    chrome.runtime.sendMessage({
        action: "hideBuddy"    
    })
}

