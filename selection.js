import { constants } from './constants.js';

let currentSpriteSet = constants.sprites.barry.active

document.addEventListener("DOMContentLoaded", async () => {
    console.log("here");
    addSelectionListeners();
    var spritePlayer = new SpritePlayer(currentSpriteSet)
    spritePlayer.startSpriteLoop();
});


function addSelectionListeners() {
    let larrow = document.getElementById("left");
    let rarrow = document.getElementById("right");
    larrow.addEventListener('click', larrowHandler);
    rarrow.addEventListener('click', rarrowHandler);
}

function larrowHandler() {
    console.log("left");
}

function rarrowHandler() {
    console.log("right");
}



class SpritePlayer {
    constructor(spriteSet) {
        this.img = document.getElementById("thumbnail");
        this.curSpriteSet = spriteSet;
        this.spriteIndex = "00";
        this.maxSpriteIndex = this.curSpriteSet.frames;
        
        console.log("diag: " + this.curSpriteSet, this.maxSpriteIndex)
    }

    updateSprite() {
        var newURLPath = this.curSpriteSet.path + this.spriteIndex + ".png"
        this.img.src = newURLPath;

        this.spriteIndex = parseInt(this.spriteIndex)
        this.spriteIndex++;
        if (this.spriteIndex > this.maxSpriteIndex) {
            this.spriteIndex = "00";
        }
        this.spriteIndex = this.spriteIndex.toString();

        if (this.spriteIndex.length === 1) {
            this.spriteIndex = "0" + this.spriteIndex;
        }
    }

    startSpriteLoop() {
        var fps = this.curSpriteSet.framerate;
        var timeInterval = 1000 / fps; //this is how often we gotta update the loop to maintain our fps. //this is in ms, so 1000ms per second.
        setInterval(this.updateSprite.bind(this), timeInterval);
    }
}


