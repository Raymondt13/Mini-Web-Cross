$(document).ready(function() {
    console.log("Loading Jquery...");
    $("#welcomeModal").modal('show')
    // $("#customizePage").load("../shop.html");
    handleMusic()
    setPlayerName()

    loadSkinItems()
    loadArcadeMusic()
});

/**
 * The function to load skin items.
 */
    function loadSkinItems() {
        let $customize = $("#backgroundCustom")
        $customize.empty()

        skinItems.forEach((skin)=>{
            let btnText = skin.applied ? "Applied" : "Apply"
            let applyDisabled = skin.applied || minis < skin.cost ? "disabled" : ""
            let imgpath = skin.img == "" ? "" : skin.img
            let cardCost = skin.cost != 0 ? `🔷${skin.cost}` : ""

            let cardHtm = `
                <div class="col-4" >
                    <div class="card text-start" style="height:100%">
                        <img class="card-img-top" style="width:100%;height:20vh" src="${imgpath}" alt="Title" />
                        <div class="card-body">
                            <h4 class="card-title">${skin.skinName}</h4>
                            <p class="card-text">${skin.skinDesc}</p>
                            <p class="body text-secondary">${cardCost}</p>
                            <button ${applyDisabled} class="btn btn-primary 
                            btn-apply-skin" data-skinid="${skin.id}">
                            ${btnText}</button>
                        </div>
                    </div>
                </div>
            `

            $customize.append(cardHtm)
        })

        initSkinBtns()
    }

    function initSkinBtns() {
        $(".btn-apply-skin").each(function (index, element) {
            $(element).click(function (e) { 
                skinItems.forEach((it)=>{
                    it.applied = false
                })
                $(".btn-apply-skin").text("Apply")
                console.log(skinItems)
                console.log(this.dataset.skinid)
                let mySkin = skinItems[this.dataset.skinid]
                console.log(mySkin)
                $("body").css("background-image", `url("${mySkin.img}")`);
                mySkin.applied = true
                if (mySkin.applied) {
                    $(element).text("Applied")
                    console.log(element)
                }
                loadSkinItems()
                playSound('clickSound');
                e.preventDefault();
            });

        });
    }

function loadArcadeMusic() {
    let $customize = $("#arcadeMusicCustom")
    $customize.empty()
    arcadeMusicItems.forEach((skin)=>{
        let btnText = skin.applied ? "Applied" : "Apply"
        let applyDisabled = skin.applied || minis < skin.cost ? "disabled" : ""
        let cardCost = skin.cost != 0 ? `🔷${skin.cost}` : ""
        let cardHtm = `
            <div class="col-4">
                <div class="card">
                    <audio controls controlsList="nodownload">
                        <source src="/assets/music/${skin.musicPath}.mp3" type="audio/mp3">
                    </audio>
                    <div class="card-body">
                        <h4 class="card-title">${skin.musicName}</h4>
                        <p class="body text-secondary">${cardCost}</p>
                        <button class="btn btn-primary btn-apply-m-arcade" data-arcadeid="${skin.id}">${btnText}</button>
                    </div>
                </div>                    
            </div>
        `
        $customize.append(cardHtm)
    })
    initArcadeMusicBtns()
}
function initArcadeMusicBtns() {
    $(".btn-apply-m-arcade").each(function (index, element) {
        $(element).click(function (e) { 
            arcadeMusicItems.forEach((it)=>{
                it.applied = false
            })
            $(".btn-apply-m-arcade").text("Apply")
            console.log(arcadeMusicItems)
            console.log(this.dataset.arcadeid)
            let mySkin = arcadeMusicItems[this.dataset.arcadeid]
            console.log(mySkin)
            let arcadeHtml = `<source src="/assets/music/${mySkin.musicPath}.mp3" type="audio/mp3"> Audio not supported.`
            $("#arcadeMusic").empty();
            $("#arcadeMusic").append(
                arcadeHtml
            );
            document.getElementById("arcadeMusic").innerHTML = arcadeHtml
            mySkin.applied = true
            if (mySkin.applied) {
                $(element).text("Applied")
                console.log(element)
            }
            loadArcadeMusic()
            playSound('clickSound');
            e.preventDefault();
        });
    });
}
let selectedMode = null;

let playerName = "Unnamed"

function setPlayerName(){
    // if (playerName.length == 0) {
    //     playerName = "Guest"
    // }
    playerName = currentPlayer.name
    $playerNameDisplay.html(`${playerName}`)
}
const $playerNameDisplay = $("#playerNameDisplay")

let progressLoad = 0;
let tips = []
let myLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || []
let myPlayers = JSON.parse(localStorage.getItem("playerList")) || []

let currentPlayer = {
    id:"0",
    name: "Guest",
    minis: 0
}

let skinItems = [
    {
        id:"0",
        skinName:'Default',
        skinDesc:"Default, plain background.",
        cost: 0,
        applied: true,
        img:""
    },
    {
        id:"1",
        skinName:'Wood',
        skinDesc:'The natural feel of wood.',
        cost: 0,
        applied: false,
        img:"../assets/skins/background_wood.jpg"
    },
    {
        id:"2",
        skinName:'Geometric',
        skinDesc:'Some geometric hexagons.',
        cost: 100,
        applied: false,
        img:"../assets/skins/background_geometric.jpg"
    },
]

