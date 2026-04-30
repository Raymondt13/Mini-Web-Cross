let level = 1;
let solution = [];
let currentGrid = [];
let inputs = [];

let hintCount = 3;
let timer = null;
let timeLeft = 0;
let mode = "relaxed";

/* START */
function startGame(m){
    mode = m;
    level = 1;
    showPage("gamePage");
    loadLevel(level);
}

/* GENERATE LEVEL DINAMIS */
function generateLevel(level){
    let wordsBank = [
        {word:"APEL", clue:"Buah merah"},
        {word:"AIR", clue:"Yang diminum"},
        {word:"API", clue:"Panas"},
        {word:"BUKU", clue:"Untuk membaca"},
        {word:"MEJA", clue:"Tempat makan"},
        {word:"KAKI", clue:"Untuk berjalan"},
        {word:"MATA", clue:"Untuk melihat"},
        {word:"IKAN", clue:"Hewan air"},
        {word:"SUSU", clue:"Minuman putih"},
        {word:"ROTI", clue:"Makanan gandum"}
    ];

    let jumlahSoal = level + 1;
    let size = 7 + level;
    let selected = wordsBank.slice(0, jumlahSoal);

    let data = { size:size, across:[], down:[] };
    let center = Math.floor(size/2);

    // kata utama
    data.across.push({
        row:center,
        col:center-2,
        word:selected[0].word,
        clue:selected[0].clue
    });

    data.down.push({
        row:center,
        col:center-2,
        word:selected[1].word,
        clue:selected[1].clue
    });

    for(let i=2;i<selected.length;i++){
        let w = selected[i];

        if(i%2===0){
            data.across.push({
                row:center+i,
                col:1,
                word:w.word,
                clue:w.clue
            });
        }else{
            data.down.push({
                row:1,
                col:center+i,
                word:w.word,
                clue:w.clue
            });
        }
    }

    return data;
}

/* LOAD LEVEL */
function loadLevel(lv){
    hintCount = 3;
    updateHintUI();

    let data = generateLevel(lv);

    document.getElementById("levelTitle").innerText = "Level " + lv;

    let size=data.size;
    solution = Array(size).fill().map(()=>Array(size).fill(""));
    currentGrid = Array(size).fill().map(()=>Array(size).fill(""));
    inputs=[];

    data.across.forEach(w=>{
        for(let i=0;i<w.word.length;i++){
            solution[w.row][w.col+i]=w.word[i];
        }
    });

    data.down.forEach(w=>{
        for(let i=0;i<w.word.length;i++){
            solution[w.row+i][w.col]=w.word[i];
        }
    });

    renderGrid(size);
    renderClues(data);
    resetTimer();
}

/* GRID */
function renderGrid(size){
    let grid=document.getElementById("crosswordGrid");
    grid.style.gridTemplateColumns=`repeat(${size},50px)`;
    grid.innerHTML="";

    let number=1;

    for(let i=0;i<size;i++){
        inputs[i]=[];
        for(let j=0;j<size;j++){
            let cell=document.createElement("div");
            cell.className="cell";

            if(solution[i][j]===""){
                cell.classList.add("block");
            }else{
                let input=document.createElement("input");
                input.maxLength=1;

                input.oninput=function(){
                    this.value=this.value.toUpperCase();
                    currentGrid[i][j]=this.value;
                };

                if((j===0||solution[i][j-1]==="")||(i===0||solution[i-1][j]==="")){
                    let num=document.createElement("div");
                    num.className="cell-number";
                    num.innerText=number++;
                    cell.appendChild(num);
                }

                cell.appendChild(input);
                inputs[i][j]=input;
            }

            grid.appendChild(cell);
        }
    }
}

/* CLUES */
function renderClues(data){
    let across=document.getElementById("acrossClue");
    let down=document.getElementById("downClue");

    across.innerHTML="";
    down.innerHTML="";

    data.across.forEach((w,i)=>{
        across.innerHTML+=`<li>${i+1}. ${w.clue}</li>`;
    });

    data.down.forEach((w,i)=>{
        down.innerHTML+=`<li>${i+1}. ${w.clue}</li>`;
    });
}

/* TIMER */
function resetTimer(){
    clearInterval(timer);

    if(mode==="relaxed"){
        document.getElementById("timerText").innerText="Time: ∞";
        return;
    }

    timeLeft = (mode==="arcade") ? 60 : 600;

    timer=setInterval(()=>{
        timeLeft--;
        document.getElementById("timerText").innerText="Time: "+timeLeft;

        if(timeLeft<=0){
            clearInterval(timer);
            alert("Waktu habis!");
            level=1;
            loadLevel(level);
        }
    },1000);
}

/* HINT */
function updateHintUI(){
    document.getElementById("hintBtn").innerText="HINT ("+hintCount+")";
}

document.getElementById("hintBtn").onclick=()=>{
    if(hintCount<=0) return alert("Hint habis!");

    let kosong=[];
    for(let i=0;i<solution.length;i++){
        for(let j=0;j<solution.length;j++){
            if(solution[i][j] && currentGrid[i][j]!==solution[i][j]){
                kosong.push({i,j});
            }
        }
    }

    if(kosong.length===0) return;

    let rand=kosong[Math.floor(Math.random()*kosong.length)];
    let huruf=solution[rand.i][rand.j];

    currentGrid[rand.i][rand.j]=huruf;
    inputs[rand.i][rand.j].value=huruf;

    hintCount--;
    updateHintUI();
};

/* CHECK */
document.getElementById("checkBtn").onclick=()=>{
    for(let i=0;i<solution.length;i++){
        for(let j=0;j<solution.length;j++){
            if(solution[i][j] && currentGrid[i][j]!==solution[i][j]){
                return alert("Masih salah!");
            }
        }
    }
    alert("Benar!");
};

/* NEXT */
document.getElementById("nextLevelBtn").onclick=()=>{
    for(let i=0;i<solution.length;i++){
        for(let j=0;j<solution.length;j++){
            if(solution[i][j] && currentGrid[i][j]!==solution[i][j]){
                return alert("Tidak bisa lanjut!");
            }
        }
    }

    level++;
    loadLevel(level);
};