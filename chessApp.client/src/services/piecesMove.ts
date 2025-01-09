import { Coordinate } from "../types/Coordinate.ts";
import { Move } from "../types/Move.ts";
import { Square } from "../types/Square.ts";
import { simulateSquaresAfterMove } from "../utils/simulateSquares.ts";

function checkIfPlayersMoveIsCorrect(move: Move, squares: Square[]){
    if (move.from.column === move.to.column && move.from.row === move.to.row) return false; //Jeśli ruch jest na to samo pole.

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
                from: { row: square.position.row, column: square.position.column} as Coordinate,
                to: { row: kingsSquare.position.row, column: kingsSquare.position.column} as Coordinate,
                piece: square.piece,
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
            from: { row: kingsSquare.position.row, column: kingsSquare.position.column} as Coordinate,
            to: { row: kingsSquare.position.row + rowOffset, column: kingsSquare.position.column + colOffset} as Coordinate,
            piece: kingsSquare.piece,
            notation: "",
            takenPiece: null
        };

        if (move.to.row >= 1 && move.to.row <= 8 && move.to.column >= 1 && move.to.column <= 8) {
            if (checkIfSquareIsClearFromAllyPieces(move, squares) && !isKingInCheck(color, simulateSquaresAfterMove(move, squares))) {
                return false;
            }
        }
    }

    // Zasłanianie się figurą lub zbicie
    const attackedPieceColor = color === "white" ? "black" : "white";
    const attackingSquares = squares.filter((sq) => {
        if (sq.piece?.color === attackedPieceColor && kingsSquare) {
            const attackMove: Move = {
                from: { row: sq.position.row, column: sq.position.column } as Coordinate,
                to: { row: kingsSquare.position.row, column: kingsSquare.position.column } as Coordinate,
                piece: sq.piece,
                notation: "",
                takenPiece: null,
            };
            return checkPieces(attackMove, squares);
        }
        return false;
    });
    
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
                    from: { row: square.position.row, column: square.position.column} as Coordinate,
                    to: { row: target.position.row, column: target.position.column} as Coordinate,
                    piece: square.piece,
                    notation: "",
                    takenPiece: null
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
                        from: { row: square.position.row, column: square.position.column} as Coordinate,
                        to: { row: row, column: column} as Coordinate,
                        piece: square.piece,
                        notation: ""
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
        (sq) => sq.position.row === move.to.row && sq.position.column === move.to.column
    );

    if (targetSquare && targetSquare.piece && targetSquare.piece.color === move.piece.color) {
        return false;
    }

    return true;
}

function checkPawn(move: Move, squares: Square[]){
    if (move.piece.color === "white"){
        //white pawn
        if (move.from.column !== move.to.column){
            if (Math.abs(move.from.column - move.to.column) === 1 && move.to.row === move.from.row + 1){
                return checkIfPawnCanTake(move, squares);
            }
            return false;
        }
        if (move.to.row === move.from.row + 2){
            //First move
            if (move.from.row === 2){
                return checkPawnCollision(move, squares);
            }else{
                return false;
            }
        }
        if (move.to.row === move.from.row + 1){
            return checkPawnCollision(move, squares);
        }
    }
    else{
        //black pawn
        if (move.from.column !== move.to.column){
            if (Math.abs(move.from.column - move.to.column) === 1 && move.to.row === move.from.row - 1){
                return checkIfPawnCanTake(move, squares);
            }
            return false;
        }
        if (move.to.row === move.from.row - 2){
            //First move
            if (move.from.row === 7){
                return checkPawnCollision(move, squares) ;
            }else{
                return false;
            }
        }
        if (move.to.row === move.from.row - 1){
            return checkPawnCollision(move, squares);
        }
    }

    return false;
}