let arcadeMusicItems = [
    {
        id:"0",
        musicName:'Arcade 1',
        cost: 0,
        applied: true,
        musicPath:"music_arcade2"
    },
    {
        id:"1",
        musicName:'Arcade 2',
        cost: 0,
        applied: false,
        musicPath:"music_arcade"
    },
]
let otherItems = [
    {
        id:"0",
        itemName:"Low Opacity Mode",
        command:"lowopacity",
        cost: 0,
        unlocked: true,
        applied:false
    }
]
$.getJSON("json/tips.json",
    function (data) {
        tips = data
    }
).fail(()=>{
    console.error("Failed to open tips.");
    
});

$("#playBtn").click(() =>  { 
    showPage("selectModePage");
    
});
$("#leaderBtn").click(() =>  { 
    showPage("leaderboardPage");
    fetchLeaderboard('relaxed',"")
    
});
$("#customizeBtn").click(() =>  { 
    loadSkinItems()
    showPage("customizePage");
    
});
$("#leaderShowRelaxed").click(() =>  { 
    fetchLeaderboard('relaxed',"")  
});
$("#leaderShowArcade").click(() =>  { 
    fetchLeaderboard('arcade',"")  
});
$("#leaderShowTenmin").click(() =>  { 
    fetchLeaderboard('tenmin',"")  
});
// $("#playBtn").click = () => showPage("selectModePage");

document.querySelectorAll(".mode-card").forEach(card=>{
    card.onclick=function(){
        document.querySelectorAll(".mode-card").forEach(c=>c.classList.remove("selected"));
        // this.classList.add("selected");
        selectedMode=this.dataset.mode;
        // if (selectedMode) {
        //     $("#startBtn").removeAttr("disabled");
        // }
        startLoad(selectedMode)
        music.pause();
        isMusicPlaying = true;
    }
});

// Apply Skins

$(".btn-apply-other").each(function (index, element) {
    $(element).click(function (e) { 
        console.log(this.dataset.otherid)
        let myOther = otherItems[this.dataset.otherid]
        console.log(myOther)
        myOther.applied = !myOther.applied
        if (myOther.applied) {
$("body").css("opacity", `0.5`);   
        } else{
$("body").css("opacity", `1`);   
        }
        e.preventDefault();
        playSound('clickSound');
    });
});

$("#startBtn").click(function (e) { 
    if(!selectedMode) return alert("Pilih mode dulu!");
    // showPage("loadingPage")
    // startGame(selectedMode);

    startLoad(selectedMode)
    music.pause();
    isMusicPlaying = true;
    e.preventDefault();
        playSound('clickSound');
});

function startLoad(mode) {
    showPage("loadingPage")

    let width = 0;
    const $progressBar = $("#loadingProgress");
        $progressBar.text("")
    const loadingInterval = setInterval(() => {
        if (width >= 100) {
            clearInterval(loadingInterval);
            setTimeout(()=>startGame(mode),1000);
            width = 0
            $progressBar.text("Starting game...")
        } else {
            width += Math.floor(Math.random() * 10) + 1; 
            if(width > 100) width = 100;
            
            $progressBar.css("width", width + "%");
            $progressBar.attr("aria-valuenow", width);
            $progressBar.text(width + "%");
        }
    }, 250);
    const $tipText = $("#tipText");
    $tipText.html(tips[Math.floor(Math.random()*tips.length)].tip)
}

// document.getElementById("startBtn").onclick=()=>{
//     if(!selectedMode) return alert("Pilih mode dulu!");
//     startGame(selectedMode);
// };

// Confirm give up
$("#giveUpBtn").click(function (e) {
    e.preventDefault();
    $("#giveUpText").html(randomQuitMessage("confirmExit",mode))
    $("#endGameModal").modal('show');
    playSound('clickSound');
});

$(".btn").click(function (e) {
    e.preventDefault();
    playSound('clickSound');
});
function randomQuitMessage(category,gamemode){
    // pipeline gabungin array
    let messages = quitMessages[category][gamemode]
    let generalMessages = quitMessages[category]["general"]
    console.log(generalMessages)
    generalMessages.forEach(e => {
        messages.push(e)
    });
    return messages[Math.floor(Math.random()*messages.length)]
}

function randomGameOverMessage(category,gamemode){
let messages = quitMessages[category][gamemode]
return messages[Math.floor(Math.random()*messages.length)]
}
$("#confirmEndGameBtn").click(function () {
    clearInterval(timer);
    $("#endGameModal").modal('hide');
    gameOver('gameOverExit')
    playSound('clickSound');
    // showPage("mainMenuPage"); 
    // arcadeMusic.pause();
    // if (isMusicPlaying) {
    //     music.play();
    // }
});
$("#confirmExitBtn").click(function () {
    clearInterval(timer);
    $("#gameOverModal").modal('hide');
    showPage("mainMenuPage"); 
    arcadeMusic.pause();
    playSound('clickSound');
    if (isMusicPlaying) {
        music.play();
    }
});
$("#confirmEndGameBtn").click(function () {
    clearInterval(timer);
    $("#endGameModal").modal('hide');
    // showPage("mainMenuPage"); 
    playSound('clickSound');
    arcadeMusic.pause();
    if (isMusicPlaying) {
        music.play();
    }
});

