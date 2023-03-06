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

//chrome.contextMenus.removeAll();

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
    }
});

/*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "showContextMenu") {
    sendResponse({ success: true, menus: chrome.contextMenus });

    //chrome.contextMenus.update("myContextMenu", {visible: true});
  }
});*/



/*
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "myContextMenu") {
    // Your code here to handle the click event
    console.log("Context menu item clicked");
  }
});


*/