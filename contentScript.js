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
            console.log("heeeeeeeeere");
            timerLabel = document.createElement("label");
            timerLabel.id = "timer-label";
            timerLabel.innerHTML = "Time Left: 00:00";

            bubbleDiv.append(timerLabel);
            timerLabelExists = document.getElementById("timer-label");
        }
        console.log("money shot right here: " + timerLabelExists)


        buddy.addEventListener("contextmenu", function(event) {
            console.log("henlo");
            var menutarget = "squareslo"
            if (event.target.id == menutarget) {
                //event.preventDefault();
                chrome.runtime.sendMessage({action: "showContextMenu"}, function(response) {
                    console.log("response received: " , response);
                });
            }
        });

        function updateTimerLabel(cur_time) {
            console.log("updating timer label")
            if (timerLabelExists) {
                console.log("exists")
                timerLabel.innerHTML = "Time Left: <br>" + cur_time;
            } else {
                console.log(timerLabelExists);
            }
        }

        chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
            const {type, value, videoId } = obj;
            if (type === "GETDOCUMENT") {
                sendResponse({ success: true });
            } else if (type === "TIMERSTARTING") {
                console.log("started timer: ");
                chrome.storage.sync.get("startTime", (data) => {
                    const startTime = data["startTime"];
                    console.log("start time: " + startTime);
                });
            } else if (type === "NEWTIME") {
                //console.log("cur time received");
                cur_time = value;
                //console.log("updated timestring: " + cur_time)

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