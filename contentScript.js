(() => {
    const documentbody = document.getElementsByTagName("BODY")[0];

    const newPageLoaded = async () => {
        const worldExists = document.getElementById("buddy_world");
        let world;
        if (!worldExists) {
            world = document.createElement("div");
            world.id = "buddy_world";
            world.title = "right click to access the menu";
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
        }

        let bubbleDiv;
        const bubbleDivExists = document.getElementById("bubble-div");
        if (!bubbleDivExists) {
            bubbleDiv = document.createElement("div");
            bubbleDiv.id = "bubble-div";
            world.prepend(bubbleDiv);
        }

        const bubbleExists = document.getElementById("bubble-img");
        if (!bubbleExists) {
            bubble = document.createElement("img");
            bubble.src = chrome.runtime.getURL("assets/bubble.png");
            bubble.title = "click for the menu";
            bubble.id = "bubble-img";
            

            bubbleDiv.append(bubble);
        }

        var timerLabel;
        var timerLabelExists = document.getElementById("timer-label");
        if (!timerLabelExists) {
            timerLabel = document.createElement("label");
            timerLabel.id = "timer-label";
            timerLabel.innerHTML = "Time Left: <br>00:00";

            bubbleDiv.append(timerLabel);
            timerLabelExists = document.getElementById("timer-label");
        }


        buddy.addEventListener("contextmenu", function(event) {
            console.log("context menu clicked (contentScript.js) ");
            var menutarget = "squareslo"
            if (event.target.id == menutarget) {
                //event.preventDefault();
                chrome.runtime.sendMessage({action: "showContextMenu"}, function(response) {
                    console.log("response received: " , response);
                });
            }
        });

        world.addEventListener("click", function(event) {
            console.log("left clicked world");
            var menutarget = "bubble-img";
            var menutarget2 = "timer-label";
            console.log(event.target.id);
            console.log(menutarget);
            if (event.target.id == menutarget || event.target.id == menutarget2) {
                event.preventDefault();
                chrome.runtime.sendMessage({action: "toggleStart"}, function(response) {
                    //console.log("response received: " , response);
                });
            }
        });

        //updates the innerhtml of our timer label
        function updateTimerLabel(cur_time) {
            if (timerLabelExists) {
                timerLabel.innerHTML = "Time Left: <br>" + cur_time;
            } else {
                console.log("timer label doesnt exist yet: " + timerLabelExists);
            }
        }

        chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
            const {type, value, videoId } = obj;
            if (type === "TIMERSTARTING") {
                chrome.storage.sync.get("startTime", (data) => {
                    const startTime = data["startTime"];
                });
            } else if (type === "NEWTIME") {
                cur_time = value;
                updateTimerLabel(cur_time);
            }
        });
    }
    
    newPageLoaded(); //important
})();


/*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "showContextMenu") {
        sendResponse({ success: true, menus: chrome.contextMenus });
        //honestly, this doesn't really do much lol
        //chrome.contextMenus.update("myContextMenu", {visible: true});
    }
});*/