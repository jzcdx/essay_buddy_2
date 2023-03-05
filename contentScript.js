(() => {

    const newVideoLoaded = async () => {
        console.log("nvloaded");
        
        const buddyExists = document.getElementsByClassName("buddy-img")[0];


        if (!buddyExists) {
            const buddy = document.createElement("img");
            
            bookmarkBtn.src = chrome.runtime.getURL("assets/angus.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    
    newVideoLoaded();

})();

