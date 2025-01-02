import { Move } from "../types/Move.ts";
import { Square } from "../types/Square.ts";
import { simulateSquaresAfterMove } from "../utils/simulateSquares.ts";

function checkIfPlayersMoveIsCorrect(move: Move, squares: Square[]){
    if (move.columnFrom === move.columnTo && move.rowFrom === move.rowTo) return false; //Jeśli ruch jest na to samo pole.

    let canMove =  checkPieces(move, squares); 
    
    if (canMove) {
        //Jeśli po ruchu nasz król jest w szachu to 'false';
        const simulatedSquares = simulateSquaresAfterMove(move, squares);
        if (isKingInCheck(move.piece.color, simulatedSquares)){
            canMove = false;
        }
    }

    return canMove;
}

function checkIfPlayerWillBeCheckmated(move: Move, squares: Square[]) {
    //Possition prediction.
    const simulatedSquares = simulateSquaresAfterMove(move, squares);
    const enemyColor = move.piece.color === "white" ? "black" : "white";
    return isKingInCheckmate(enemyColor, simulatedSquares);
}

function checkIfPlayerWillBeInCheck(move: Move, squares: Square[]) {
    const simulatedSquares = simulateSquaresAfterMove(move, squares);
    return isKingInCheck(move.piece.color === "white" ? "black" : "white", simulatedSquares);
}

function checkIfPlayerWillBeInPat(move: Move, squares: Square[]) {
    //Possition prediction.
    const simulatedSquares = simulateSquaresAfterMove(move, squares);
    const enemyColor = move.piece.color === "white" ? "black" : "white";
    return isPlayerInPat(enemyColor, simulatedSquares);
}

function checkPieces(move: Move, squares: Square[]){

    if (!checkIfSquareIsClearFromAllyPieces(move, squares)) return false;

    switch (move.piece.pieceType) {
        case "pawn":
            return checkPawn(move, squares);
        case "rook":
            return checkRook(move, squares);
        case "knight":
            return checkKnight(move, squares);
        case "bishop":
            return checkBishop(move, squares);
        case "queen":
            return checkQueen(move, squares);
        case "king":
            return checkKing(move, squares);
        default:
            return false;
    }
}

function isKingInCheck(color: string, squares: Square[]) {
    // Pole króla
    const kingsSquare = squares.find(
        (sq) => sq.piece && sq.piece.pieceType === "king" && sq.piece.color === color
    );

    const enemyColor = color === "white" ? "black" : "white";

    for (const square of squares) {
        if (square.piece?.color === enemyColor && kingsSquare) {
            const move = {
                rowFrom: square.position.row,
                columnFrom: square.position.column,
                rowTo: kingsSquare.position.row,
                columnTo: kingsSquare.position.column,
                piece: square.piece,
                timeLeft: 0,
            } as Move;
            const isMovePossible = checkPieces(move, squares);
            if (isMovePossible) return true;
        }
    }
    return false;
}

