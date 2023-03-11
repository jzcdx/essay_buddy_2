export class Timer {
    constructor(length) { //length in minutes
        this.length = length;
        this.timerInterval;
        this.startTime;
        this.elapsedTime = 0;
        this.isPaused = false;
        this.timeString;
        //this.document = document;
        //this.elementID = elementID;
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

    updateLabel(element) { 
        //element should be "timer_label" as a string
        //content will be timeString
        
        //document.getElementById(elementID).innerHTML = "Time Passed: <br>" + this.timeString;
        element.innerHTML = "hi";
    }

    test(message) {
        console.log("testing message: " + message);
    }
}
/*
const temp = new Timer(15);

temp.startTimer();

console.log(temp.getTime());
*/