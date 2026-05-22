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

/**
 * 
 * @param {string} wordKey 
 * @param {*} wordData 
 * @param {boolean} isAcross 
 * @returns 
 */
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

/**
 * Check all words completion
 * @returns 
 */
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
    console.log(isMusicPlaying);
    
    
    let arcadeMusic = document.getElementById("arcadeMusic");
    let music = document.getElementById("bgMusic");
    if (mode !== 'relaxed') {
        arcadeMusic.pause();
        music.pause();
        if (isMusicPlaying) {
            arcadeMusic.currentTime = 0
            arcadeMusic.play();
        }
    } else {
        arcadeMusic.pause();
        music.pause();
        if (isMusicPlaying) {
            music.currentTime = 0
            music.play();
        }
    }

    resetTimer();
    loadLevel(level);
}


function generateLevel(level){
let minSoal = mode === 'arcade' ? level + 1 : level + 3;
    let jumlahSoal = Math.min(Math.max(minSoal, 2), 10, wordsBank.length);

    let size = 15;
    let center = Math.floor(size / 2);
    // minimum gap
    const MIN_GAP = 2;

    shuffleArray(wordsBank);
    let selected = wordsBank.slice(0, jumlahSoal);

    let grid = Array(size).fill().map(() => Array(size).fill(""));
    let wordPositions = [];
    let data = { size: size, across: [], down: [] };
    
    // array untuk kata yang sudah terpasang
    let placedWordsTrack = [];

    // register word
    function registerWord(word, clue, row, col, isAcross) {
        placeWord(word, row, col, isAcross, grid);
        
        let endRow = isAcross ? row : row + word.length - 1;
        let endCol = isAcross ? col + word.length - 1 : col;

        wordPositions.push({ word, row, col, isAcross, endRow, endCol });
        data[isAcross ? 'across' : 'down'].push({ row, col, word, clue });
        
        // simpan ke tracker
        placedWordsTrack.push({ word, row, col, isAcross });
    }

    // Across
    let first = selected[0];
    let startCol = center - Math.floor(first.word.length / 2);
    registerWord(first.word, first.clue, center, startCol, true);

    // Word Cross
    for (let i = 1; i < selected.length; i++) {
        let w = selected[i];
        let validPlacements = [];

        for (let existing of placedWordsTrack) {
            let baseWord = existing.word;

            for (let j = 0; j < w.word.length; j++) {
                // For loop untuk kecocokan
                for (let k = 0; k < baseWord.length; k++) {
                    if (w.word[j] === baseWord[k]) {
                        
                        // klo datar wajib menurun
                        let isAcross = !existing.isAcross; 
                        
                        let row = isAcross ? existing.row + k : existing.row - j;
                        let col = isAcross ? existing.col - j : existing.col + k;

                        // validasi aman
                        if (canPlaceWord(w.word, row, col, isAcross, grid, size)) {
                            if (isValidPlacementWithGap(w.word, row, col, isAcross, grid, size, wordPositions, MIN_GAP)) {
                                validPlacements.push({
                                    row, col, isAcross,
                                    distanceFromCenter: Math.abs(row - center) + Math.abs(col - center)
                                });
                            }
                        }
                    }
                }
            }
        }

        if (validPlacements.length > 0) {
            validPlacements.sort((a, b) => b.distanceFromCenter - a.distanceFromCenter);
            let p = validPlacements[0];
            registerWord(w.word, w.clue, p.row, p.col, p.isAcross);
        } else {
            console.log(`⚠️ Kata "${w.word}" tidak bisa ditempatkan karena gap requirements`);
        }
    }

    return data;

}
 
/**
 * @param {string} word - Kata yang akan ditempatkan
 * @param {number} row - Row starting position
 * @param {number} col - Column starting position
 * @param {boolean} isAcross - true = horizontal, false = vertical
 * @param {array} grid - Game grid
 * @param {number} size - Grid size
 * @param {array} wordPositions - Array of previously placed words
 * @param {number} minGap - Minimum gap required (default 2)
 * @return {boolean} true jika placement valid
 */
function isValidPlacementWithGap(word, row, col, isAcross, grid, size, wordPositions, minGap){
    
    // ✅ CEK 1: Pastikan semua posisi kata ada di grid
    for(let i=0;i<word.length;i++){
        let r = isAcross ? row : row + i;
        let c = isAcross ? col + i : col;
        
        if(r < 0 || c < 0 || r >= size || c >= size) {
            return false;
        }
    }
    
    // ✅ CEK 2: Pastikan cell kosong atau sama huruf (untuk intersection)
    for(let i=0;i<word.length;i++){
        let r = isAcross ? row : row + i;
        let c = isAcross ? col + i : col;
        
        if(grid[r][c] !== "" && grid[r][c] !== word[i]){
            return false;
        }
    }
    
    // ✅ CEK 3 & 4: Cek gap dengan kata yang sudah ada
    for(let existingWord of wordPositions){
        // CEK 3: Jika sama arah → harus ada gap MIN_GAP
        if(existingWord.isAcross === isAcross){
            if(isAcross){
                // Sama-sama horizontal → row harus berbeda minimal MIN_GAP
                if(Math.abs(row - existingWord.row) < minGap){
                    console.log(`  ❌ Gap horizontal too small: ${Math.abs(row - existingWord.row)} < ${minGap}`);
                    return false;
                }
            }else{
                // Sama-sama vertical → column harus berbeda minimal MIN_GAP
                if(Math.abs(col - existingWord.col) < minGap){
                    console.log(`  ❌ Gap vertical too small: ${Math.abs(col - existingWord.col)} < ${minGap}`);
                    return false;
                }
            }
        }
        
        // CEK 4: Pastikan hanya 1 intersection point dalam 1 kata
        let intersectionCount = 0;
        
        for(let i=0;i<word.length;i++){
            let r = isAcross ? row : row + i;
            let c = isAcross ? col + i : col;
            
            if(grid[r][c] !== ""){
                intersectionCount++;
            }
        }
        
        if(intersectionCount > 1){
            console.log(`  ❌ Too many intersections: ${intersectionCount} > 1`);
            return false;
        }
    }
    
    return true;
}
 
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
    const $grid = $("#crosswordGrid");

    $grid.css('grid-template-columns', `repeat(${size},50px)`);
    //$grid.css('grid-template-columns', `repeat(${size},40px)`);
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
                            // handleTileForCell(tileType, r, c, $(this));
                        }
                    }
                    $(this).attr("readonly",true)
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
    // Display Time
    document.getElementById("timerText").innerText="Time: "+timeLeft;
    timer = startTimer()
}

function startTimer(){
    return setInterval(()=>{
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
        boards: puzzlesCompleted,
        date: new Date().toISOString()
    }

    console.log(scoreboard)
    myLeaderboard.push(scoreboard)
    
    localStorage.setItem("leaderboard",JSON.stringify(myLeaderboard))
}

function gameOver(method){
    arcadeMusic.pause();
    music.pause();
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
    let playerFound = getPlayerByName(playerName)
    playerFound.minis = minis
    currentPlayer = playerFound
    $("#miniPoints").html(currentPlayer.minis)
}