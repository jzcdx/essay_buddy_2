import {Timer} from "./timer.js";

var goalType = "TIMER"; //options: TIMER or WORDS 
var work_len = 0.1;
var break_len = 0.05;
var timer_len = work_len; //in minutes
var timer = new Timer(timer_len);
var phase = "WORK"; //WORK or BREAK
//var timerState = "ACTIVE"; //alternatively PAUSED or INACTIVE

chrome.storage.sync.set({
    ["phase"]: JSON.stringify(phase)
});

function toggleWorkPhase() {
    console.log("1b");
    chrome.storage.sync.get("phase", (data) => {
        if (data.phase !== undefined) {
            //flips phase if phase has been set
            if (phase === "WORK") {
                phase = "BREAK";
            } else {
                phase = "WORK";
            }
        }
        //sets phase in chrome storage
        chrome.storage.sync.set({
            ["phase"]: JSON.stringify(phase)
        });
    });
    
    //changes length of new timer based on whether or not we're taking a break now or working
    if (phase === "BREAK") {
        timer_len = work_len;
    } else if (phase === "WORK") {
        timer_len = break_len;
    }
    handleTimerReset();
}

createContextMenus();



//activates when we switch tabs
chrome.tabs.onActivated.addListener(function(activeInfo) {
    //if timer is currently running or currently paused, 
    if (timer.getRunState() || timer.getPauseState()) {
        //console.log("sending: (bg.js) " + timer.getTimeString())
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //Gets all active tabs in the current windows
            const activeTab = tabs[0]; //there should only be one tab that fulfills the above criteria
            chrome.tabs.sendMessage(activeTab.id, { //We're going to update the timer on that tab when we switch to it by sending a message.
                type: "NEWTIME",
                value: timer.getTimeString()
            });
        });
    } else {
        console.log("not running (bg.js)")
    }
});


//Note to self, comment the below code later
chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (timer.getRunState() || timer.getPauseState()) {
        chrome.tabs.sendMessage(tabId, { //We're going to update the timer on that tab when we switch to it by sending a message.
            type: "NEWTIME",
            value: timer.getTimeString()
        });
    }
});

function handleGoalToggling() {
    console.log("toggling goal");
    if (goalType === "TIMER") {
        goalType = "WORDS";
    } else if (goalType === "WORDS") {
        goalType = "TIMER";
    }
    chrome.contextMenus.update("toggleGoal", {
        //you cannot update the id in here (in chrome.contextMenus.update)
        title: "Toggle Goal Type (" + goalType.toLowerCase() + ")"  
    }); 
}

function handleStartToggling() {
    //the cosmetic stuff and also interacting with the timer itself.
    if (!timer.isRunning && !timer.isPaused) {
        //not running not paused > timer hasn't started
        timer.startTimer();
        chrome.contextMenus.update("startTimer", {
            title: "Pause Timer"  
        }); 
    } else {
        //toggle pause
        timer.togglePause();
        if (timer.isRunning) {
            chrome.contextMenus.update("startTimer", {
                title: "Pause Timer"  
            }); 
        } else {
            chrome.contextMenus.update("startTimer", {
                title: "Resume Timer"  
            }); 
        }
    }

 
    //stores current time in chrome storage
    //change this to store remaining time later
    var storeMe = Date.now();
    chrome.storage.sync.set({
        ["startTime"]: JSON.stringify(Date.now())
    }, function() {
        //console.log("Stored this: " + storeMe);
    });
    //We're gonna let our contentscript know that we're starting the timer here
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { type: "TIMERSTARTING" });
    });
}

function sendGoalChangePopupMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //Gets all active tabs in the current windows
        const activeTab = tabs[0]; //there should only be one tab that fulfills the above criteria
        chrome.tabs.sendMessage(activeTab.id, { //We're going to update the timer on that tab when we switch to it by sending a message.
            type: "CHANGEGOAL"
        });
    });
}

function createNewTimer() {
    timer.reset();
    timer = new Timer(timer_len);
}

function handleTimerReset() {
    handleStartToggling();
    createNewTimer();
    updateContentScriptTimerDisplay();
}

function updateContentScriptTimerDisplay() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //Gets all active tabs in the current windows
        const activeTab = tabs[0]; //there should only be one tab that fulfills the above criteria
        chrome.tabs.sendMessage(activeTab.id, { //We're going to update the timer on that tab when we switch to it by sending a message.
            type: "NEWTIME",
            value: timer.getTimeString()
        });
    });
}


//This code runs when you click on something in the context menu
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "toggleGoal") {
        handleGoalToggling();
    } else if (info.menuItemId === "startTimer") {
        handleStartToggling();
    } else if (info.menuItemId === "pauseTimer") {
        console.log("pausing timer");
        handleStartToggling();
    } else if (info.menuItemId === "restartTimer") {
        console.log("(bg js) resetting Timer");
        handleTimerReset();
    } else if (info.menuItemId === "changeGoal") {
        console.log("changing goal from ctx menu");
        sendGoalChangePopupMessage();
    }
});

//Handling messages received from context menu clicks, start toggling, 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "showContextMenu") { // this is from (right click) -> (context menu opens) in contentscript
        sendResponse({ success: true, menus: chrome.contextMenus });
    } else if (request.action === "toggleStart") { //this is from the bubble div getting directly left clicked in contentscript
        sendResponse({ success: true });
        handleStartToggling();
    } else if (request.action === "changeGoal") { //this is from popup js
        work_len = request.value;
        if (phase === "WORK") {
            timer_len = work_len;
            createNewTimer();
            updateContentScriptTimerDisplay();
        }
    } else if (request.action === "changeBreak") {
        break_len = request.value;
        if (phase === "BREAK") {
            timer_len = break_len;
            createNewTimer();
            updateContentScriptTimerDisplay();
        }
    } else if (request.action === "togglePhase") {
        toggleWorkPhase();
    } 
});








//if you don't remove the old context menus first, it'll duplicate lol
function createContextMenus() {
    chrome.contextMenus.remove('toggleGoal', function() {
        chrome.contextMenus.create({ //time or words //We'll implement this much later
            id: "toggleGoal",
            title: "Toggle Goal Type (" + goalType.toLowerCase() + ")",
            contexts: ["all"],
            targetUrlPatterns: ["*://*/*"],
            visible: true,
        });
    });

    chrome.contextMenus.remove('changeGoal', function() {
        chrome.contextMenus.create({
            id: "changeGoal",
            title: "Change Goal",
            contexts: ["all"],
            targetUrlPatterns: ["*://*/*"],
            visible: true,
        });
    });

    chrome.contextMenus.remove('changeBreak', function() {
        chrome.contextMenus.create({
            id: "changeBreak",
            title: "Change Break",
            contexts: ["all"],
            targetUrlPatterns: ["*://*/*"],
            visible: true,
        });
    });

    chrome.contextMenus.remove('pauseTimer', function() {
        chrome.contextMenus.create({
            id: "pauseTimer",
            title: "Pause Timer",
            contexts: ["all"],
            targetUrlPatterns: ["*://*/*"],
            visible: false,
        });
    });

    chrome.contextMenus.remove('startTimer', function() {
        chrome.contextMenus.create({
            id: "startTimer",
            title: "Start Timer",
            contexts: ["all"],
            targetUrlPatterns: ["*://*/*"],
            visible: true,
        });
    });

    chrome.contextMenus.remove('restartTimer', function() {
        chrome.contextMenus.create({
            id: "restartTimer",
            title: "Reset Timer",
            contexts: ["all"],
            targetUrlPatterns: ["*://*/*"],
            visible: true,
        });
    });
}

