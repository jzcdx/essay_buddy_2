import {Timer} from "./timer.js";

var goalType = "TIMER"; //options: TIMER or WORDS 
var timer_len = 15; //in minutes
var temp = new Timer(timer_len);
var document;


//we need the document object of the current tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
    console.log("tab active, sending message:")

    chrome.tabs.sendMessage(activeInfo.tabId, {
        type: "GETDOCUMENT"
    }, 
    function(response) {
        console.log("response received 2: " , response);
        
        //console.log(response["doc"]);
    })

    
});


chrome.tabs.onUpdated.addListener((tabId, tab) => {
    console.log("here");
    console.log
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


chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "toggleGoal") {
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

    } else if (info.menuItemId === "startTimer") {
        console.log("timer starting");
        console.log()
        var storeMe = Date.now();
        chrome.storage.sync.set({
            ["startTime"]: JSON.stringify(Date.now())
        }, function() {
            console.log("Stored this: " + storeMe);
        });

        chrome.tabs.sendMessage(tab.id, {
            type: "TIMERSTARTING"
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







createContextMenus();

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
}

