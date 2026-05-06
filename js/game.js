let level = 1;
let puzzlesCompleted = 0
let solution = [];
let currentGrid = [];
let inputs = [];

let hintCount = 3;
let timer = null;
let timeLeft = 0;
let score = 0;
let minis = 0;
let minSoal = 3

let mode = "relaxed";

let arcadeTimeSeconds = 60

let wordsBank = []


$.getJSON("json/levels.json",
    function (data) {
        wordsBank = data;
console.log("Words loaded!");
console.log(wordsBank.length)
$("#wordsCount").html(`<b>${wordsBank.length}</b>`)
    }
).fail(()=>{
    console.error("Failed to open words data list.");
});


function checkAutoComplete(){
    for(let i=0;i<solution.length;i++){
        for(let j=0;j<solution[i].length;j++){
            if(solution[i][j] && currentGrid[i][j] !== solution[i][j]){
                return false;
            }
        }
    }
    nextBoard()
    return true;
}

/* START */
function startGame(m){
    mode = m;
    level = 1;
    puzzlesCompleted = 0
    showPage("gamePage");

    resetTimer();
    loadLevel(level);
}

/* GENERATE LEVEL DINAMIS */
function generateLevel(level){
    //let jumlahSoal = level + 3;
    let minSoal = level + 3
    if (mode == 'arcade') {
        minSoal = level + 1
    }
    let jumlahSoal = Math.min(minSoal, wordsBank.length);
    if (jumlahSoal < 2) {
        jumlahSoal = 2
    } else if (jumlahSoal > 10){
        jumlahSoal = 10
    }
    let size = 15;

    shuffleArray(wordsBank);
    let selected = wordsBank.slice(0, jumlahSoal);

    let grid = Array(size).fill().map(()=>Array(size).fill(""));

    let data = { size:size, across:[], down:[] };

    let center = Math.floor(size/2);

    // 🔵 1. Kata pertama (mendatar)
    let first = selected[0];
    let startCol = center - Math.floor(first.word.length/2);

    placeWord(first.word, center, startCol, true, grid);

    data.across.push({
        row:center,
        col:startCol,
        word:first.word,
        clue:first.clue
    });

    // 🔵 2. Kata berikutnya HARUS nyilang
    for(let i=1;i<selected.length;i++){
        let w = selected[i];
        let placed = false;

        for(let a of data.across.concat(data.down)){
            let baseWord = a.word;

            for(let j=0;j<w.word.length;j++){
                for(let k=0;k<baseWord.length;k++){

                    if(w.word[j] === baseWord[k]){
                        let row, col, isAcross;

                        if(a.row !== undefined){ // kata existing
                            if(data.across.includes(a)){
                                // existing mendatar → baru harus menurun
                                row = a.row - j;
                                col = a.col + k;
                                isAcross = false;
                            }else{
                                // existing menurun → baru mendatar
                                row = a.row + k;
                                col = a.col - j;
                                isAcross = true;
                            }

                            if(canPlaceWord(w.word, row, col, isAcross, grid, size)){
                                placeWord(w.word, row, col, isAcross, grid);

                                if(isAcross){
                                    data.across.push({
                                        row, col,
                                        word:w.word,
                                        clue:w.clue
                                    });
                                }else{
                                    data.down.push({
                                        row, col,
                                        word:w.word,
                                        clue:w.clue
                                    });
                                }

                                placed = true;
                                break;
                            }
                        }
                    }
                }
                if(placed) break;
            }
            if(placed) break;
        }
    }

    return data;
}

const $levelTitle = $("#levelTitle");
const $boardCompleted = $("#boardCompleted");
const $timerText = $("#timerText");
const $scoreText = $("#scoreText")

