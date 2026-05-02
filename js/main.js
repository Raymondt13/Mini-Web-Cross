$(document).ready(function() {
    console.log("Loading Jquery...");
});

let selectedMode = null;


$("#playBtn").click(() =>  { 
    showPage("selectModePage");
    
});
// $("#playBtn").click = () => showPage("selectModePage");

document.querySelectorAll(".mode-card").forEach(card=>{
    card.onclick=function(){
        document.querySelectorAll(".mode-card").forEach(c=>c.classList.remove("selected"));
        this.classList.add("selected");
        selectedMode=this.dataset.mode;
        if (selectedMode) {
            
    $("#startBtn").removeAttr("disabled");
}
    }
});


$("#startBtn").click(function (e) { 
    if(!selectedMode) return alert("Pilih mode dulu!");
    startGame(selectedMode);
    e.preventDefault();
});

// document.getElementById("startBtn").onclick=()=>{
//     if(!selectedMode) return alert("Pilih mode dulu!");
//     startGame(selectedMode);
// };

// function to run when back button is clicked
$("#backMenuBtn").click(function (e) { 

    showPage("mainMenuPage");
    clearInterval(timer);
    $("#startBtn").attr('removed',true)
    e.preventDefault();
    
});
$("#backBtn").click(function (e) { 
    showPage("mainMenuPage");
    e.preventDefault();
    
});

function showPage(id){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
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
let isMusicPlaying;

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