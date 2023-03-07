
class Timer {
    constructor(length, document, elementID) { //length in minutes
        this.length = length;
        this.timerInterval;
        this.startTime;
        this.elapsedTime = 0;
        this.isPaused = false;
        this.timeString;
        this.document = document;
        this.elementID = elementID;
    }


    startTimer() {
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(this.updateTimer.bind(this), 10);
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
        this.isPaused = true;
    }
    
    updateTimer() {
        let elapsedTimeMillis = Date.now() - this.startTime;
        this.elapsedTime = Math.floor(elapsedTimeMillis / 10) * 10;
        let minutes = Math.floor(this.elapsedTime / 60000);
        let seconds = Math.floor((this.elapsedTime % 60000) / 1000);
        let milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
        this.timeString =
            this.padNumber(minutes) +
            ":" +
            this.padNumber(seconds) +
            "." +
            this.padNumber(milliseconds);
        this.updateLabel(this.elementID);
    }

    padNumber(num) {
        return num.toString().padStart(2, "0");
    }

    getTime() { //returns in milliseconds
        return this.elapsedTime;
    }

    updateLabel(elementID) { 
        //element should be "timer_label" as a string
        //content will be timeString
        this.document.getElementById(elementID).innerHTML = "Time Passed: <br>" + this.timeString;
    }
}



(() => {
    const documentbody = document.getElementsByTagName("BODY")[0];
    

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, value, videoId } = obj;
        if (type === "NEW") {
            console.log("--");
            console.log("drs: " + document.readyState);
            currentVideo = videoId;
            console.log("new received");
            newPageLoaded();
        }
    });

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
            //buddy.addEventListener("contextmenu", addNewBookmarkEventHandler);
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
            //bubble.addEventListener("click", addNewBookmarkEventHandler);
        }

        var timerLabel;
        const timerLabelExists = document.getElementById("timer-label");
        if (!timerLabelExists) {
            timerLabel = document.createElement("label");
            timerLabel.id = "timer-label";
            timerLabel.innerHTML = "Time Left: 00:00";

            bubbleDiv.append(timerLabel);
        }

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

        const timer = new Timer(15, document, timerLabel.id);
        timer.startTimer();
    }
    newPageLoaded();

})();


