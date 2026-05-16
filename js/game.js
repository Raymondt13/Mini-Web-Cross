$(document).ready(function () {
    
$("#nextBoardBtn").click(function (e) { 
    playSound('clickSound');
    setTimer()
    console.log("Got you!");
    levelScore = 0
    e.preventDefault();

});
});

let level = 1;
let puzzlesCompleted = 0
let solution = [];
let currentGrid = [];
let inputs = [];
let quitMessages = []
/**
 * Score for this level
 */
let levelScore = 0


let hintCount = 3;
/**
 * Variable to run the timer
 */
let timer = null;
let timeLeft = 0;
let score = 0;
let scoreMultiplier = 1;
/**
 * Minis are used for purchase.
 * Minis are earned from playing games.
 */
let minis = 0;
let minSoal = 3

let mode = "relaxed";

let arcadeTimeSeconds = 60

let wordsBank = []
let usedCells = {};
let completedWords = {};

let currentLevelData = null;

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

$.getJSON("json/giveup.json",
    function(data){
        quitMessages = data
        console.log(quitMessages)
    }
).fail(()=>{
    console.error("Failed to obtain exit messages list.")
})

//Calculate Scoreboard
function addScoreByBoard() {
    let totalCharacters = 0;
    for (let i = 0; i < solution.length; i++) {
        for (let j = 0; j < solution[i].length; j++) {
            if (solution[i][j] !== "") {
                totalCharacters++;
            }
        }
    }
    let earnedScore = totalCharacters * 100;
    if (mode !== "relaxed") {
        earnedScore += Math.floor(timeLeft / 100);
    }
    score += earnedScore;
    $scoreText.html(score);
    return earnedScore;
}

function updatePartialScore(row, col, $input) {
    let cellKey = `${row}-${col}`;
    if (usedCells[cellKey]) {
        return false;
    }
    
    if (currentGrid[row][col] === solution[row][col]) {
        usedCells[cellKey] = true;
        let pointsEarned = 100 * scoreMultiplier;
        score += pointsEarned;
        $scoreText.html(score);
        
        let tileKey = `${row}-${col}`;
        if (specialTiles && specialTiles[tileKey]) {
            let tileType = specialTiles[tileKey];
            let result = activateTile({
                type: tileType,
                r: row,
                c: col,
                $input: $input,
                score: score,
                hintCount: hintCount,
                timeLeft: timeLeft,
                timer: timer,
                updateTimer: updateTimer,
                onUpdate: function(updated) {
                    score = updated.score;
                    hintCount = updated.hintCount;
                    timeLeft = updated.timeLeft;
                    timer = updated.timer;
                    if (tileType === 'multiply') {
                        scoreMultiplier = 2;
                    }
                    $scoreText.html(score);
                    updateHintUI();
                }
            });
        }
        return true;
    }
    return false;
}

function checkWordComplete(wordData, isAcross) {
    for (let i = 0; i < wordData.word.length; i++) {
        let j = isAcross ? wordData.row : wordData.row + i;
        let k = isAcross ? wordData.col + i : wordData.col;
        if (currentGrid[j][k] !== solution[j][k]) {
            return false;
        }
    }
    return true; 
}

function scoreCompletedWord(wordKey, wordData, isAcross) {
    if (completedWords[wordKey]) {
        return 0;
    }
    completedWords[wordKey] = true;
    
    let wordLength = wordData.word.length;
    let pointsEarned = wordLength * 100;
    score += pointsEarned;
    levelScore += pointsEarned
    $scoreText.html(score);
    console.log(`Kata complete: ${wordData.word} (+${pointsEarned})`);
    return pointsEarned;
}

function checkAllWordsCompletion() {
    if (!currentLevelData) return;
    currentLevelData.across.forEach((wordData, index) => {
        let wordKey = `across-${index}`;
        if (checkWordComplete(wordData, true)) {
            let points = scoreCompletedWord(wordKey, wordData, true);

            if (points > 0) {
                showWordCompleteEffect(wordData, true, points);
            }
        }
    });

    currentLevelData.down.forEach((wordData, index) => {
        let wordKey = `down-${index}`;
        if (checkWordComplete(wordData, false)) {
            let points = scoreCompletedWord(wordKey, wordData, false);
            if (points > 0) {
                showWordCompleteEffect(wordData, false, points);
            }
        }
    });
}