/* LOAD LEVEL */
function loadLevel(lv){
    hintCount = 3;
    updateHintUI();
    $scoreText.html(score)
    let data = generateLevel(lv);

    $levelTitle.html(`Level ${lv}`);
    $boardCompleted.html(`${puzzlesCompleted}`)
    // document.getElementById("levelTitle").innerText = "Level " + lv;

    let size=data.size;
    solution = Array(size).fill().map(()=>Array(size).fill(""));
    currentGrid = Array(size).fill().map(()=>Array(size).fill(""));
    inputs=[];

    const processCrossword = (wordlist, across) =>{
        wordlist.forEach(w => {
            let reveal = Math.floor(Math.random()*w.word.length)

            for(let i=0;i<w.word.length;i++){
                let row = across? w.row : w.row+i
                let col = across? w.col+i: w.col
                let letterSolution = w.word[i]
                solution[row][col]=letterSolution;
                console.log(letterSolution);
                
                if (i === reveal) {
                    currentGrid[row][col] = letterSolution
                }
            }
        });
    }

    processCrossword(data.across,true)
    processCrossword(data.down,false)
    // data.across.forEach(w=>{
    //     for(let i=0;i<w.word.length;i++){
    //         solution[w.row][w.col+i]=w.word[i];
    //     }
    // });

    // data.down.forEach(w=>{
    //     for(let i=0;i<w.word.length;i++){
    //         solution[w.row+i][w.col]=w.word[i];
    //     }
    // });

    renderGrid(size);
    renderClues(data);
    //resetTimer();
}

/* GRID */
function renderGrid(size){
    // let grid=document.getElementById("crosswordGrid");
    // grid.style.gridTemplateColumns=`repeat(${size},50px)`;
    // grid.innerHTML="";

    // let number=1;

    // for(let i=0;i<size;i++){
    //     inputs[i]=[];
    //     for(let j=0;j<size;j++){
    //         let cell=document.createElement("div");
    //         cell.className="cell";

    //         if(solution[i][j]===""){
    //             cell.classList.add("block");
    //         }else{
    //             let input=document.createElement("input");
    //             input.maxLength=1;

    //             input.oninput=function(){
    //                 this.value=this.value.toUpperCase();
    //                 currentGrid[i][j]=this.value;
    //             };

    //             if((j===0||solution[i][j-1]==="")||(i===0||solution[i-1][j]==="")){
    //                 let num=document.createElement("div");
    //                 num.className="cell-number";
    //                 num.innerText=number++;
    //                 cell.appendChild(num);
    //             }

    //             cell.appendChild(input);
    //             inputs[i][j]=input;
    //         }

    //         grid.appendChild(cell);
    //     }
    // }
    const $grid = $("#crosswordGrid");

    $grid.css('grid-template-columns', `repeat(${size},50px)`);
    $grid.empty()

    let number = 1
    
    for (let r = 0; r < size; r++) {
        inputs[r] = [];
        for (let c = 0; c < size; c++) {
            
            let $cell = $('<div></div>').addClass('cell')
            if (solution[r][c] == "") {
                $cell.addClass('block');
            } else{
                let $input = $('<input>').attr('maxlength',1)

                //reveal
                if (currentGrid[r][c] != "") {
                    $input.val(currentGrid[r][c])
                    $input.addClass('bg-info');
                    $input.attr('readonly', true);
                }

                //$input.on('input', function () {
                //    let value = $(this).val().toUpperCase();
                //    $(this).val(value);
                //    currentGrid[r][c]
                //});
                $input.on('input', function () {
                    let value = $(this).val().toUpperCase();
                    $(this).val(value);
                    currentGrid[r][c] = value;
                    if(checkAutoComplete()){
                        $("#nextLevelBtn").removeAttr("disabled"); 
                    } else {
                        $("#nextLevelBtn").attr("disabled", true); 
                    }
                });

                if ((c === 0 || solution[r][c - 1] === "") || (r === 0 || solution[r - 1][c] === "")) {
                    let $num = $('<div></div>')
                        .addClass('cell-number')
                        .text(number++);
                    $cell.append($num);
                }

                $cell.append($input);
                inputs[r][c] = $input
            }
            $grid.append($cell)
        } 
    }
}

const addHint = () => hintCount++

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/* CLUES */
function renderClues(data){
    // let across=document.getElementById("acrossClue");
    // let down=document.getElementById("downClue");

    // across.innerHTML="";
    // down.innerHTML="";

    // data.across.forEach((w,i)=>{
    //     across.innerHTML+=`<li>${i+1}. ${w.clue}</li>`;
    // });

    // data.down.forEach((w,i)=>{
    //     down.innerHTML+=`<li>${i+1}. ${w.clue}</li>`;
    // });

    let $across= $('#acrossClue');
    let $down= $('#downClue');


    $across.empty();
    $down.empty();

    $.each(data.across, function (i, w) { 
        $across.append(`<li>${i+1}. ${w.clue}</li>`);
    });
    $.each(data.down, function (i, w) { 
        $down.append(`<li>${i+1}. ${w.clue}</li>`);
    });
}

