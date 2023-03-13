//This function fires when you open the popup.
document.addEventListener("DOMContentLoaded", async () => {
    console.log("hi asdasfas");
    addElements();
});

function addElements() {
    console.log("helo helo");
    const submitGoalChange = document.createElement("button");
    submitGoalChange.textContent = "submit me";
    submitGoalChange.id = "submit-btn";
    addGoalListener(submitGoalChange);

    
}

function addGoalListener(submitGoalChange) {
    submitGoalChange.onclick = function() {
        console.log("submit clicked");
        var input = document.getElementById("newGoal");
        var inputValue = input.value;
        sendNewGoal(inputValue);
    }
    //also appends our button to our popup
    var main = document.getElementById("container");
    main.appendChild(submitGoalChange);
}

function sendNewGoal(newGoal) {
    chrome.runtime.sendMessage({ 
        action: "changeGoal", 
        value: newGoal 
    });
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