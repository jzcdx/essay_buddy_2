(() => {

    const documentbody = document.getElementsByTagName("BODY")[0];


    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, value, videoId } = obj;
        if (type === "NEW") {
            console.log("--");
            console.log("drs: " + document.readyState);
            currentVideo = videoId;
            console.log("new received");
            newVideoLoaded();
        }
    });

    const newVideoLoaded = async () => {
        console.log("nvloaded");
        const worldExists = document.getElementById("buddy_world");
        let world;
        if (!worldExists) {
            world = document.createElement("div");
            world.id = "buddy_world";
            let shimai = document.getElementById("shimai-world")
            documentbody.removeChild(shimai);
            documentbody.prepend(world)
        }


        let buddy;
        const buddyExists = document.getElementById("squareslo");
        if (!buddyExists) {
            buddy = document.createElement("img");
            buddy.src = chrome.runtime.getURL("assets/sprites/angus/talk/Bonfire_angus_talk1_00000.png");
            buddy.title = "it's your lil pal";
            buddy.id = "squareslo";
            
            world.prepend(buddy);
            buddy.addEventListener("contextmenu", addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler = async () => {
        console.log("bookmark handler");
    }


    newVideoLoaded();
})();