$(".main-menu-btn").click(function (e) { 
    showPage("mainMenuPage");
    e.preventDefault();
    playSound('clickSound');
    
});

// $("#backLeaderBtn").click(function (e) { 
//     showPage("mainMenuPage");
//     e.preventDefault();
    
// });

function showPage(id){
    $('.page').removeClass("active");
    $(`#${id}`).addClass("active");

    // document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    // document.getElementById(id).classList.add("active");
}

/* MODAL */
const modal=document.getElementById("howtoModal");
// document.getElementById("howtoBtn").onclick=()=>modal.style.display="flex";
document.getElementById("closeModal").onclick=()=>modal.style.display="none";
window.onclick=e=>{ if(e.target===modal) modal.style.display="none"; };

// MUSIC
let music = document.getElementById("bgMusic");
let arcadeMusic = document.getElementById("arcadeMusic");
let confirmMusic = false

function saveName(){
    playerName = $("#inputName").val()
    let playerFound = getPlayerByName(playerName)
    console.log(playerFound)
    alert(playerName)
    if (!playerFound) {
        let newPlayer = {
            id:myPlayers.length+1,
            name: playerName,
            minis: 0
        }

        myPlayers.push(newPlayer)
        localStorage.setItem("playerList",JSON.stringify(myPlayers))
    }
    currentPlayer = playerFound
    minis = currentPlayer.minis
    $("#miniPoints").html(minis)
    setPlayerName()
}

function getPlayerByName(username){
    let playerFound = myPlayers.find(player => player.name == username)
    if (playerFound == undefined) {
        playerFound = null
    }
    return playerFound
}
// start
$("#startGameBtn").click(function(e){
    confirmMusic = true
    saveName()
})
$("#startGameNoSoundBtn").click(function(e){
    confirmMusic = false
    saveName()
})

/**
 * Function to fetch leaderboards
 */
function fetchLeaderboard(gamemode,user){
    let leaderboards = myLeaderboard.filter(lb => lb.mode == gamemode)
    .sort((a,b)=>{return b.score - a.score})

    const $leaderB = $("#leaderboardBody")
    $leaderB.empty()

    let leaderGameMode = "" 
    switch (gamemode) {
        case "tenmin":
            leaderGameMode = "10-Minute"
            break;
        case "arcade":
            leaderGameMode = "Arcade"
            break;
        case "relaxed":
            leaderGameMode = "Relaxed"
            break;
        default:
            break;
    }
    $("#leaderBoardTitle").html(leaderGameMode);
    if (leaderboards.length == 0) {
        $leaderB.append(`
            <tr>
            <td colspan="4">Be the first to score!</td>
            </tr>
            `)
    } else{
        leaderboards.forEach((ld,idx)=>{
            $leaderB.append(
                `
                    <tr class="">
                        <td scope="row">${idx+1}</td>
                        <td>${ld.name}</td>
                        <td>${ld.boards}</td>
                        <td>${ld.score.toLocaleString()}</td>
                    </tr>
                `
            )
        })
    }
}

let isMusicPlaying = false;

if (confirmMusic) {
    isMusicPlaying = true
} else{
    isMusicPlaying = false
}
    // toggleMusic()
document.getElementById("musicBtn").onclick = () => {
    toggleMusic()
};

function handleMusic(){
    let isGamePage = $('#gamePage').hasClass('active');
    
    if(isMusicPlaying){
        if (isGamePage && (mode === 'arcade' || mode === 'tenmin')) {
            music.pause();
            arcadeMusic.play();
        } else {
            arcadeMusic.pause();
            music.play();
        }
    } else {
        music.pause();
        arcadeMusic.pause();
    }
}
function toggleMusic(){
    if (isMusicPlaying) {
        isMusicPlaying = false;
        document.getElementById("musicBtn").innerText = "⏸️"
    } else{
        isMusicPlaying = true;
        document.getElementById("musicBtn").innerText = "🎵";
    }
    handleMusic()
}
let soundOn = true;

function playSound(soundId) {
    if (!soundOn) return;
    
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.7; //ganti volume
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

document.getElementById("soundBtn").onclick = () => {
    soundOn = !soundOn;

    // ON = volume normal
    // OFF = mute semua
    music.muted = !soundOn;
    arcadeMusic.muted = !soundOn

    document.getElementById("soundBtn").innerText = soundOn ? "🔊" : "🔇";
};

$("#clearLeaderboardBtn").click(function (e) { 
    clearLeaderboard()
    e.preventDefault();
    
});
function clearLeaderboard() {
    localStorage.removeItem("leaderboard")
    myLeaderboard = []
    fetchLeaderboard('relaxed')
}
function clearPlayers() {
    localStorage.removeItem("playerList")
    myPlayers = []
}