function showWordCompleteEffect(wordData, isAcross, points) {
    let $firstCell = inputs[wordData.row][wordData.col];
    if ($firstCell && typeof showFloatingText === 'function') {
        showFloatingText($firstCell, `${wordData.word} +${points}`);
    }
}

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
    score = 0
    puzzlesCompleted = 0
    showPage("gamePage");

    if (mode === 'arcade' || mode === 'tenmin') {
        music.pause();
        if (isMusicPlaying) {
            arcadeMusic.play();
        }
    } else {
        arcadeMusic.pause();
        if (isMusicPlaying) {
            music.play();
        }
    }

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
    console.log(jumlahSoal)
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
    currentLevelData = data;

    $levelTitle.html(`Level ${lv}`);
    $boardCompleted.html(`${puzzlesCompleted}`)
    // document.getElementById("levelTitle").innerText = "Level " + lv;

    let size=data.size;
    solution = Array(size).fill().map(()=>Array(size).fill(""));
    currentGrid = Array(size).fill().map(()=>Array(size).fill(""));
    inputs=[];
    usedCells = {};
    completedWords = {};
    scoreMultiplier = 1;
    
    $('.score-multiplier-active').remove();
    window.scoreMultiplierActive = false;

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
    if (typeof generateSpecialTiles === 'function') {
        specialTiles = generateSpecialTiles(solution, mode);
        console.log('Special tiles generated:', specialTiles);
    }

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

    $grid.css('grid-template-columns', `repeat(${size},40px)`);
    $grid.empty()

    let number = 1
    
    for (let r = 0; r < size; r++) {
        inputs[r] = [];
        for (let c = 0; c < size; c++) {
            
            let $cell = $('<div></div>').addClass('cell')
            if (solution[r][c] == "") {
                $cell.addClass('block');
            } else{
                if (typeof applyTileStyle === 'function') {
                    applyTileStyle($cell, r, c);
                }
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
                    
                    if (value && currentGrid[r][c] === solution[r][c]) {
                    if (typeof playSound === 'function') {
                        playSound('correctSound');
                    }
                    let cellKey = `${r}-${c}`;
                    if (!usedCells[cellKey]) {
                        usedCells[cellKey] = true;

                        let tileKey = `${r}-${c}`;
                        if (specialTiles && specialTiles[tileKey]) {
                            let tileType = specialTiles[tileKey];
                            handleTileForCell(tileType, r, c, $(this));
                        }
                    }
                    checkAllWordsCompletion();
                }
    
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
    setTimer()
}

function setTimer(){
    let timedisplay = ""
    if(mode==="relaxed"){
        $timerText.html("Relaxed");
        // document.getElementById("timerText").innerText="Time: ∞";
        return;
    }
    if (puzzlesCompleted == 0) {
        switch (mode) {
            case "arcade":
                    timeLeft = arcadeTimeSeconds*100
                break;
            case "tenmin":
                    timeLeft = 10*60*100
            default:
                break;
        }   
    }
    // timeLeft = ((mode==="arcade" && puzzlesCompleted == 0) ? arcadeTimeSeconds : 10*60)*100;
    // Display Time
    document.getElementById("timerText").innerText="Time: "+timeLeft;
    timer=setInterval(()=>{
        updateTimer()
    },10);
}
function updateTimer(){
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
        gameOver('timeUp')
        // alert("Waktu habis!\nGame over!");
        // level=1;
        // loadLevel(level);
    }
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

/**
 * Function to run for the next board
 */
function nextBoard(){
    let wordConfirm = "Go for the next board!"
    // let earnedScore = addScoreByBoard();
    // let lastScore = score - earnedScore;
    let lastScore = levelScore
    puzzlesCompleted++
    
    $('body > .score-multiplier-active').remove(); // Hanya hapus yang direct child dari body
    window.scoreMultiplierActive = false;

    if (puzzlesCompleted % 3 == 0) {
        wordConfirm = "3 boards completed!<br>Level has been increased."
        if (mode == 'arcade') {
            score += timeLeft
            timeExtend = level*15*100
            wordConfirm += `<br>TIME BONUS! +${timeLeft}<br>Time extended! +${timeExtend/100}s`
            timeLeft += timeExtend
            console.log(timeLeft)
        }
        level++   
    }

    clearInterval(timer)
    $("#boardCompleteBody").html(`
    <p>Score this board: ${lastScore}</p>
    <h5>Total Score: ${score}</h5>
    <hr>
    <p>${wordConfirm}</p>
    `)
    $("#completeModal").modal('show')
    // alert(wordConfirm)
    loadLevel(level);
}


// LEADERBOARDS
/**
 * Saves the score and the user to leaderboard.
 * @param {*} score The score to save
 */
function saveToLeaderboard(score) {
    let scoreboard={
        name: playerName,
        mode: mode,
        score: score,
        date: new Date().toISOString()
    }

    console.log(scoreboard)
    myLeaderboard.push(scoreboard)
    
    localStorage.setItem("leaderboard",JSON.stringify(myLeaderboard))
}

function gameOver(method){
    $("#gameOverModal").modal('show')
    $("#gameOverText").html(randomGameOverMessage('gameOverExit',mode))
    $("#finalBoard").html(puzzlesCompleted)
    $("#finalScore").html(score);
    if (mode == 'tenmin') {
        if (method == "gameOverExit") {
            $("#gameOverText").append(`<br><b>Final score only saves to leaderboard when timer runs out.</b>`)
            return
        }
    } else{
        if (score < 2500) {
            $("#gameOverText").append(`<br><b>Sorry, you need to score at least 2500 points for the leaderboard!.</b>`)
            return
        }
    }
    addMinis(score)   
    saveToLeaderboard(score)
}
function addMinis(totalscore){
    minisEarned = (totalscore/100).toFixed(0)
    $("#finalMiniAdd").html(minisEarned)
    minis += minisEarned
    $("#miniPoints").html(minis)
}