function isKingInCheckmate(color: string, squares: Square[]) {
    if (!isKingInCheck(color, squares)) return false;
    const kingsSquare = squares.find((sq) => sq.piece && sq.piece.pieceType === "king" && sq.piece.color === color);

    const directions = [
        { rowOffset: -1, colOffset: -1 }, // górny-lewy
        { rowOffset: -1, colOffset: 0 },  // góra
        { rowOffset: -1, colOffset: 1 },  // górny-prawy
        { rowOffset: 0, colOffset: -1 },  // lewo
        { rowOffset: 0, colOffset: 1 },   // prawo
        { rowOffset: 1, colOffset: -1 },  // dolny-lewy
        { rowOffset: 1, colOffset: 0 },   // dół
        { rowOffset: 1, colOffset: 1 },   // dolny-prawy
    ];
    let move = { } as Move;

    for (const { rowOffset, colOffset } of directions) {
        if (kingsSquare === undefined) return false;
        if (kingsSquare.piece === null) return false;

        move = {
            rowFrom: kingsSquare.position.row,
            columnFrom: kingsSquare.position.column,
            rowTo: kingsSquare.position.row + rowOffset,
            columnTo: kingsSquare.position.column + colOffset,
            piece: kingsSquare.piece,
            moveNotation: "",
            timeLeft: 0,
        };

        if (move.rowTo >= 1 && move.rowTo <= 8 && move.columnTo >= 1 && move.columnTo <= 8) {
            if (checkIfSquareIsClearFromAllyPieces(move, squares) && !isKingInCheck(color, simulateSquaresAfterMove(move, squares))) {
                return false;
            }
        }
    }
    // Zasłanianie się figurą lub zbicie
    const enemyColor = color === "white" ? "black" : "white";
    const attackingSquares = squares.filter((sq) =>
        sq.piece?.color === enemyColor &&
        checkPieces(move, squares)
    );

    const lineOfAttackSquares = [] as Square[];
    for (const attacker of attackingSquares) {
        if (attacker.piece?.pieceType === "queen" || attacker.piece?.pieceType === "rook" || attacker.piece?.pieceType === "bishop") {
            if (kingsSquare === undefined) return false;
            lineOfAttackSquares.push(...getLineOfAttack(kingsSquare, attacker));
        }
    }
    for (const square of squares) {
        if (square.piece?.color === color) {
            // Sprawdzamy, czy figura może zablokować
            for (const target of [...attackingSquares, ...lineOfAttackSquares]) {
                if (kingsSquare === undefined) return false;
                if (kingsSquare.piece === null) return false;
                
                move = {
                    rowFrom: square.position.row,
                    columnFrom: square.position.column,
                    rowTo: target.position.row,
                    columnTo: target.position.column,
                    piece: square.piece,
                    moveNotation: "",
                    timeLeft: 0,
                }

                if (checkIfPlayersMoveIsCorrect(move, squares)) {
                    const simulatedSquares = simulateSquaresAfterMove(move, squares);

                    if (!isKingInCheck(color, simulatedSquares)) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function getLineOfAttack(kingSquare: Square, attackerSquare: Square) {
    const lineOfAttack = [] as Square[];
    const deltaRow = Math.sign(attackerSquare.position.row - kingSquare.position.row);
    const deltaColumn = Math.sign(attackerSquare.position.column - kingSquare.position.column);

    let currentRow = kingSquare.position.row + deltaRow;
    let currentColumn = kingSquare.position.column + deltaColumn;

    while (
        currentRow !== attackerSquare.position.row &&
        currentColumn !== attackerSquare.position.column
    ) {
        lineOfAttack.push({ position: { row: currentRow, column: currentColumn }} as Square);
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return lineOfAttack;
}

function isPlayerInPat(color: string, squares: Square[]) {
    if (isKingInCheck(color, squares)) return false;
    // To jest overr kill bo sprawdza się czy figura może ruszyć się na jakiekolwiek dostępne pole na planszy czyli zawsze jest ilość figur * 64;
    for (const square of squares) {
        if (square.piece?.color === color) {
            for (let row = 1; row <= 8; row++) {
                for (let column = 1; column <= 8; column++) {
                    const move = {
                        rowFrom: square.position.row,
                        columnFrom: square.position.column,
                        rowTo: row,
                        columnTo: column,
                        piece: square.piece,
                        timeLeft: 0,
                    } as Move;
                    if (checkIfPlayersMoveIsCorrect(move, squares)) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function checkIfSquareIsClearFromAllyPieces(move: Move, squares: Square[]) { 
    const targetSquare = squares.find(
        (sq) => sq.position.row === move.rowTo && sq.position.column === move.columnTo
    );

    if (targetSquare && targetSquare.piece && targetSquare.piece.color === move.piece.color) {
        return false;
    }

    return true;
}

function checkPawn(move: Move, squares: Square[]){
    if (move.piece.color === "white"){
        //white pawn
        if (move.columnFrom !== move.columnTo){
            if (Math.abs(move.columnFrom - move.columnTo) === 1 && move.rowTo === move.rowFrom + 1){
                return checkIfPawnCanTake(move, squares);
            }
            return false;
        }
        if (move.rowTo === move.rowFrom + 2){
            //First move
            if (move.rowFrom === 2){
                return checkPawnCollision(move, squares);
            }else{
                return false;
            }
        }
        if (move.rowTo === move.rowFrom + 1){
            return checkPawnCollision(move, squares);
        }
    }
    else{
        //black pawn
        if (move.columnFrom !== move.columnTo){
            if (Math.abs(move.columnFrom - move.columnTo) === 1 && move.rowTo === move.rowFrom - 1){
                return checkIfPawnCanTake(move, squares);
            }
            return false;
        }
        if (move.rowTo === move.rowFrom - 2){
            //First move
            if (move.rowFrom === 7){
                return checkPawnCollision(move, squares) ;
            }else{
                return false;
            }
        }
        if (move.rowTo === move.rowFrom - 1){
            return checkPawnCollision(move, squares);
        }
    }

    return false;
}

function checkPawnCollision(move: Move, squares: Square[]){
    if (Math.abs(move.rowTo - move.rowFrom) > 1) {
        if (move.rowTo > move.rowFrom){
            //White
            if (squares.find((sq) => sq.position.row === move.rowTo - 1 && sq.position.column === move.columnTo)?.piece !== null){//-1 ponieważ to pole które pion by 'przeskoczył'
                return false;
            }
        }else{
            //Black
            if (squares.find((sq) => sq.position.row === move.rowTo + 1 && sq.position.column === move.columnTo)?.piece !== null){//+1 ponieważ to pole które pion by 'przeskoczył'
                return false;
            }
        }
    }
    return squares.find((sq) => sq.position.row === move.rowTo && sq.position.column === move.columnTo)?.piece === null;
}

function checkIfPawnCanTake(move: Move, squares: Square[]){
    if (squares.find((sq) => sq.position.row === move.rowTo && sq.position.column === move.columnTo)?.piece !== null){
        return true;
    }
    return false;
}

function checkRook(move: Move, squares: Square[]){

    if (move.rowFrom !== move.rowTo && move.columnFrom !== move.columnTo) {
        return false;
    }
    
    return !checkRookCollision(move, squares);
}

function checkRookCollision(move: Move, squares: Square[]){
    let deltaRow = move.rowTo > move.rowFrom ? 1 : move.rowTo < move.rowFrom ? -1 : 0;
    let deltaColumn = move.columnTo > move.columnFrom ? 1 : move.columnTo < move.columnFrom ? -1 : 0;

    let currentRow = move.rowFrom + deltaRow;
    let currentColumn = move.columnFrom + deltaColumn;

    while (currentRow !== move.rowTo || currentColumn !== move.columnTo) {
        const square = squares.find(sq => sq.position.row === currentRow && sq.position.column === currentColumn);
        if (square?.piece !== null) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}

function checkKnight(move: Move, squares: Square[]){

    if (Math.abs(move.rowFrom - move.rowTo) === 1){
        //Na boki
        return Math.abs(move.columnFrom - move.columnTo) === 2;
    }
    else if (Math.abs(move.rowFrom - move.rowTo) === 2){
        //góra/dół
        return Math.abs(move.columnFrom - move.columnTo) === 1;
    }

    return false;
}

function checkBishop(move: Move, squares: Square[]){
    const deltaRow = Math.abs(move.rowFrom - move.rowTo);
    const deltaColumn = Math.abs(move.columnFrom - move.columnTo);

    if (deltaColumn === deltaRow){
        return !checkBishopCollision(move, squares);
    }
    return false;
}

function checkBishopCollision(move: Move, squares: Square[]){
    const deltaRow = move.rowTo > move.rowFrom ? 1 : -1;
    const deltaColumn = move.columnTo > move.columnFrom ? 1 : -1;

    let currentRow = move.rowFrom + deltaRow;
    let currentColumn = move.columnFrom + deltaColumn;

    while (currentRow !== move.rowTo && currentColumn !== move.columnTo) {
        const square = squares.find((sq) => sq.position.row === currentRow && sq.position.column === currentColumn && sq.piece !== null);
        if (square) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}

function checkQueen(move: Move, squares: Square[]){
    const deltaRow = Math.abs(move.rowFrom - move.rowTo);
    const deltaColumn = Math.abs(move.columnFrom - move.columnTo);

    if (deltaColumn === deltaRow || move.rowFrom === move.rowTo || move.columnFrom === move.columnTo){
        return !checkQueenCollision(move, squares);
    }
    return false;

}

function checkQueenCollision(move: Move, squares: Square[]){
    const deltaRow = move.rowTo === move.rowFrom ? 0 : move.rowTo > move.rowFrom ? 1 : -1;
    const deltaColumn = move.columnTo === move.columnFrom ? 0 : move.columnTo > move.columnFrom ? 1 : -1;

    let currentRow = move.rowFrom + deltaRow;
    let currentColumn = move.columnFrom + deltaColumn;

    while (currentRow !== move.rowTo || currentColumn !== move.columnTo) {
        if (squares.find((sq) => sq.position.row === currentRow && sq.position.column === currentColumn && sq.piece !== null)) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}

function checkKing(move: Move, squares: Square[]){
    if (Math.abs(move.rowTo - move.rowFrom) > 1) return false;
    if (Math.abs(move.columnTo - move.columnFrom) > 1){
        //Roszada to do
        if (Math.abs(move.rowTo - move.rowFrom) > 0) return false;
        if (Math.abs(move.columnTo - move.columnFrom) !== 2) return false;
        
        
        return false;
    } 
    if (checkIfEnemiesKingIsInRange(move, squares)) return false; //Króle nie mogą stać obok siebie!

    return true;
}

function checkIfEnemiesKingIsInRange(move: Move, squares: Square[]){
    const directions = [
        { rowOffset: -1, colOffset: -1 }, // górny-lewy
        { rowOffset: -1, colOffset: 0 },  // góra
        { rowOffset: -1, colOffset: 1 },  // górny-prawy
        { rowOffset: 0, colOffset: -1 },  // lewo
        { rowOffset: 0, colOffset: 1 },   // prawo
        { rowOffset: 1, colOffset: -1 },  // dolny-lewy
        { rowOffset: 1, colOffset: 0 },   // dół
        { rowOffset: 1, colOffset: 1 },   // dolny-prawy
    ];

    for (const { rowOffset, colOffset } of directions) {
        const targetRow = move.rowTo + rowOffset;
        const targetCol = move.columnTo + colOffset;

        const square = squares.find(
            (sq) => sq.position.row === targetRow && sq.position.column === targetCol && sq.piece && sq.piece.pieceType === "king" && sq.piece.color !== move.piece.color
        );
        if (square) {
            return true;
        }
    }

    return false;
}

export { checkIfPlayersMoveIsCorrect, checkIfPlayerWillBeCheckmated, checkIfPlayerWillBeInPat, checkIfPlayerWillBeInCheck};