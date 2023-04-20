export class Timer {
    constructor(length) { //length in minutes
        this.timerInterval;
        this.startTime;
        this.elapsedTime = 0;
        this.isPaused = false;
        this.timeString;
        this.maxInterval = length * 60 * 1000;
        this.isRunning = false;
        this.remainingTime = 0;
        
        this.pauseStart;
        this.pauseEnd;
        this.updateTimeString();
        this.phase = "WORK";
        this.msDisplay = false;
    }

    setMSDisplay(newMSD) {
        this.msDisplay = newMSD;
    }

    toggleMSDisplay() {
        this.msDisplay = !this.msDisplay;
    }

    getMSDisplay() {
        return this.msDisplay;
    }

    syncPhase() {
        chrome.storage.sync.set({
            ["phase"]: JSON.stringify(this.phase)
        });
    }   

    startTimer() {
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(this.updateTimer.bind(this), 10);
        this.isRunning = true;
        this.updateDisplay();
    }

    togglePause() {
        if (this.isPaused) {
            this.isPaused = false;
            this.isRunning = true;
            this.pauseEnd = Date.now();
            this.startTime += this.pauseEnd - this.pauseStart 

            this.timerInterval = setInterval(this.updateTimer.bind(this), 50);
        } else if (!this.isPaused && this.isRunning) {
            this.isPaused = true;
            this.isRunning = false;
            this.pauseStart = Date.now();
            clearInterval(this.timerInterval);
        }
    }
    
    endTimer() { //used in timer.updateTimer when time goes past

        clearInterval(this.timerInterval)
        this.isRunning = false;
        //the below code doesn't work yet
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            //this works to send a message to the contentscript of the tab that's active
            chrome.tabs.sendMessage(activeTab.id, { 
                type: "TOGGLEPHASE"
            }, () => { //once this message is sent, sync the phase with chrome storage.
                this.syncPhase();
            });
        });
    }

    updateTimer() {
        let elapsedTimeMillis = Date.now() - this.startTime;
        this.elapsedTime = Math.floor(elapsedTimeMillis / 10) * 10;
        
        if (this.elapsedTime >= this.maxInterval) {
            this.endTimer();
        }

        this.updateTimeString();
        this.updateDisplay();
    }


    updateTimeString() {
        let inverse = this.maxInterval - this.elapsedTime 
        
        let minutes = Math.floor(inverse / 60000);
        let seconds = Math.floor((inverse % 60000) / 1000);
        let milliseconds = Math.floor((inverse % 1000) / 10);
        this.timeString =
            this.padNumber(minutes) +
            ":" +
            this.padNumber(seconds)
        
        if (this.msDisplay) {
            this.timeString += "." + this.padNumber(milliseconds);
        }
    }
    

    padNumber(num) {
        return num.toString().padStart(2, "0");
    }

    getTime() { //returns in milliseconds
        return this.elapsedTime;
    }

    getTimeString() { 
        return this.timeString
    }

    //self explanatory
    test(message) {
        console.log("testing message: " + message);
    }

    getRunState() {
        return this.isRunning;
    }

    getPauseState() {
        return this.isPaused;
    }

    updateDisplay() {
        //gets active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            //this works to send a message to the contentscript of the tab that's active
            this.updateTimeString()
            chrome.tabs.sendMessage(activeTab.id, { type: "NEWTIME", value: this.timeString });
        });
    }

    //for the timer reset button
    reset() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.startTime = null;
        this.elapsedTime = null;
        this.isPaused = null;
        this.timeString = null;
        this.maxInterval = null;
        this.isRunning = null;
        this.remainingTime = null;

        this.pauseStart = null;
        this.pauseEnd = null;
    }
}