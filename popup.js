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

    addVolumeListener();

    const hideTimerButton = document.getElementById("hideTimerButton");
    addHideTimerListener(hideTimerButton)    
}

function fillPlaceholders() {
    let goalField = document.getElementById("newGoal")
    let breakField = document.getElementById("newBreak")
    let volumeSlider = document.getElementById("volumeSlider")
    
    chrome.storage.local.get("breakLen", (result) => {
        let break_len;
        if (result["breakLen"] !== undefined) {
            break_len = result["breakLen"]   
        } else {
            break_len = "";
        }
        breakField.setAttribute("value", break_len);
    });

    chrome.storage.local.get("workLen", (result) => {
        let work_len;
        if (result["workLen"] !== undefined) {
            work_len = result["workLen"]   
        } else {
            work_len = "";
        }
        goalField.setAttribute("value", work_len);
    });
    


    chrome.storage.local.get("volume", (result) => {
        let savedVolume = result["volume"];
        //console.log(savedVolume);
        volumeSlider.setAttribute("value", savedVolume);
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
        
        //removes the confirmation text after 2 seconds
        if (breakValue !== "" | goalValue !== "") {
            let goalsSavedLabel = document.getElementById("goals-saved")
            goalsSavedLabel.style.display = "inline";

            setTimeout(() => {
                goalsSavedLabel.style.display = "none";
            }, 2000); // change 5000 to the number of milliseconds you want to wait before hiding the label
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
    }
}

function addHideTimerListener(hideTimerButton) {
    hideTimerButton.onclick = function() {
        sendHideTimer();
    }
}

function sendHideBuddy() {
    chrome.runtime.sendMessage({
        action: "hideBuddy"    
    })
}

function sendHideTimer() {
    chrome.runtime.sendMessage({
        action: "hideTimer"
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


function addVolumeListener() {
    var volDisplay = document.getElementById('volumeValDisplay');
    var slider = document.getElementById('volumeSlider');
    slider.addEventListener('change', function() {
        let newVolume = slider.value;
        volDisplay.innerHTML = newVolume + "%";
        chrome.storage.local.set({"volume": newVolume}, () => {
            //console.log('Stored volume: ' + newVolume);
            sendVolumeChange(newVolume);
        });
    });
}

function sendVolumeChange(newVol) {
    //Remember, we're sending this to contentscript, where our audio object is, so we need to query for active tab first.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { type: "NEWVOLUME", value: newVol });
    });
}






