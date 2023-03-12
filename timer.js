export class Timer {
    constructor(length) { //length in minutes
        this.length = length;
        this.timerInterval;
        this.startTime;
        this.elapsedTime = 0;
        this.isPaused = false;
        this.timeString;
        this.maxInterval = length * 60 * 1000;
        this.isRunning = false;
        this.remainingTime = 0;
        //this.document = document;
        //this.elementID = elementID;
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
            this.maxInterval = this.remainingTime; 
            this.timerInterval = setInterval(this.updateTimer.bind(this), 10);
            
        } else if (!this.isPaused && this.isRunning) {
            this.isPaused = true;
            this.isRunning = false;
            this.remainingTime = this.maxInterval - this.elapsedTime; 
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
        let minutes = Math.floor(this.elapsedTime / 60000);
        let seconds = Math.floor((this.elapsedTime % 60000) / 1000);
        let milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
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
        //element should be "timer_label" as a string
        //content will be timeString
        
        //document.getElementById(elementID).innerHTML = "Time Passed: <br>" + this.timeString;
        return this.timeString
    }

    test(message) {
        console.log("testing message: " + message);
    }

    getRunState() {
        return this.isRunning;
    }

    updateDisplay() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            //this works to send a message to contentScript
            chrome.tabs.sendMessage(activeTab.id, { type: "NEWTIME", value: this.timeString });
        });
    }
}
/*
const temp = new Timer(15);

temp.startTimer();

console.log(temp.getTime());
*/