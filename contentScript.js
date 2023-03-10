/*
next feature: changing break length;
*/
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
            timerLabel.innerHTML = "Time Left: <br>00:00:00";

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
            if (event.target.id == menutarget || event.target.id == menutarget2) {
                //event.preventDefault();
                chrome.runtime.sendMessage({action: "toggleStart"}, function(response) {
                    console.log("response received: " , response);
                });
            }
        });


        var popup;
        function createPopup() {
            popup = document.createElement("div");
            popup.id = "goal-change-popup";
            //popup.innerHTML = "<h1>New Goal:</h1>";

            var closeButton = document.createElement("button");
            closeButton.innerText = "x";
            closeButton.id = "goal-change-close"
            closeButton.addEventListener("click", function() {
                document.body.removeChild(popup);
                popup = null;
            });
            popup.appendChild(closeButton);

            var titleLabel = document.createElement("label");
            titleLabel.innerHTML = "Update Timers: (In Minutes)";
            popup.appendChild(titleLabel);

            var newGoalInput = document.createElement("input");
            newGoalInput.type = "text";
            newGoalInput.placeholder = "New Work Timer";
            popup.appendChild(newGoalInput);
            
            var newBreaklInput = document.createElement("input");
            newBreaklInput.type = "text";
            newBreaklInput.placeholder = "New Break Timer";
            popup.appendChild(newBreaklInput);

            var goalSubmit = document.createElement("button");
            goalSubmit.innerHTML = "Submit";
            popup.appendChild(goalSubmit);

            goalSubmit.addEventListener("click", () => {
                var newGoal = newGoalInput.value;
                var newBreak = newBreaklInput.value;

                if (newGoal != "") {
                    chrome.runtime.sendMessage({
                        action: "changeGoal",
                        value: newGoal
                    });
                }
                if (newBreak != "") {
                    chrome.runtime.sendMessage({
                        action: "changeBreak",
                        value: newBreak
                    });
                }
                //close popup after submitting new goal;
                document.body.removeChild(popup);
                popup = null;
            })
        }

        function togglePopup() {
            if (popup === undefined || popup === null) {
                createPopup();
            }
            document.body.appendChild(popup);
        }

        async function getPhase() {
            var ret_me = "";

            await chrome.storage.sync.get(["phase"]).then((result) => {
                //DO NOT FORGET JSON.parse OR ELSE YOUR RESULT STRING WILL INCLUDE QUOTES.
                ret_me = JSON.parse(result.phase);
            });
            
            return ret_me;
        }


        //updates the innerhtml of our timer label
        async function updateTimerLabel(cur_time) {
            var phase = await getPhase();

            //phase = "WORK";
            if (phase !== undefined) {
                var flavorString = "";
                if (phase === "WORK") {
                    
                    console.log("a")
                    flavorString = "Work time Left: <br>";
                } else if (phase === "BREAK") {  
                    console.log("b")
                    flavorString = "Break time Left: <br>";
                }

                console.log("flavorString: " + flavorString);
                if (timerLabelExists) {
                    timerLabel.innerHTML = flavorString + cur_time;
                } else {
                    console.log("timer label doesnt exist yet: " + timerLabelExists);
                }
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
            } else if (type === "CHANGEGOAL") {
                togglePopup();
            } else if (type === "CHANGEBREAK") {
                togglePopup();

            } else if (type === "TOGGLEPHASE") {
                chrome.runtime.sendMessage({
                    action: "togglePhase"
                });
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