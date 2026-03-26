let origBoard;
const huPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [6, 4, 2]
];

const cells = document.querySelectorAll('.cell');
const modal = document.getElementById('endgame-modal');
const winnerText = document.getElementById('winner-text');

startGame();

function startGame() {
    modal.style.display = "none";
    origBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].classList.remove('player-o', 'player-x', 'win-o', 'win-x', 'tie');
        cells[i].addEventListener('click', turnClick, false);
    }
}

function turnClick(square) {
    if (typeof origBoard[square.target.id] === 'number') {
        turn(square.target.id, huPlayer);
        if (!checkWin(origBoard, huPlayer) && !checkTie()) {
            setTimeout(() => {
                turn(bestSpot(), aiPlayer);
            }, 300); // Slight delay for AI move feeling more natural
        }
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    const cell = document.getElementById(squareId);
    cell.innerText = player;
    cell.classList.add(player === huPlayer ? 'player-o' : 'player-x');
    
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    const winClass = gameWon.player === huPlayer ? 'win-o' : 'win-x';
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).classList.add(winClass);
    }
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner(gameWon.player === huPlayer ? "Victory is Yours!" : "The AI Prevails.");
}

function declareWinner(who) {
    setTimeout(() => {
        modal.style.display = "flex";
        winnerText.innerText = who;
    }, 800); // Wait for animations
}

function emptySquares() {
    return origBoard.filter(s => typeof s === 'number');
}

function bestSpot() {
    return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
    if (emptySquares().length === 0) {
        for (let i = 0; i < cells.length; i++) {
            cells[i].classList.add('tie');
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("It's a Stalemate!");
        return true;
    }
    return false;
}

function minimax(newBoard, player) {
    let availSpots = emptySquares();

    if (checkWin(newBoard, huPlayer)) {
        return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)) {
        return {score: 10};
    } else if (availSpots.length === 0) {
        return {score: 0};
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player === aiPlayer) {
            let result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}