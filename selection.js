document.addEventListener("DOMContentLoaded", async () => {
    console.log("here");
    addSelectionListeners();
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
