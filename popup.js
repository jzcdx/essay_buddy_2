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



/*
import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    controlsElement.className = "bookmark-controls";

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";
    console.log("here");
    console.log(currentBookmarks.length);
    if (currentBookmarks.length > 0) {
        console.log("a");
        for (let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    } else {
        console.log("b");
        bookmarksElement.innerHTML = '<i class="row">No Bookmarks to show</i>';
    }
};

const onPlay = async e => {
    //tf is this shit lol
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();
    console.log("bmt: " + bookmarkTime);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    })
};

const onDelete = async e => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    }, viewBookmarks);

};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;

    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);

};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");
    console.log("cur vid: " + currentVideo)
    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]): [];
            console.log("cvb: " + currentVideoBookmarks);
            console.log("data: " + Object.keys(data));
            // view Bookmarks
            viewBookmarks(currentVideoBookmarks);

        })
    } else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
    }
});
*/