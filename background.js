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

chrome.contextMenus.remove('item2', function() {
    chrome.contextMenus.create({
        id: "item2",
        title: "helo",
        contexts: ["all"],
        targetUrlPatterns: ["*://*/*"],
        visible: true,
    });
});

chrome.contextMenus.remove('item3', function() {
    chrome.contextMenus.create({
        id: "item3",
        title: "helo 2",
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