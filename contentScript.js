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
        const buddyDivExists = document.getElementById("buddyDiv");
        if (!buddyDivExists) {
            buddyDiv = document.createElement("div");
            //buddy.src = chrome.runtime.getURL("assets/sprites/potion/inactive/1-inactive.png");
            buddyDiv.id = "buddyDiv";
            world.prepend(buddyDiv);
        }

        let buddy;
        const buddyExists = document.getElementById("squareslo");
        if (!buddyExists) {
            buddy = document.createElement("img");
            buddy.src = chrome.runtime.getURL("assets/sprites/barry/active/tile000.png");
            //buddy.src = chrome.runtime.getURL("assets/sprites/potion/inactive/1-inactive.png");
            buddy.title = "it's your lil pal";
            buddy.id = "squareslo";
            buddyDiv.prepend(buddy)
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
            timerLabel.innerHTML = "Click Me <br>To Start";
            //console.log(timerLabel.style.fontFamily);
            //timerLabel.style.fontFamily = "Press Start 2P"

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

        function setDeploymentBackgrounds() {
            
            bubbleDiv.style.background = "transparent";
            buddy.style.background = "transparent";
            world.style.background = "transparent";
            buddyDiv.style.background = "transparent";
            
            
        }
        /*
        world.style.zIndex = "1";
        buddyDiv.style.zIndex = "1";
        bubbleDiv.style.zIndex = "1";
        */
        setDeploymentBackgrounds();

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
                //console.log(newURL)
                buddy.src = chrome.runtime.getURL(newURL);
            }
        });

        //updates the innerhtml of our timer label
        async function updateTimerLabel(cur_time) {
            var phase = await getPhase();
            if (phase !== undefined) {
                var flavorString = "";
                if (phase === "WORK") {
                    flavorString = "Work time <br> Left: <br>";
                } else if (phase === "BREAK") {
                    flavorString = "Break time <br> Left: <br>";
                }

                if (timerLabelExists) {
                    timerLabel.innerHTML = flavorString + cur_time;
                } else {
                    //timer label doesnt exist yet
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
            } else if (type === "TOGGLEVISIBILITY") {
                new_visibility = value;
                setVisibility(new_visibility);
            }
        });
    }
    /*
    var font = new FontFace('Press Start 2P', 'url("PressStart2P-Regular.ttf") format("truetype")');
    font.load().then(function() {
        // Font loaded successfully
        // Load the buddy.css file dynamically
        var buddyStyles = document.createElement('link');
        buddyStyles.rel = 'stylesheet';
        buddyStyles.href = chrome.runtime.getURL('buddy.css');
        document.head.appendChild(buddyStyles);
        console.log("success")
    }).catch(function(error) {
        // Font failed to load
        console.log("failed")
        console.error('Font failed to load:', error);
    });
    */

    /*
    var font = new FontFace("Press Start 2P", "url('assets/fonts/PressStart2P-Regular.ttf')");
    document.fonts.add(font);

    font.load().then(function() {
        // The font has been loaded
        console.log("loaded")
        document.body.style.fontFamily = "Press Start 2P";
    }).catch(function(error) {
        // There was an error loading the font
        console.log("not loaded")
        console.error(error);  
    });
    */

    /*
    // Create a new style element
    var style = document.createElement('style');

    // Define the @font-face rule as a string
    var fontFaceRule = '@font-face { font-family: "Press Start 2P"; src: ' + chrome.runtime.getURL("PressStart2P-Regular.ttf"); + ' format("truetype"); }';

    // Set the text content of the style element to the @font-face rule
    style.textContent = fontFaceRule;

    // Append the style element to the head section of your HTML document
    document.head.appendChild(style);
    */

    const fontUrl = chrome.runtime.getURL('assets/fonts/PressStart2P-Regular.ttf');
    console.log(fontUrl)
    const fontCss = `
    @font-face {
        font-family: 'Press Start 2P';
        src: url(${fontUrl}) format('truetype');
        font-weight: normal;
        font-style: normal;
        font-stretch:ultra-condensed;
    }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = fontCss;
    document.head.appendChild(styleEl);

    newPageLoaded(); //important
    /*
    var fontUrl = chrome.runtime.getURL("PressStart2P-Regular.ttf");

    // Create a @font-face rule to load the font
    var fontFace = new FontFace("Press Start 2P", "url(" + fontUrl + ")");
    document.fonts.add(fontFace);

    // Apply the font to an element
    var timerLabel = document.getElementById("timer-label");

    timerLabel.style.fontFamily = "Press Start 2P";
    */
    
    
})();
