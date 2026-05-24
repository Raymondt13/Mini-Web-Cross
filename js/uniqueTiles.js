const TILE_TYPES = {
    SCORE: 'score',
    MULTIPLY: 'multiply',
    EXTRA_HINT: 'extra_hint',
    TIME: 'time',
    FREEZE: 'freeze'
};

let specialTiles = {};
let freezeActive = false;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function generateSpecialTiles(solution, mode = 'classic') {
    specialTiles = {};

    const availableCells = [];

    for (let r = 0; r < solution.length; r++) {
        for (let c = 0; c < solution[r].length; c++) {
            if (solution[r][c] !== '') {
                availableCells.push({ r, c });
            }
        }
    }

    shuffleArray(availableCells);

    const selectedTiles = [];

    if (availableCells.length > 0) {
        selectedTiles.push({
            type: TILE_TYPES.SCORE,
            ...availableCells.pop()
        });
    }

    if (availableCells.length > 0) {
        selectedTiles.push({
            type: TILE_TYPES.MULTIPLY,
            ...availableCells.pop()
        });
    }

    if (availableCells.length > 0) {
        selectedTiles.push({
            type: TILE_TYPES.EXTRA_HINT,
            ...availableCells.pop()
        });
    }

    if (mode === 'arcade') {
        if (availableCells.length > 0) {
            selectedTiles.push({
                type: TILE_TYPES.TIME,
                ...availableCells.pop()
            });
        }

        if (availableCells.length > 0) {
            selectedTiles.push({
                type: TILE_TYPES.FREEZE,
                ...availableCells.pop()
            });
        }
    }

    selectedTiles.forEach(tile => {
        specialTiles[`${tile.r}-${tile.c}`] = tile.type;
    });

    return specialTiles;
}

function applyTileStyle($cell, r, c) {
    const key = `${r}-${c}`;
    const tileType = specialTiles[key];

    $cell.removeClass(function (_, className) {
        return (className.match(/(^|\s)tile-\S+/g) || []).join(' ');
    });

    if (tileType) {
        $cell.addClass(`tile-${tileType}`);
    }

    return tileType;
}

function activateTile({
    r,
    c,
    $input,
    score = 0,
    hintCount = 0,
    timeLeft = 0,
    timer,
    updateTimer,
    onUpdate
}) {
    const key = `${r}-${c}`;
    const type = specialTiles[key];

    if (!type) {
        return {
            score,
            hintCount,
            timeLeft,
            timer
        };
    }

    delete specialTiles[key];

    if ($input) {
        $input.removeClass(`tile-${type}`);
    }

    switch (type) {
        case TILE_TYPES.SCORE:
            score += 100;
            showFloatingText($input, '+100');
            break;

        case TILE_TYPES.MULTIPLY:
            score *= 2;
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

    if (typeof onUpdate === 'function') {
        onUpdate({
            score,
            hintCount,
            timeLeft,
            timer
        });
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

    const newTimer = setTimeout(() => {
        freezeActive = false;
        timer = startTimer()
    }, 5000);

    return newTimer;
}

function showFloatingText($input, text) {
    if (!$input || !$input.length) {
        return;
    }

    const offset = $input.offset();

    const $effect = $('<div></div>')
        .addClass('floating-effect')
        .text(text)
        .css({
            top: offset.top - 10,
            left: offset.left + 10
        });

    $('body').append($effect);

    setTimeout(() => {
        $effect.remove();
    }, 1000);
}
