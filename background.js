import { Timer } from "./timer.js";
import { constants } from './constants.js';

var work_len = 25;
var break_len = 5;

var timer_len; //in minutes
var timer;

var phase = "WORK"; //WORK or BREAK
var visible = true;
var timerVisible = true;
var goalType = "TIMER"; //options: TIMER or WORDS 
var msDisplay = false;

var curSprite = constants.sprites.barry
var curSpriteSet = curSprite.active;

chrome.storage.sync.set({
    ["phase"]: JSON.stringify(phase)
});


getDefaultSettings()
function getDefaultSettings() {    
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
    chrome.storage.local.get("msDisplay", (result) => {
        if (result["msDisplay"] !== undefined) {
            msDisplay = result["msDisplay"]   
        }
    });
    syncDefaultVisibilites()
    syncDefaultVolume()
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        //this works to send a message to the contentscript of the tab that's active
        if (activeTab != undefined) { //Pretty sure this crashes if you don't have an active tab, I don't remember how you do that
            chrome.tabs.sendMessage(activeTab.id, { type: "NEWSPRITE", newURL: newURLPath });
        }
    });
}

async function syncDefaultVolume() {
    let oldVol = undefined;
    await new Promise((resolve, reject) => {
        chrome.storage.local.get("volume", (result) => {
            oldVol = result["volume"];
            resolve()
        });
    })
    
    if (oldVol !== undefined) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab != undefined) {
                chrome.tabs.sendMessage(activeTab.id, { type: "NEWVOLUME", value: oldVol });
            } else {
                //tab does not exist for volume
            }
        });
    }
}



async function syncDefaultVisibilites() {
    await new Promise((resolve, reject) => { 
        chrome.storage.local.get("timerVisibility", (result) => {
            if (result["timerVisibility"] !== undefined) {
                timerVisible = result["timerVisibility"] //A
                
            } 
            resolve()
        });
    });
    await new Promise((resolve, reject) => { 
        chrome.storage.local.get("visibility", (result) => {
            if (result["visibility"] !== undefined) {
                visible = result["visibility"] //C
            } 
            resolve()
        });
    });
    updateTimerVisibility() //B
    updateVisibility() //D
}



//////////////////////////////////////////////////////////////////////////////
//The next 3 blocks are for maintaining state when we switch tabs or refresh//
//////////////////////////////////////////////////////////////////////////////

//activates when we refresh a tab
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    updatedAndActivatedHandler();
    if (changeInfo.status === "complete") {
        syncDefaultVolume()
    }
})
//activates when we switch tabs
chrome.tabs.onActivated.addListener(function(activeInfo) {
    updatedAndActivatedHandler();
});

function updatedAndActivatedHandler() {
    //console.log("tab swap")
    //if timer is currently running or currently paused 
    if (timer !== undefined) {
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
    }
    
    //we're gonna make sure the visibility settings are the same between tabs when we switch by querying and msging contentscript
    updateVisibility();
    updateTimerVisibility()
    updateContentScriptTimerDisplay()
    
    syncSize()
}




////////////
//Handlers//
////////////

function handleGoalToggling() {
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
    if (timer === undefined) { //First phase
        timer_len = work_len;
        timer = new Timer(timer_len)
        timer.setMSDisplay(msDisplay)
        curSpriteSet = curSprite.inactive
        maxSpriteIndex = curSpriteSet.frames
    }
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
    });
    //We're gonna let our contentscript know that we're starting the timer here
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { type: "TIMERSTARTING" });
    });
}

function handleTimerReset() {
    handleStartToggling();
    createNewTimer();
    updateContentScriptTimerDisplay();
}




function createNewTimer() {
    timer.reset();
    timer = new Timer(timer_len);
    timer.setMSDisplay(msDisplay);
    timer.updateTimeString();
    timer.updateDisplay();
}

async function syncSize() {
    await sendSizeDeltaMessage();
    await sendSizeMessage()
    sendSizeUpdate();
}

function sendSizeMessage() {
    //sends size delta to 
    let originalSize = curSpriteSet.width;
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { type: "ORIGINALSIZE", value: originalSize }, function(response) {
                resolve();
            });
        });
    });
}

function sendSizeDeltaMessage() {
    //sends size delta to 
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { type: "UPDATESIZEDELTA" }, function(response) {
                resolve();
            });
        });
    });
}

function sendSizeUpdate() {
    //sends size delta to 
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { type: "UPDATESIZE"});
    });
}

//Used in the contextmenu listener below
function sendGoalChangePopupMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //Gets all active tabs in the current windows
        const activeTab = tabs[0]; //there should only be one tab that fulfills the above criteria
        chrome.tabs.sendMessage(activeTab.id, { //We're going to update the timer on that tab when we switch to it by sending a message.
            type: "CHANGEGOAL"
        });
    });
}




//This code runs when you click on an element of the context menu
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "toggleGoal") {
        handleGoalToggling();
    } else if (info.menuItemId === "startTimer") {
        handleStartToggling();
    } else if (info.menuItemId === "pauseTimer") {
        handleStartToggling();
    } else if (info.menuItemId === "restartTimer") {
        handleTimerReset();
    } else if (info.menuItemId === "changeGoal") {
        /*
        //opens popup.html in a new tab (maybe we can use this instead of the modal)
        chrome.tabs.create({url : "popup.html"}); 
        */
        sendGoalChangePopupMessage();
    } else if (info.menuItemId === "hideBuddy") {
        toggleBuddyVisibility();
    } 
});

