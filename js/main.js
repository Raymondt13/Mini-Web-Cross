let selectedMode = null;

document.getElementById("playBtn").onclick = () => showPage("selectModePage");

document.querySelectorAll(".mode-card").forEach(card=>{
    card.onclick=function(){
        document.querySelectorAll(".mode-card").forEach(c=>c.classList.remove("selected"));
        this.classList.add("selected");
        selectedMode=this.dataset.mode;
    }
});

document.getElementById("startBtn").onclick=()=>{
    if(!selectedMode) return alert("Pilih mode dulu!");
    startGame(selectedMode);
};

document.getElementById("backMenu").onclick=()=>showPage("mainMenuPage");

function showPage(id){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

/* MODAL */
const modal=document.getElementById("howtoModal");
document.getElementById("howtoBtn").onclick=()=>modal.style.display="flex";
document.getElementById("closeModal").onclick=()=>modal.style.display="none";
window.onclick=e=>{ if(e.target===modal) modal.style.display="none"; };


const music = document.getElementById("bgMusic");
let isMusicPlaying = false;

document.getElementById("musicBtn").onclick = () => {
    if(!isMusicPlaying){
        music.play();
        isMusicPlaying = true;
        document.getElementById("musicBtn").innerText = "⏸️";
    } else {
        music.pause();
        isMusicPlaying = false;
        document.getElementById("musicBtn").innerText = "🎵";
    }
};

let soundOn = true;

document.getElementById("soundBtn").onclick = () => {
    soundOn = !soundOn;

    // ON = volume normal
    // OFF = mute semua
    music.muted = !soundOn;

    document.getElementById("soundBtn").innerText = soundOn ? "🔊" : "🔇";
};