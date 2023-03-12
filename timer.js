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

            this.timerInterval = setInterval(this.updateTimer.bind(this), 10);
        } else if (!this.isPaused && this.isRunning) {
            this.isPaused = true;
            this.isRunning = false;
            this.pauseStart = Date.now();
            clearInterval(this.timerInterval);
        }
    }
    
    updateTimer() {
        let elapsedTimeMillis = Date.now() - this.startTime;
        this.elapsedTime = Math.floor(elapsedTimeMillis / 10) * 10;
        
        if (this.elapsedTime >= this.maxInterval) {
            clearInterval(this.timerInterval)
            this.isRunning = false;
        }

        this.updateTimeString();
        this.updateDisplay();
    }


    updateTimeString() {
        let inverse = this.maxInterval - this.elapsedTime 
        /*
        //use this instead if you want it to count up to the goal instead of vice versa.
        let minutes = Math.floor(this.elapsedTime / 60000);
        let seconds = Math.floor((this.elapsedTime % 60000) / 1000);
        let milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
        */
        let minutes = Math.floor(inverse / 60000);
        let seconds = Math.floor((inverse % 60000) / 1000);
        let milliseconds = Math.floor((inverse % 1000) / 10);
        this.timeString =
            this.padNumber(minutes) +
            ":" +
            this.padNumber(seconds) +
            "." +
            this.padNumber(milliseconds);
        
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
/*
const temp = new Timer(15);

temp.startTimer();

console.log(temp.getTime());
*/