//Handling messages received from other parts of this codebase. Mostly popup.js, 
//but also when you click on the bubble in the main ui, and also when the phase toggles 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "showContextMenu") { // this is from (right click) -> (context menu opens) in contentscript
        //This is literally when the context menu opens (basically just here for testing purposes)
        sendResponse({ success: true, menus: chrome.contextMenus });
    } else if (request.action === "toggleStart") { //this is from the bubble div getting directly left clicked in contentscript
        sendResponse({ success: true });
        handleStartToggling();
    } else if (request.action === "changeGoal") { //this is from popup.js
        work_len = request.value;
        chrome.storage.local.set({"workLen": work_len}, () => {
            //console.log('Stored work Length: ' + work_len)
        });
        if (phase === "WORK") {
            timer_len = work_len;
            createNewTimer();
            updateContentScriptTimerDisplay();
        }
    } else if (request.action === "changeBreak") { //this is also from popup.js
        break_len = request.value;
        chrome.storage.local.set({"breakLen": break_len}, () => {
            //console.log('Stored work Length: ' + break_len)
        });
        if (phase === "BREAK") {
            timer_len = break_len;
            createNewTimer();
            updateContentScriptTimerDisplay();
        }
    } else if (request.action === "togglePhase") { //from contentScripts.js (which receives a message from timer.js) 
        toggleWorkPhase();
    } else if (request.action === "hideBuddy") { // from popup.js
        toggleBuddyVisibility();
    } else if (request.action === "toggleMS") { // Also from popup.js
        toggleMSVisibility();
    } else if (request.action === "requestOWidth") {
        sendSizeMessage();
    } else if (request.action === "hideTimer") { // from popup.js
        toggleTimerVisibility();
    }
});




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

function toggleMSVisibility() {
    timer.toggleMSDisplay();
    msDisplay = timer.getMSDisplay();
    chrome.storage.local.set({"msDisplay": msDisplay}, () => {
    });
    timer.updateDisplay();
}

function toggleBuddyVisibility() {
    // 1) we'll toggle the variable to track visibility.
    visible = !visible;
    chrome.storage.local.set({"visibility": visible}, () => {
        //console.log('Stored visibility: ' + visible)
    });

    // 2) we're gonna message our current tab to flip the visibility.
    updateVisibility()
    // 3) update the code for tab switching to message contentScript the current state of visibility.
}

function toggleTimerVisibility() {
    // 1) we'll toggle the variable to track visibility.
    timerVisible = !timerVisible;
    chrome.storage.local.set({"timerVisibility": timerVisible}, () => {
    });

    // 2) we're gonna message our current tab to flip the visibility.
    updateTimerVisibility()
    // 3) update the code for tab switching to message contentScript the current state of visibility.
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

function updateVisibility() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //Gets all active tabs in the current windows
        const activeTab = tabs[0]; //there should only be one tab that fulfills the above criteria
        chrome.tabs.sendMessage(activeTab.id, { //We're going to update the timer on that tab when we switch to it by sending a message.
            type: "TOGGLEVISIBILITY",
            value: visible
        });
    });
}

function updateTimerVisibility() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //Gets all active tabs in the current windows
        const activeTab = tabs[0]; //there should only be one tab that fulfills the above criteria
        chrome.tabs.sendMessage(activeTab.id, { //We're going to update the timer on that tab when we switch to it by sending a message.
            type: "TOGGLETIMERVISIBILITY",
            value: timerVisible
        });
    });
}

function updateSpritePhase() {
    if (phase === "WORK") {
        curSpriteSet = curSprite.inactive;
    } else if (phase === "BREAK") {
        curSpriteSet = curSprite.active;
    }
    
    spriteIndex = "00";
    maxSpriteIndex = curSpriteSet.frames; 
}





var spriteIndex = "00"; //might need to change that later
var maxSpriteIndex = curSpriteSet.frames; //is undefined right now

function updateSprite() {
    var newURLPath = curSpriteSet.path + spriteIndex + ".png"
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        //this works to send a message to the contentscript of the tab that's active
        if (activeTab != undefined) { //Pretty sure this crashes if you don't have an active tab, I don't remember how you do that
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







//DEFAULT: targetUrlPatterns: ["*://*/*"],

//if you don't remove the old context menus first, it'll duplicate lol
function createContextMenus() {

    /*
    chrome.contextMenus.remove('toggleGoal', function() {
        chrome.contextMenus.create({ //time or words //We'll implement this much later
            id: "toggleGoal",
            title: "Toggle Goal Type (" + goalType.toLowerCase() + ")",
            contexts: ["all"],
            visible: true,
        });
    });

    chrome.contextMenus.remove('changeGoal', function() {
        chrome.contextMenus.create({
            id: "changeGoal",
            title: "Change Goal",
            contexts: ["all"],
            visible: true,
        });
    });
    
    chrome.contextMenus.remove('changeBreak', function() {
        chrome.contextMenus.create({
            id: "changeBreak",
            title: "Change Break",
            contexts: ["all"],
            visible: true,
        });
    });
    */
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
            title: "Toggle Buddy Visibility",
            contexts: ["all"],
            targetUrlPatterns: ["*://*/*"],
            visible: true,
        });
    });
}
createContextMenus();
