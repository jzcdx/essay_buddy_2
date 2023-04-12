import {Timer} from "./timer.js";
import { constants } from './constants.js';
//const constants = require('./spriteConstants.json');

var work_len = 0.05;
var break_len = 5;

var timer_len = work_len; //in minutes
var timer = new Timer(timer_len);

var phase = "WORK"; //WORK or BREAK
var visible = true;
var goalType = "TIMER"; //options: TIMER or WORDS 

var curSprite = constants.sprites.barry
var curSpriteSet = curSprite.inactive;

chrome.storage.sync.set({
    ["phase"]: JSON.stringify(phase)
});

getDefaultSettings();

function getDefaultSettings() {
    chrome.storage.local.get("visibility", (result) => {
        if (result["visibility"] !== undefined) {
            visible = result["visibility"]
        } 
    });
    
    chrome.storage.local.get("workLen", (result) => {
        if (result["workLen"] !== undefined) {
            work_len = result["workLen"]
        }
        
    });
    chrome.storage.local.get("breakLen", (result) => {
        if (result["breakLen"] !== undefined) {
            break_len = result["breakLen"]   
        }
    });
}



async function toggleWorkPhase() {
    const result = await new Promise((resolve) => {
        chrome.storage.sync.get("phase", resolve);
    });

    if (result.phase !== undefined) {
        if (phase === "WORK") {
            phase = "BREAK";
        } else {
            phase = "WORK";
        }
    }

    await chrome.storage.sync.set({
        ["phase"]: JSON.stringify(phase)
    });

   
    //changes length of new timer based on whether or not we're taking a break now or working
    if (phase === "BREAK") {
        timer_len = break_len;
    } else if (phase === "WORK") {
        timer_len = work_len;
    }
    handleTimerReset();
    updateSpritePhase();
}

function updatedAndActivatedHandler() {
    //if timer is currently running or currently paused 
    if (timer.getRunState() || timer.getPauseState()) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //Gets all active tabs in the current windows
            const activeTab = tabs[0]; //there should only be one tab that fulfills the above criteria
            chrome.tabs.sendMessage(activeTab.id, { //We're going to update the timer on that tab when we switch to it by sending a message.
                type: "NEWTIME",
                value: timer.getTimeString()
            });
        });
    } else {
        //console.log("tab switching, timer not running (bg.js)")
    }

    //we're gonna make sure the visibility settings are the same between tabs when we switch by querying and msging contentscript
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { 
            type: "TOGGLEVISIBILITY",
            value: visible
        });
    });
}

chrome.tabs.onUpdated.addListener(function() {
    //console.log("on UPDATED triggered");
    updatedAndActivatedHandler();
})
//activates when we switch tabs
chrome.tabs.onActivated.addListener(function(activeInfo) {
    //console.log("on ACTIVATED triggered");
    updatedAndActivatedHandler();
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
    //console.log("toggling goal");
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
    //console.log("timer resetting")
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
    } else if (info.menuItemId === "hideBuddy") {
        console.log("hiding buddy");
        toggleBuddyVisibility();
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
        chrome.storage.local.set({"workLen": work_len}, () => {
            console.log('Stored work Length: ' + work_len)
        });
        if (phase === "WORK") {
            timer_len = work_len;
            createNewTimer();
            updateContentScriptTimerDisplay();
        }
    } else if (request.action === "changeBreak") {
        break_len = request.value;
        chrome.storage.local.set({"breakLen": break_len}, () => {
            console.log('Stored work Length: ' + break_len)
        });
        if (phase === "BREAK") {
            timer_len = break_len;
            createNewTimer();
            updateContentScriptTimerDisplay();
        }
    } else if (request.action === "togglePhase") { //from contentScripts.js (which receives a message from timer.js) 
        toggleWorkPhase();
        
    } else if (request.action === "hideBuddy") {
        toggleBuddyVisibility();
    }
});

function toggleBuddyVisibility() {
    // 1) we'll toggle the variable to track visibility.
    visible = !visible;
    chrome.storage.local.set({"visibility": visible}, () => {
        console.log('Stored visibility: ' + visible)
    });

    // 2) we're gonna message our current tab to flip the visibility.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //Gets all active tabs in the current windows
        const activeTab = tabs[0]; //there should only be one tab that fulfills the above criteria
        chrome.tabs.sendMessage(activeTab.id, { //We're going to update the timer on that tab when we switch to it by sending a message.
            type: "TOGGLEVISIBILITY",
            value: visible
        });
    });
    // 3) update the code for tab switching to message contentScript the current state of visibility.

}

function updateSpritePhase() {
    if (phase === "WORK") {
        curSpriteSet = curSprite.inactive;
    } else if (phase === "BREAK") {
        curSpriteSet = curSprite.active;
    }
    
    spriteIndex = "00";
    maxSpriteIndex = curSpriteSet.frames; 

    spriteState = phase;
    console.log("------------------------- sprite phase update: " + spriteState);
}

var spriteIndex = "00";
var maxSpriteIndex = curSpriteSet.frames; //is undefined right now
var spriteState = "WORK";

function updateSprite() {
    var newURLPath = curSpriteSet.path + spriteIndex + ".png"
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        //this works to send a message to the contentscript of the tab that's active
        //console.log("at: " + activeTab);
        if (activeTab != undefined) {
            chrome.tabs.sendMessage(activeTab.id, { type: "NEWSPRITE", newURL: newURLPath });
        }
    });
    spriteIndex = parseInt(spriteIndex)
    spriteIndex++;
    if (spriteIndex > maxSpriteIndex) {
        spriteIndex = "00";
    }
    spriteIndex = spriteIndex.toString();

    if (spriteIndex.length === 1) {
        spriteIndex = "0" + spriteIndex;
    }
}

function startSpriteLoop() {
    var fps = curSpriteSet.framerate;
    var timeInterval = 1000 / fps; //this is how often we gotta update the loop to maintain our fps. //this is in ms, so 1000ms per second.
    var spriteInterval = setInterval(updateSprite.bind(), timeInterval);
}
startSpriteLoop();








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

    chrome.contextMenus.remove('hideBuddy', function() {
        chrome.contextMenus.create({
            id: "hideBuddy",
            title: "Hide Buddy",
            contexts: ["all"],
            targetUrlPatterns: ["*://*/*"],
            visible: true,
        });
    });
}
createContextMenus();
