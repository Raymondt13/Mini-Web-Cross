
const TILE_TYPES = {
    SCORE: 'score',
    MULTIPLY: 'multiply',
    EXTRA_HINT: 'extra_hint',
    TIME: 'time',
    FREEZE: 'freeze'
};

let specialTiles = {};
let freezeActive = false;

function generateSpecialTiles(solution, mode) {
    specialTiles = {};

    let availableCells = [];

    for (let r = 0; r < solution.length; r++) {
        for (let c = 0; c < solution[r].length; c++) {
            if (solution[r][c] !== '') {
                availableCells.push({ r, c });
            }
        }
    }

    shuffleArray(availableCells);

    let selectedTiles = [];

    selectedTiles.push({
        type: TILE_TYPES.SCORE,
        ...availableCells.pop()
    });

    selectedTiles.push({
        type: TILE_TYPES.MULTIPLY,
        ...availableCells.pop()
    });

    selectedTiles.push({
        type: TILE_TYPES.EXTRA_HINT,
        ...availableCells.pop()
    });

    if (mode === 'arcade') {
        selectedTiles.push({
            type: TILE_TYPES.TIME,
            ...availableCells.pop()
        });

        selectedTiles.push({
            type: TILE_TYPES.FREEZE,
            ...availableCells.pop()
        });
    }

    selectedTiles.forEach(tile => {
        if (!tile) {
            return;
        }

        specialTiles[`${tile.r}-${tile.c}`] = tile.type;
    });

    return specialTiles;
}

function applyTileStyle($cell, r, c) {
    let key = `${r}-${c}`;
    let tileType = specialTiles[key];

    if (tileType) {
        $cell.addClass(`tile-${tileType}`);
    }

    return tileType;
}

function activateTile({
    type,
    r,
    c,
    $input,
    score,
    hintCount,
    timeLeft,
    timer,
    updateTimer,
    onUpdate
}) {
    let key = `${r}-${c}`;

    if (!specialTiles[key]) {
        return {
            score,
            hintCount,
            timeLeft,
            timer
        };
    }

    delete specialTiles[key];

    switch (type) {
        case TILE_TYPES.SCORE:
            score += 100;
            showFloatingText($input, '+100');
            break;

        case TILE_TYPES.MULTIPLY:
            score += 200;
            showFloatingText($input, 'x2');
            break;

        case TILE_TYPES.EXTRA_HINT:
            hintCount += 1;
            showFloatingText($input, '+HINT');
            break;

        case TILE_TYPES.TIME:
            timeLeft += 15;
            showFloatingText($input, '+15s');
            break;

        case TILE_TYPES.FREEZE:
            timer = activateFreeze(timer, updateTimer);
            showFloatingText($input, 'FREEZE');
            break;
    }

    if (onUpdate) {
        onUpdate({ score, hintCount, timeLeft, timer });
    }

    return {
        score,
        hintCount,
        timeLeft,
        timer
    };
}

function activateFreeze(timer, updateTimer) {
    if (freezeActive) {
        return timer;
    }

    freezeActive = true;

    clearInterval(timer);

    setTimeout(() => {
        freezeActive = false;

        timer = setInterval(() => {
            updateTimer();
        }, 1000);
    }, 5000);

    return timer;
}

function showFloatingText($input, text) {
    let offset = $input.offset();

    let $effect = $('<div></div>')
        .addClass('floating-effect')
        .text(text)
        .css({
            top: offset.top - 10,
            left: offset.left
        });

    $('body').append($effect);

    setTimeout(() => {
        $effect.remove();
    }, 1000);
}
