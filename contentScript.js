(() => {
    const documentbody = document.getElementsByTagName("BODY")[0];

    const newPageLoaded = async () => {
        let worldExists = document.getElementById("buddy_world");
        let world;
        if (!worldExists) {
            world = document.createElement("div");
            world.id = "buddy_world";
            world.title = "right click to access the menu";
            let shimai = document.getElementById("shimai-world");
            if (shimai !== null) {
                documentbody.removeChild(shimai);
            }
            documentbody.prepend(world)
        }
        
        let buddyDiv;
        let buddyDivExists = document.getElementById("buddyDiv");
        if (!buddyDivExists) {
            buddyDiv = document.createElement("div");
            //buddy.src = chrome.runtime.getURL("assets/sprites/potion/inactive/1-inactive.png");
            buddyDiv.id = "buddyDiv";
            world.prepend(buddyDiv);
        }

        let buddy;
        let buddyExists = document.getElementById("squareslo");
        if (!buddyExists) {
            buddy = document.createElement("img");
            buddy.setAttribute('draggable', 'false');
            buddy.src = chrome.runtime.getURL("assets/sprites/barry/active/tile000.png");
            //buddy.src = chrome.runtime.getURL("assets/sprites/potion/inactive/1-inactive.png");
            buddy.title = "it's your lil pal";
            buddy.id = "squareslo";
            buddyDiv.prepend(buddy)            
        }

        let bubbleDiv;
        let bubbleDivExists = document.getElementById("bubble-div");
        if (!bubbleDivExists) {
            bubbleDiv = document.createElement("div");
            bubbleDiv.id = "bubble-div";
            world.prepend(bubbleDiv);
        }

        let bubbleExists = document.getElementById("bubble-img");
        if (!bubbleExists) {
            bubble = document.createElement("img");
            bubble.src = chrome.runtime.getURL("assets/pbubble3.png");
            bubble.title = "click for the menu";
            bubble.id = "bubble-img";
            
            bubbleDiv.append(bubble);
        }

        var timerLabel;
        var timerLabelExists = document.getElementById("timer-label");
        if (!timerLabelExists) {
            timerLabel = document.createElement("label");
            timerLabel.id = "timer-label";
            timerLabel.innerHTML = "Click Me <br>To Start";
            //timerLabel.innerHTML = "START";
            bubbleDiv.append(timerLabel);
            timerLabelExists = document.getElementById("timer-label");
        }

        buddy.addEventListener("contextmenu", function(event) {
            //console.log("context menu clicked (contentScript.js) ");
            var menutarget = "squareslo"
            if (event.target.id == menutarget) {
                //event.preventDefault();
                chrome.runtime.sendMessage({action: "showContextMenu"}, function(response) {
                    //console.log("response received: " , response);
                });
            }
        });

        world.addEventListener("click", function(event) {
            var menutarget = "bubble-img";
            var menutarget2 = "timer-label";
            if (event.target.id == menutarget || event.target.id == menutarget2) {
                //event.preventDefault();
                chrome.runtime.sendMessage({action: "toggleStart"}, function(response) { //First click to start timer
                    console.log("response received: " , response);
                });
            }
            
        });

        /*This system works, but i want instant feedback
        var startX;
        var startY;
        buddyDiv.addEventListener("mousedown", function(event) {
            startX = event.clientX;
            startY = event.clientY;

            console.log("Clicked at (" + startX + ", " + startY + ")");
        });

        var endX;
        var endY;
        buddyDiv.addEventListener("mouseup", function(event) {
            endX = event.clientX;
            endY = event.clientY;

            console.log("Released at (" + endX + ", " + endY + ")");

            let xDist = startX - endX;
            let yDist = startY - endY;
            console.log("Distances: ",  xDist , ", " , yDist);
            console.log("width: " , typeof buddy.width)
            let twidth = buddy.width;
            setBuddySize(twidth + xDist);
        });
        */


        var dragMDtarget = buddy; //dragMouseDownTarget
        var startX;
        var startY;
        let originalWidth;
        let totalSizeDelta;
        let ttClicked = false;

        function setOriginalWidth(oWidth) {
            originalWidth = oWidth;
            setBuddySize(originalWidth + totalSizeDelta);
        }
    
        function updateSizeDelta() {
            chrome.storage.local.get("totalSizeDelta", (result) => {
                let res = result["totalSizeDelta"]
                if (res !== undefined) {
                    totalSizeDelta = res;
                }
            })
        }
        
        function updateOriginalWidth() {
            chrome.runtime.sendMessage({
                action: "requestOWidth",
            });
        }

        updateOriginalWidth()
        updateSizeDelta()

        dragMDtarget.addEventListener("mousedown", function(event) {
            ttClicked = true;
            let resizeBGColor = "rgba(163, 151, 150, 0.7)"
            buddyDiv.style.background = resizeBGColor;
            
            if (totalSizeDelta === undefined) {
                //maybe important to put something here idk
            }
            startX = event.clientX;
            startY = event.clientY;

            dragMDtarget.addEventListener("mousemove", mouseMoveHandler);
        });

        document.addEventListener("mouseup", function(event) {
            buddyDiv.style.background = "transparent";
            if (event.target.id === undefined) {
                //for if you max out the size and click outside bounds
                setBuddySize(originalWidth);
                totalSizeDelta = 0;
            } else if (ttClicked) { //basically if tt is not clicked, but you run this code anyway, it'll max out the size
                //the next time you try to interact with the buddy
                let localSizeDelta = startX - event.clientX;
            
                if (totalSizeDelta === undefined) {
                    totalSizeDelta = localSizeDelta;
                } else {
                    totalSizeDelta += localSizeDelta;
                }
                /*
                console.log(
                    "Mouse released, dist traveled: " , startX - event.clientX , 
                    "LocalSizeDelta: " , localSizeDelta , 
                    ", TotalSizeDelta: " , totalSizeDelta
                )*/

                //Now we gotta store the totalSizeDelta
                if (totalSizeDelta < -100) {
                    totalSizeDelta = -100;
                } else if (totalSizeDelta > 0) {
                    totalSizeDelta = 0;
                }
            }
            
            if (ttClicked) {
                chrome.storage.local.set({"totalSizeDelta": totalSizeDelta}, () => {
                    //console.log("--tsd set: " , totalSizeDelta)
                });
                ttClicked = false;
            }
            // remove the mousemove event listener and mouseup (this one)
            dragMDtarget.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseMoveHandler);
        });


        

        var curX;
        var curY;
        // function to handle mousemove events
        function mouseMoveHandler(event) {
            curX = event.clientX;
            curY = event.clientY;
            let xDist = startX - curX;
            
            
            console.log(
                "owidth: " , originalWidth , 
                ", totalsizedelta: " , totalSizeDelta , 
                ", xdist: " , xDist , 
                "curx: " , curX
            )

            if (totalSizeDelta !== undefined) {
                if (totalSizeDelta + xDist + originalWidth > originalWidth) {
                    setBuddySize(originalWidth);
                } else if (totalSizeDelta + xDist + originalWidth < 50) {
                    setBuddySize(50);
                } else {
                    setBuddySize(originalWidth + totalSizeDelta + xDist);
                }
            } else {
                setBuddySize(originalWidth + xDist);
            }
        }

        function resizeValuesAreValid(size) {
            //units in pixels
            let min = 50;
            let max = 152; 
            return (size >= min && size <= max)
        }

        function setBuddySize(newSize) {
            if (resizeValuesAreValid(newSize)) {
                let newWidth = 100;
                newWidth = newSize;
                buddy.style.width = newWidth.toString() + "px";
            }
        }





        var popup;
        function createPopup() {
            popup = document.createElement("div");
            popup.id = "goal-change-popup";

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
            titleLabel.id = "popup-title-label";
            popup.appendChild(titleLabel);

            var goalLabel = document.createElement("label");
            goalLabel.innerHTML = "New Goal Length";
            popup.appendChild(goalLabel);

            var newGoalInput = document.createElement("input");
            newGoalInput.type = "text";
            newGoalInput.placeholder = "New Work Timer";
            popup.appendChild(newGoalInput);

            var breakLabel = document.createElement("label");
            breakLabel.innerHTML = "New Break Length";
            popup.appendChild(breakLabel);
            
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
            const data = await new Promise((resolve) => {
                chrome.storage.sync.get("phase", resolve);
            });
            //DO NOT FORGET JSON.parse OR ELSE YOUR RESULT STRING WILL INCLUDE QUOTES.
            ret_me = JSON.parse(data.phase);
            return ret_me;
        }


        chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => { //from background.js
            const {type, newURL} = obj;
            if (type === "NEWSPRITE") {
                buddy.src = chrome.runtime.getURL(newURL);
            }
        });

        //updates the innerhtml of our timer label
        async function updateTimerLabel(cur_time) {
            var phase = await getPhase();
            if (phase !== undefined) {
                var flavorString = "";
                if (phase === "WORK") {
                    flavorString = "Work time: <br> ";
                } else if (phase === "BREAK") {
                    flavorString = "Break time: <br> ";
                }

                if (timerLabelExists) {
                    timerLabel.innerHTML = flavorString + cur_time;
                } else {
                    console.log("tl dne")
                }
            }   
        }

        function setVisibility(new_visibility) {
            worldExists = document.getElementById("buddy_world")
            if (new_visibility && (!worldExists)) {//the second condition is so we don't append world again if it exists already
                documentbody.appendChild(world);
            } else if (!new_visibility && (worldExists)) {
                documentbody.removeChild(world);
            }
        }

        function setTimerVisibility(new_timer_visibility) {
            //Bug here

            /*worldExists = document.getElementById("buddy_world")
            bubbleExists = document.getElementById("bubble-img")
            bubbleDivExists = document.getElementById("bubble-div")
            timerLabelExists = document.getElementById("timer-label");

            if (!new_timer_visibility && (worldExists) && bubbleExists && bubbleDivExists && timerLabelExists) {
                //worldExists.removeChild(bubbleDiv);
                
                bubbleDiv.removeChild(bubble);
                bubbleDiv.removeChild(timerLabel);
                
            } else if (new_timer_visibility && (worldExists) && bubbleExists && bubbleDivExists && timerLabelExists) {
                
                bubbleDiv.appendChild(bubble);
                bubbleDiv.appendChild(timerLabel);
                
                //worldExists.appendChild(bubbleDiv);
            }*/

            worldExists = document.getElementById("buddy_world")
            bubbleExists = document.getElementById("bubble-img")
            /*bubbleDivExists = document.getElementById("bubble-div")
            timerLabelExists = document.getElementById("timer-label");
            */
            //console.log("here 3" , worldExists, bubbleExists, bubbleDivExists, timerLabelExists)
            //console.log("here 2" , worldExists === true , bubbleExists === true , bubbleDivExists === true , timerLabelExists === true)
            
            if (!new_timer_visibility && (worldExists) && bubbleExists/* && bubbleDivExists && timerLabelExists*/) {
                //console.log("making invis")
                /*
                bubbleDiv.removeChild(bubble);
                bubbleDiv.removeChild(timerLabel);
                */
                world.removeChild(bubbleDiv)
            } else if (new_timer_visibility && (worldExists)) {
                //console.log("here")
                
                
                world.appendChild(bubbleDiv)
                //console.log("making vis")
                /*
                bubbleDiv.appendChild(bubble);
                bubbleDiv.appendChild(timerLabel);
                */
            }
        }

        //VOLUME STUFF//

        function setVolume(newVol) {
            console.log("volume: " , newVol)
            if (newVol === 0) {
                audio.volume = 0;
            } else {
                let convertedVol = newVol / 100;
                audio.volume = convertedVol;
            }
            playTransitionSound();
        }

        var audio = new Audio();
        audio.src = chrome.runtime.getURL("assets/sounds/timer_1.mp3");
        audio.volume = 0.3;
        function playTransitionSound() {
            //Stop all currently running plays of the audio before starting our new one
            if (audio !== undefined) {
                audio.pause();
                audio.currentTime = 0;
                //Play the audio file
                audio.play();
            }
        }
        
        ///THE LISTENER BLOCK
        chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
            const {type, value, videoId } = obj;
            if (type === "NEWVOLUME") {
                
                console.log("VOLUME CHANGE: " , value)
            }

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
                playTransitionSound();
                chrome.runtime.sendMessage({
                    action: "togglePhase"
                });
            } else if (type === "TOGGLEVISIBILITY") {
                let new_visibility = value;
                setVisibility(new_visibility);
            } else if (type === "NEWVOLUME") {
                newVolume = value;
                setVolume(newVolume);
            } else if (type === "ORIGINALSIZE") {
                let originalSize = value;
                setOriginalWidth(originalSize)
            } else if (type === "UPDATESIZEDELTA") {
                updateSizeDelta()
            } else if (type === "UPDATESIZE") {
                setBuddySize(originalWidth + totalSizeDelta);
            } else if (type === "TOGGLETIMERVISIBILITY") {
                let new_timer_visibility = value;
                //console.log("setting timer visibility: " , value)
                setTimerVisibility(new_timer_visibility);
                
            }
        });

        function setDeploymentBackgrounds() { //For debug mode
            bubbleDiv.style.background = "transparent";
            buddy.style.background = "transparent";
            world.style.background = "transparent";
            buddyDiv.style.background = "transparent";
        }
        //setDeploymentBackgrounds(); //important
    }

    

    function loadFonts() {
        const fontUrl = chrome.runtime.getURL('assets/fonts/PixelOperator.ttf');
        const fontCss = `
        @font-face {
            font-family: 'Press Start 2P';
            src: url(${fontUrl}) format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        `;
        const styleEl = document.createElement('style');
        styleEl.textContent = fontCss;
        document.head.appendChild(styleEl);
    }
    
    loadFonts();
    newPageLoaded(); //important
})();
