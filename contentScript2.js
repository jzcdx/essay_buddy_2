/*const sprites = [
  {
    key: 'angus',
    sprite_sets: {
        sit: 'asd',
        adjust_glasses: 'bbbb'
    } 
  }
];*/

(() => {
    //console.log(sprites);
    console.log("content script");
    
    /*the following few lines does absolutely nothing*/
    var link = document.createElement("link");
    link.href = chrome.runtime.getURL("buddy.css");
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.prepend(link);

    let buddy;

    const pageLoaded = async () => {
        console.log("page loaded");
        documentbody = document.getElementsByTagName("BODY")[0];
        
        
        const worldExists = document.getElementById("buddy_world");
        let world;
        if (!worldExists) {
            world = document.createElement("div");
            world.id = "buddy_world";
            
            let shimai = document.getElementById("shimai-world")
            documentbody.removeChild(shimai);

            //documentbody.appendChild(world);
            if (document.readyState == "complete") {
                console.log("complete");
                world.addEventListener("click", (event) => {
                    console.log("hiiiii");
                    console.log(myDiv);
                    /*
                    event.preventDefault(); 
                    chrome.contextMenus.create({
                        title: "My Context Menu",
                        contexts: ["page"],
                        onclick: () => {
                            console.log("Context menu item clicked");
                        }
                    });*/
                });
            } else if (document.readyState == "interactive") {
                console.log("interactive");
            }
            
            documentbody.prepend(world)
        }
        
        const buddyExists = document.getElementById("squareslo");
        if (!buddyExists) {
            buddy = document.createElement("img");
            buddy.src = chrome.runtime.getURL("assets/sprites/angus/talk/Bonfire_angus_talk1_00000.png");
            buddy.title = "it's your lil pal";
            buddy.id = "squareslo";
            
            world.prepend(buddy);
            //bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
        

        const addNewBookmarkEventHandler = async () => {
            console.log("bookmark listener clicked");
        }

        const function_1 = async () => {
            console.log("heree");
            const bubbleExists = document.getElementById("bubble-img");
            if (!bubbleExists) {
                bubble = document.createElement("img");
                bubble.src = chrome.runtime.getURL("assets/bubble.png");
                bubble.title = "click for the menu";
                bubble.id = "bubble-img";
                

                world.prepend(bubble);
                bubble.addEventListener("click", addNewBookmarkEventHandler);
            }
        }
        function_1();
        











    }
    
    pageLoaded();

    /*
    var spritenum = 0;
    setInterval(() => {
        console.log("drs 2: " + document.readyState);
        if (spritenum < 10) {
            buddy.src = chrome.runtime.getURL("assets/sprites/angus/talk/Bonfire_angus_talk1_0000" + spritenum + ".png");
            //buddy.src = chrome.runtime.getURL("assets/sprites/angus/adjust_glasses/Bonfire_angus_glasses_0000" + spritenum + ".png");
        } else {
            buddy.src = chrome.runtime.getURL("assets/sprites/angus/talk/Bonfire_angus_talk1_000" + spritenum + ".png");
            //buddy.src = chrome.runtime.getURL("assets/sprites/angus/adjust_glasses/Bonfire_angus_glasses_000" + spritenum + ".png");
        }
        spritenum++;
        if (spritenum > 13) {
            spritenum = 0;
        } 
        //console.log("spritenum: " + spritenum);
    }, 75);    
    */

})();




/* put this back into the matches later:
"matches": ["https://docs.google.com/*"]
or
"matches": [ "https://*.google.com/*" ]
*/
/*<div id="shimai-world" style="position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 2147483647; pointer-events: none; background: transparent;"></div>*/