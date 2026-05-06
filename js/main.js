$(document).ready(function() {
    console.log("Loading Jquery...");
});

let selectedMode = null;
let progressLoad = 0;
let tips = []
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
        isMusicPlaying = false;
    }
});


$("#startBtn").click(function (e) { 
    if(!selectedMode) return alert("Pilih mode dulu!");
    // showPage("loadingPage")
    // startGame(selectedMode);

    startLoad(selectedMode)
    music.pause();
    isMusicPlaying = false;
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

// function to run when back button is clicked
$("#backMenuBtn").click(function (e) { 

    showPage("mainMenuPage");
    clearInterval(timer);
    // toggleMusic()
    $("#startBtn").attr('removed',true)
    e.preventDefault();
    
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
music.volume = 0.3
var confirmMusic = confirm("Want music playing?")
let isMusicPlaying = false;

if (confirmMusic) {
    isMusicPlaying = false
} else{
    isMusicPlaying = true
}
    toggleMusic()
document.getElementById("musicBtn").onclick = () => {
    toggleMusic()
};

function toggleMusic(){
    if (isMusicPlaying) {
        music.pause();
        isMusicPlaying = false;
        document.getElementById("musicBtn").innerText = "⏸️"
    } else{
        music.play();
        isMusicPlaying = true;
        document.getElementById("musicBtn").innerText = "🎵";
    }
}
let soundOn = true;

document.getElementById("soundBtn").onclick = () => {
    soundOn = !soundOn;

    // ON = volume normal
    // OFF = mute semua
    music.muted = !soundOn;

    document.getElementById("soundBtn").innerText = soundOn ? "🔊" : "🔇";
};