function checkPawnCollision(move: Move, squares: Square[]){
    if (Math.abs(move.to.row - move.from.row) > 1) {
        if (move.to.row > move.from.row){
            //White
            if (squares.find((sq) => sq.position.row === move.to.row - 1 && sq.position.column === move.to.column)?.piece !== null){//-1 ponieważ to pole które pion by 'przeskoczył'
                return false;
            }
        }else{
            //Black
            if (squares.find((sq) => sq.position.row === move.to.row + 1 && sq.position.column === move.to.column)?.piece !== null){//+1 ponieważ to pole które pion by 'przeskoczył'
                return false;
            }
        }
    }
    return squares.find((sq) => sq.position.row === move.to.row && sq.position.column === move.to.column)?.piece === null;
}

function checkIfPawnCanTake(move: Move, squares: Square[]){
    if (squares.find((sq) => sq.position.row === move.to.row && sq.position.column === move.to.column)?.piece !== null){
        return true;
    }
    return false;
}

function checkRook(move: Move, squares: Square[]){

    if (move.from.row !== move.to.row && move.from.column !== move.to.column) {
        return false;
    }
    
    return !checkRookCollision(move, squares);
}

function checkRookCollision(move: Move, squares: Square[]){
    let deltaRow = move.to.row > move.from.row ? 1 : move.to.row < move.from.row ? -1 : 0;
    let deltaColumn = move.to.column > move.from.column ? 1 : move.to.column < move.from.column ? -1 : 0;

    let currentRow = move.from.row + deltaRow;
    let currentColumn = move.from.column + deltaColumn;

    while (currentRow !== move.to.row || currentColumn !== move.to.column) {
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

    if (Math.abs(move.from.row - move.to.row) === 1){
        //Na boki
        return Math.abs(move.from.column - move.to.column) === 2;
    }
    else if (Math.abs(move.from.row - move.to.row) === 2){
        //góra/dół
        return Math.abs(move.from.column - move.to.column) === 1;
    }

    return false;
}

function checkBishop(move: Move, squares: Square[]){
    const deltaRow = Math.abs(move.from.row - move.to.row);
    const deltaColumn = Math.abs(move.from.column - move.to.column);

    if (deltaColumn === deltaRow){
        return !checkBishopCollision(move, squares);
    }
    return false;
}

function checkBishopCollision(move: Move, squares: Square[]){
    const deltaRow = move.to.row > move.from.row ? 1 : -1;
    const deltaColumn = move.to.column > move.from.column ? 1 : -1;

    let currentRow = move.from.row + deltaRow;
    let currentColumn = move.from.column + deltaColumn;

    while (currentRow !== move.to.row && currentColumn !== move.to.column) {
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
    const deltaRow = Math.abs(move.from.row - move.to.row);
    const deltaColumn = Math.abs(move.from.column - move.to.column);

    if (deltaColumn === deltaRow || move.from.row === move.to.row || move.from.column === move.to.column){
        return !checkQueenCollision(move, squares);
    }
    return false;

}

function checkQueenCollision(move: Move, squares: Square[]){
    const deltaRow = move.to.row === move.from.row ? 0 : move.to.row > move.from.row ? 1 : -1;
    const deltaColumn = move.to.column === move.from.column ? 0 : move.to.column > move.from.column ? 1 : -1;

    let currentRow = move.from.row + deltaRow;
    let currentColumn = move.from.column + deltaColumn;

    while (currentRow !== move.to.row || currentColumn !== move.to.column) {
        if (squares.find((sq) => sq.position.row === currentRow && sq.position.column === currentColumn && sq.piece !== null)) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}

function checkKing(move: Move, squares: Square[]){
    if (Math.abs(move.to.row - move.from.row) > 1) return false;
    if (Math.abs(move.to.column - move.from.column) > 1){
        //Roszada to do
        if (Math.abs(move.to.row - move.from.row) > 0) return false;
        if (Math.abs(move.to.column - move.from.column) !== 2) return false;
        
        
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
        const targetRow = move.to.row + rowOffset;
        const targetCol = move.to.column + colOffset;

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