/* TIMER */
function resetTimer(){
    clearInterval(timer);

    let timedisplay = ""
    if(mode==="relaxed"){
        $timerText.html("Relaxed");
        // document.getElementById("timerText").innerText="Time: ∞";
        return;
    }

    timeLeft = ((mode==="arcade") ? arcadeTimeSeconds : 10*60)*100;

    // Display Time

    document.getElementById("timerText").innerText="Time: "+timeLeft;
    timer=setInterval(()=>{

        timeLeft--;

        let totalSeconds = Math.floor(timeLeft / 100);
            
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
            
        let centis = timeLeft % 100;

        let mDisplay = minutes < 10 ? "0" + minutes : minutes;
        let sDisplay = seconds < 10 ? "0" + seconds : seconds;
        let msDisplay = centis < 10 ? "0" + centis : centis;
        let timerDisplay = `${mDisplay}:${sDisplay}.${msDisplay}`
        $timerText.html(`${timerDisplay}`);
        // document.getElementById("timerText").innerText="Time: "+timeLeft;

        if(timeLeft<0){
            clearInterval(timer);
            alert("Waktu habis!\nGame over!");
            level=1;
            loadLevel(level);
        }
    },10);
}

    let $hint = $("#hintBtn");
    let hintcount = `HINT (${hintCount})`
/* HINT */
function updateHintUI(){
    if (hintCount == 0) {
        $hint.attr("disabled",true);
    } else{
        $hint.removeAttr("disabled");
    }
    document.getElementById("hintBtn").innerText="HINT ("+hintCount+")";
    // $hint.text(hintCount)
    
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
    console.log(kosong);
    

    if(kosong.length===0) return;

    let rand=kosong[Math.floor(Math.random()*kosong.length)];
    let huruf=solution[rand.i][rand.j];

    let $input = inputs[rand.i][rand.j]; 
    currentGrid[rand.i][rand.j]=huruf;
    $input.val(huruf);

    $input.addClass('revealed').attr('readonly', true);
    $input.addClass('bg-success');
    hintCount--;
    updateHintUI();
};

function canPlaceWord(word, row, col, isAcross, grid, size){
    for(let i=0;i<word.length;i++){
        let r = isAcross ? row : row + i;
        let c = isAcross ? col + i : col;

        if(r<0 || c<0 || r>=size || c>=size) return false;

        if(grid[r][c] !== "" && grid[r][c] !== word[i]){
            return false;
        }
    }
    return true;
}


function placeWord(word, row, col, isAcross, grid){
    for(let i=0;i<word.length;i++){
        let r = isAcross ? row : row + i;
        let c = isAcross ? col + i : col;
        grid[r][c] = word[i];
    }
}

/* CHECK */
//document.getElementById("checkBtn").onclick=()=>{
//    for(let i=0;i<solution.length;i++){
//        for(let j=0;j<solution.length;j++){
//            if(solution[i][j] && currentGrid[i][j]!==solution[i][j]){
//                return alert("Masih salah!");
//            }
//        }
//    }
//    alert("Benar!");
//};

/* NEXT */
document.getElementById("nextLevelBtn").onclick=()=>{
    for(let i=0;i<solution.length;i++){
        for(let j=0;j<solution[i].length;j++){
            if(solution[i][j] && currentGrid[i][j]!==solution[i][j]){
                return alert("Tidak bisa lanjut!");
            }
        }
    }


};

function nextBoard(){
    let wordConfirm = "Board complete!"

    puzzlesCompleted++
    if (puzzlesCompleted % 3 == 0) {
        wordConfirm = "3 boards completed!\nLevel has been increased."
        if (mode == 'arcade') {
            timeLeft += level*15*100
            wordConfirm += "\nTime extended!"
            console.log(timeLeft)
        }
        level++   
    }
    alert(wordConfirm)
    loadLevel(level);
}