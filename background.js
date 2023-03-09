var goalType = "TIMER"; //options: TIMER or WORDS 

chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);
        console.log(urlParameters);

        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParameters.get("v")
        })
    }
});

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

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "item2") {
        console.log("ctx 1 clicked");
    } else if (info.menuItemId === "item3") {
        console.log("ctx 2 clicked");

    } else if (info.menuItemId === "toggleGoal") {
        console.log("toggling goal");
        if (goalType === "TIMER") {
            goalType = "WORDS";
        } else if (goalType === "WORDS") {
            goalType = "TIMER";
        }
        
        chrome.contextMenus.update("toggleGoal", {
            //you cannot update the id in here
            title: "Toggle Goal Type (" + goalType.toLowerCase() + ")"  
        }); 
    } else if (info.menuItemId === "startTimer") {
        chrome.storage.sync.set({
            ["startTime"]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "showContextMenu") {
    sendResponse({ success: true, menus: chrome.contextMenus });
    //honestly, this doesn't really do much lol
    //chrome.contextMenus.update("myContextMenu", {visible: true});
  }
});



/*
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "myContextMenu") {
    // Your code here to handle the click event
    console.log("Context menu item clicked");
  }
});


*/



class Timer {
    constructor(length, document, elementID) { //length in minutes
        this.length = length;
        this.timerInterval;
        this.startTime;
        this.elapsedTime = 0;
        this.isPaused = false;
        this.timeString;
        this.document = document;
        this.elementID = elementID;
    }


    startTimer() {
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(this.updateTimer.bind(this), 10);
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
        this.isPaused = true;
    }
    
    updateTimer() {
        let elapsedTimeMillis = Date.now() - this.startTime;
        this.elapsedTime = Math.floor(elapsedTimeMillis / 10) * 10;
        let minutes = Math.floor(this.elapsedTime / 60000);
        let seconds = Math.floor((this.elapsedTime % 60000) / 1000);
        let milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
        this.timeString =
            this.padNumber(minutes) +
            ":" +
            this.padNumber(seconds) +
            "." +
            this.padNumber(milliseconds);
        this.updateLabel(this.elementID);
    }

    padNumber(num) {
        return num.toString().padStart(2, "0");
    }

    getTime() { //returns in milliseconds
        return this.elapsedTime;
    }

    updateLabel(elementID) { 
        //element should be "timer_label" as a string
        //content will be timeString
        this.document.getElementById(elementID).innerHTML = "Time Passed: <br>" + this.timeString;
    }
}

//const timer = new Timer(15, document, timerLabel.id);
//timer.startTimer();