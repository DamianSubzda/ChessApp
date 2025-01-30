import { Coordinate } from "../../../types/Coordinate";
import { Move } from "../../../types/Move";
import { Square } from "../../../types/Square";
import { checkIfSquareIsAttacked, checkIfSquareIsClearFromAllyPieces, getLineOfAttack, simulateSquaresAfterMove } from "../common.ts";
import { checkIfPlayersMoveIsCorrect, checkPieces } from "../validation.ts";

function checkKing(move: Move, squares: Square[]){
    if (Math.abs(move.to.row - move.from.row) > 1) return false;
    if (Math.abs(move.to.column - move.from.column) > 1){
        if (Math.abs(move.to.row - move.from.row) > 0) return false;
        if (Math.abs(move.to.column - move.from.column) !== 2) return false;
        
        //Roszada
        return checkIfKingCanCastle(move, squares);
    } 
    if (checkIfEnemiesKingIsInRange(move, squares)) return false; //Króle nie mogą stać obok siebie!

    return true;
}

function checkIfKingCanCastle(move: Move, squares: Square[]){
    if (isKingInCheck(move.piece.color, squares)) return false;
    
    const squaresToCheck = [] as Square[];
    const deltaColumn = Math.sign(move.to.column - move.from.column);

    squaresToCheck.push({ position: { row: move.from.row, column: move.from.column + deltaColumn }} as Square);
    squaresToCheck.push({ position: { row: move.from.row, column: move.from.column + (2 * deltaColumn) }} as Square);

    for (const square of squaresToCheck){
        if (checkIfSquareIsAttacked(move.piece.color, square, squares)) return false;
    }
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
            takenPiece: null,
            isPromotion: false,
            isCastle: false,
            isEnPassant: false,
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
                isPromotion: false,
                isCastle: false,
                isEnPassant: false
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
                    takenPiece: null,
                    isPromotion: false,
                    isCastle: false,
                    isEnPassant: false
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




export { checkKing, isKingInCheck, isKingInCheckmate };