$(document).ready(function() {
    console.log("Loading Jquery...");
    $("#welcomeModal").modal('show')
    handleMusic()
    setPlayerName()
});

let selectedMode = null;

let playerName = "Unnamed"

function setPlayerName(){
    if (playerName.length == 0) {
        playerName = "unnamed"
    }
    $playerNameDisplay.html(`${playerName}`)
}
const $playerNameDisplay = $("#playerNameDisplay")

let progressLoad = 0;
let tips = []
let myLeaderboard = [

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


$("#startBtn").click(function (e) { 
    if(!selectedMode) return alert("Pilih mode dulu!");
    // showPage("loadingPage")
    // startGame(selectedMode);

    startLoad(selectedMode)
    music.pause();
    isMusicPlaying = true;
    e.preventDefault();
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
    if (isMusicPlaying) {
        music.play();
    }
});
$("#confirmEndGameBtn").click(function () {
    clearInterval(timer);
    $("#endGameModal").modal('hide');
    // showPage("mainMenuPage"); 
    arcadeMusic.pause();
    if (isMusicPlaying) {
        music.play();
    }
});

$("#backBtn").click(function (e) { 
    showPage("mainMenuPage");
    e.preventDefault();
    
});

$("#backLeaderBtn").click(function (e) { 
    showPage("mainMenuPage");
    e.preventDefault();
    
});

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
const music = document.getElementById("bgMusic");
const arcadeMusic = document.getElementById("arcadeMusic");
let confirmMusic = false

function saveName(){
    playerName = $("#inputName").val()
    alert(playerName)
    setPlayerName()
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
        sound.volume = 0.4; //ganti volume
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