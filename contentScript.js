(() => {
    console.log("content script");
    
    /*the following few lines does absolutely nothing*/
    var link = document.createElement("link");
    link.href = chrome.runtime.getURL("buddy.css");
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.prepend(link);

    let buddy;

    const pageLoaded = async () => {
        console.log("page loaded");
        documentbody = document.getElementsByTagName("BODY")[0];

        const worldExists = document.getElementsByClassName("buddy_world")[0];
        let world;
        if (!worldExists) {
            world = document.createElement("div");
            world.className = "buddy_world";
            
            let shimai = document.getElementById("shimai-world")
            documentbody.removeChild(shimai);

            //documentbody.appendChild(world);
            documentbody.prepend(world)
        }
        
        const buddyExists = document.getElementsByClassName("buddy-img")[0];
        if (!buddyExists) {
            buddy = document.createElement("img");
            console.log(buddy);
            buddy.src = chrome.runtime.getURL("assets/sprites/angus/talk/Bonfire_angus_talk1_00000.png");
            //buddy.src = chrome.runtime.getURL("assets/sprites/angus.png");
            //buddy.src = chrome.runtime.getURL("assets/angus.png");
            //assets/sprites/angus/talk
            buddy.title = "it's your lil pal";
            buddy.style = "position: fixed;right: 0px; bottom: 0px;z-index: 9999; width:150px; height:150px;";

            
            document.body.prepend(buddy);
            //bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }
    pageLoaded();
    
    var spritenum = 0;
    setInterval(() => {
        if (spritenum < 10) {
            buddy.src = chrome.runtime.getURL("assets/sprites/angus/talk/Bonfire_angus_talk1_0000" + spritenum + ".png");
        } else {
            buddy.src = chrome.runtime.getURL("assets/sprites/angus/talk/Bonfire_angus_talk1_000" + spritenum + ".png");
        }
        spritenum++;
        if (spritenum > 13) {
            spritenum = 0;
        } 
        console.log("spritenum: " + spritenum);
    }, 100);
    

})();


/* put this back into the matches later:
"matches": ["https://docs.google.com/*"],*/

/*<div id="shimai-world" style="position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 2147483647; pointer-events: none; background: transparent;"></div>*/