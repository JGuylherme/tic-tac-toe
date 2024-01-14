import { useState } from "react";

function Square({ value, onSquareClick, isWinningSquare }) {
    const squareClassName = "square" + (isWinningSquare ? " winning-square" : "");

    return (
        <button className={squareClassName} onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({ xIsNext, squares, onPlay, winningLine }) {
    function handleClick(i) {
        if (squares[i] || calculateWinnerAndLine(squares).winner) {
            return;
        }

        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? "X" : "O";
        onPlay(nextSquares);
    }

    const renderSquare = (i, isWinningSquare) => {
        return (
            <Square
                key={i}
                value={squares[i]}
                onSquareClick={() => handleClick(i)}
                isWinningSquare={isWinningSquare}
            />
        );
    };

    const renderBoardRow = (row, winningLine) => {
        return (
            <div className="board-row" key={row}>
                {[0, 1, 2].map((col) => {
                    const squareIndex = row * 3 + col;
                    const isWinningSquare = winningLine ? winningLine.includes(squareIndex) : false;
                    return renderSquare(squareIndex, isWinningSquare);
                })}
            </div>
        );
    };

    return (
        <>
            {[0, 1, 2].map((row) => renderBoardRow(row, winningLine))}
        </>
    );
}

export default function Game() {
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const [ascendingOrder, setAscendingOrder] = useState(true);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    const toggleOrder = () => {
        setAscendingOrder(!ascendingOrder);
    };

    const moves = history.map((squares, move) => {
        const moveNumber = ascendingOrder ? move : history.length - 1 - move;
        let description;
        if (moveNumber >= 0) {
            const [row, col] = getMoveLocation(moveNumber, squares);
            description = moveNumber > 0 ? `Go to move #${moveNumber} - (${col + 1}, ${row + 1})` : '(re)Start the game';
        } else {
            description = '';
        }

        const isCurrentMove = moveNumber === currentMove;
        const buttonClassName = isCurrentMove ? 'current-move' : '';

        return (
            <li key={moveNumber}>
                <button className={buttonClassName} onClick={() => jumpTo(moveNumber)}>
                    {description}
                </button>
            </li>
        );
    });

    function getMoveLocation(moveNumber, squares) {
        if (moveNumber === 0) {
            return [null, null];
        }

        const prevSquares = history[moveNumber - 1];
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== prevSquares[i]) {
                const row = Math.floor(i / 3);
                const col = i % 3;
                return [row, col];
            }
        }

        return [null, null];
    }

    const { winner, winningLine } = calculateWinnerAndLine(currentSquares);
    let status;
    if (winner) {
        status = "Winner: " + winner;
    } else if (currentMove === 9) {
        // Verifica se todos os movimentos foram feitos e não há vencedor (empate)
        status = "It's a draw!";
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} winningLine={winningLine} />
            </div>
            <div className="game-info">
                <div className="status">{status}</div>
                <div>
                    <button onClick={toggleOrder}>
                        Toggle Order: {ascendingOrder ? "Ascending" : "Descending"}
                    </button>
                </div>
                <ul reversed={!ascendingOrder}>{moves}</ul>
            </div>
        </div>
    );
}

function calculateWinnerAndLine(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], winningLine: lines[i] };
        }
    }

    return { winner: null, winningLine: null };
}