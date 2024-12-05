
function checkIfPlayersMoveIsCorrect(pieceData, target, isPlayerWhite, squares){
    if (pieceData.column === target.column && pieceData.row === target.row) return false; //Jeśli ruch jest na to samo pole.
    if (pieceData.pieceColor !== (isPlayerWhite ? "white" : "black")) return false; //Jeśli ruszamy się figurą przeciwnika.

    let canMove =  checkPieces(pieceData, target, squares); 

    if (canMove) {
        //Jeśli po ruchu nasz król jest w szachu to 'false';
        const simulatedSquares = simulateMove(pieceData, target, squares);
        if (isKingInCheck(pieceData.pieceColor, simulatedSquares)){
            canMove = false;
        }
    }

    return canMove;

}

function checkIfPlayerWillBeCheckmated(pieceData, target, squares) {
    //Possition prediction.
    const simulatedSquares = simulateMove(pieceData, target, squares);
    const color = pieceData.pieceColor === "white" ? "black" : "white";
    return isKingInCheckmate(color, simulatedSquares);
}

function checkIfPlayerWillBeInPat(pieceData, target, squares) {
    //Possition prediction.
    const simulatedSquares = simulateMove(pieceData, target, squares);
    const color = pieceData.pieceColor === "white" ? "black" : "white";
    return isPlayerInPat(color, simulatedSquares);
}

function simulateMove(pieceData, target, squares) {
    return squares.map((sq) => {
        if (sq.row === pieceData.row && sq.column === pieceData.column) {
            return { ...sq, pieceSrc: null, pieceColor: null };
        }
        if (sq.row === target.row && sq.column === target.column) {
            return { ...sq, pieceSrc: pieceData.pieceSrc, pieceColor: pieceData.pieceColor };
        }
        return sq;
    });
}

function checkPieces(pieceData, target, squares){

    if (!checkIfSquareIsClearFromAllyPieces(pieceData, target, squares)) return false;

    switch (pieceData.pieceSrc[1]) {
        case "p":
            return checkPawn(pieceData, target, squares);
        case "r":
            return checkRook(pieceData, target, squares);
        case "n":
            return checkKnight(pieceData, target, squares);
        case "b":
            return checkBishop(pieceData, target, squares);
        case "q":
            return checkQueen(pieceData, target, squares);
        case "k":
            return checkKing(pieceData, target, squares);
        default:
            return false;
    }
}

function isKingInCheck(color, squares) { 
    // Pole króla 
    const kingsSquare = squares.find(
        (sq) => sq.pieceSrc && sq.pieceSrc[1] === "k" && sq.pieceColor === color
    );

    const enemyColor = color === "white" ? "black" : "white";

    for (const square of squares){
        if (square.pieceColor === enemyColor && kingsSquare) {
            const isMovePossible = checkPieces(square, {row: kingsSquare.row, column: kingsSquare.column}, squares);
            if (isMovePossible) return true;
        }
    }
    return false;
}

function isKingInCheckmate(color, squares) {
    if (!isKingInCheck(color, squares)) return false;

    const kingsSquare = squares.find((sq) => sq.pieceSrc && sq.pieceSrc[1] === "k" && sq.pieceColor === color);

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
        const target = {
            row: kingsSquare.row + rowOffset,
            column: kingsSquare.column + colOffset,
        };

        if (target.row >= 1 && target.row <= 8 && target.column >= 1 && target.column <= 8) {
            const targetSquare = squares.find((sq) => sq.row === target.row && sq.column === target.column);
            if (
                targetSquare &&
                checkIfSquareIsClearFromAllyPieces(kingsSquare, target, squares) &&
                !isKingInCheck(color, simulateMove(kingsSquare, target, squares))
            ) {
                return false;
            }
        }
    }

    // Zasłanianie się figurą lub zbicie
    const enemyColor = color === "white" ? "black" : "white";
    const attackingSquares = squares.filter((sq) =>
        sq.pieceColor === enemyColor &&
        checkPieces(sq, { row: kingsSquare.row, column: kingsSquare.column }, squares)
    );

    const lineOfAttackSquares = [];
    for (const attacker of attackingSquares) {
        if (attacker.pieceSrc[1] === "q" || attacker.pieceSrc[1] === "r" || attacker.pieceSrc[1] === "b") {
            lineOfAttackSquares.push(...getLineOfAttack(kingsSquare, attacker, squares));
        }
    }

    for (const square of squares) {
        if (square.pieceColor === color) {
            // Sprawdzamy, czy figura może zablokować
            for (const target of [...attackingSquares, ...lineOfAttackSquares]) {
                if (checkIfPlayersMoveIsCorrect(square, target, color === "white", squares)) {
                    const simulatedSquares = simulateMove(square, target, squares);

                    if (!isKingInCheck(color, simulatedSquares)) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function getLineOfAttack(kingSquare, attackerSquare, squares) {
    const lineOfAttack = [];
    const deltaRow = Math.sign(attackerSquare.row - kingSquare.row);
    const deltaColumn = Math.sign(attackerSquare.column - kingSquare.column);

    let currentRow = kingSquare.row + deltaRow;
    let currentColumn = kingSquare.column + deltaColumn;

    while (
        currentRow !== attackerSquare.row ||
        currentColumn !== attackerSquare.column
    ) {
        lineOfAttack.push({ row: currentRow, column: currentColumn });
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return lineOfAttack;
}

function isPlayerInPat(color, squares) {
    if (isKingInCheck(color, squares)) return false;
    // To jest overr kill bo sprawdza się czy figura może ruszyć się na jakiekolwiek dostępne pole na planszy czyli zawsze jest ilość figur * 64;
    for (const square of squares) {
        if (square.pieceColor === color) {
            for (let row = 1; row <= 8; row++) {
                for (let column = 1; column <= 8; column++) {
                    const target = { row, column };
                    if (checkIfPlayersMoveIsCorrect(square, target, color === "white", squares)) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function checkIfSquareIsClearFromAllyPieces(pieceData, target, squares) { 
    const targetSquare = squares.find(
        (sq) => sq.row === target.row && sq.column === target.column
    );

    if (targetSquare && targetSquare.pieceSrc && targetSquare.pieceColor === pieceData.pieceColor) {
        return false;
    }

    return true;
}

function checkPawn(pieceData, target, squares){

    if (pieceData.pieceColor === "white"){
        //white pawn
        if (pieceData.column !== target.column){
            if (Math.abs(pieceData.column - target.column) === 1 && target.row === pieceData.row + 1){
                return checkIfPawnCanTake(pieceData, target, squares);
            }
            return false;
        }
        if (target.row === pieceData.row + 2){
            //First move
            if (pieceData.row === 2){
                return checkPawnCollision(pieceData, target, squares);
            }else{
                return false;
            }
        }
        if (target.row === pieceData.row + 1){
            return checkPawnCollision(pieceData, target, squares);
        }
    }
    else{
        //black pawn
        if (pieceData.column !== target.column){
            if (Math.abs(pieceData.column - target.column) === 1 && target.row === pieceData.row - 1){
                return checkIfPawnCanTake(pieceData, target, squares);
            }
            return false;
        }
        if (target.row === pieceData.row - 2){
            //First move
            if (pieceData.row === 7){
                return checkPawnCollision(pieceData, target, squares) ;
            }else{
                return false;
            }
        }
        if (target.row === pieceData.row - 1){
            return checkPawnCollision(pieceData, target, squares);
        }
    }

    return false;
}

function checkPawnCollision(pieceData, target, squares){
    if (Math.abs(target.row - pieceData.row) > 1) {
        if (target.row > pieceData.row){
            //White
            if (squares.find((sq) => sq.row === target.row - 1 && sq.column === target.column).pieceSrc !== null){//-1 ponieważ to pole które pion by 'przeskoczył'
                return false;
            }
        }else{
            //Black
            if (squares.find((sq) => sq.row === target.row + 1 && sq.column === target.column).pieceSrc !== null){//+1 ponieważ to pole które pion by 'przeskoczył'
                return false;
            }
        }
    }
    return squares.find((sq) => sq.row === target.row && sq.column === target.column).pieceSrc === null;
}

function checkIfPawnCanTake(pieceData, target, squares){
    if (squares.find((sq) => sq.row === target.row && sq.column === target.column).pieceSrc !== null){
        return true;
    }
    return false;
}

function checkRook(pieceData, target, squares){

    if (pieceData.row !== target.row && pieceData.column !== target.column) {
        return false;
    }
    
    return !checkRookCollision(pieceData, target, squares);
}

function checkRookCollision(pieceData, target, squares){
    let deltaRow = target.row > pieceData.row ? 1 : target.row < pieceData.row ? -1 : 0;
    let deltaColumn = target.column > pieceData.column ? 1 : target.column < pieceData.column ? -1 : 0;

    let currentRow = pieceData.row + deltaRow;
    let currentColumn = pieceData.column + deltaColumn;

    while (currentRow !== target.row || currentColumn !== target.column) {
        if (squares.find(sq => sq.row === currentRow && sq.column === currentColumn).pieceSrc !== null) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}

function checkKnight(pieceData, target, squares){

    if (Math.abs(pieceData.row - target.row) === 1){
        //Na boki
        return Math.abs(pieceData.column - target.column) === 2;
    }
    else if (Math.abs(pieceData.row - target.row) === 2){
        //góra/dół
        return Math.abs(pieceData.column - target.column) === 1;
    }

    return false;
}

function checkBishop(pieceData, target, squares){
    const deltaRow = Math.abs(pieceData.row - target.row);
    const deltaColumn = Math.abs(pieceData.column - target.column);

    if (deltaColumn === deltaRow){
        return !checkBishopCollision(pieceData, target, squares);
    }
    return false;
}

function checkBishopCollision(pieceData, target, squares){
    const deltaRow = target.row > pieceData.row ? 1 : -1;
    const deltaColumn = target.column > pieceData.column ? 1 : -1;

    let currentRow = pieceData.row + deltaRow;
    let currentColumn = pieceData.column + deltaColumn;

    while (currentRow !== target.row && currentColumn !== target.column) {
        if (squares.find((sq) => sq.row === currentRow && sq.column === currentColumn && sq.pieceSrc !== null)) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}

function checkQueen(pieceData, target, squares){
    const deltaRow = Math.abs(pieceData.row - target.row);
    const deltaColumn = Math.abs(pieceData.column - target.column);

    if (deltaColumn === deltaRow || pieceData.row === target.row || pieceData.column === target.column){
        return !checkQueenCollision(pieceData, target, squares);
    }
    return false;

}

function checkQueenCollision(pieceData, target, squares){
    const deltaRow = target.row === pieceData.row ? 0 : target.row > pieceData.row ? 1 : -1;
    const deltaColumn = target.column === pieceData.column ? 0 : target.column > pieceData.column ? 1 : -1;

    let currentRow = pieceData.row + deltaRow;
    let currentColumn = pieceData.column + deltaColumn;

    while (currentRow !== target.row || currentColumn !== target.column) {
        if (squares.find((sq) => sq.row === currentRow && sq.column === currentColumn && sq.pieceSrc !== null)) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}

function checkKing(pieceData, target, squares){
    if (Math.abs(target.row - pieceData.row) > 1) return false;
    if (Math.abs(target.column - pieceData.column) > 1) return false;
    if (checkIfEnemiesKingIsInRange(pieceData, target, squares)) return false; //Króle nie mogą stać obok siebie!

    return true;
}

function checkIfEnemiesKingIsInRange(pieceData, target, squares){
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
        const targetRow = target.row + rowOffset;
        const targetCol = target.column + colOffset;

        const square = squares.find(
            (sq) => sq.row === targetRow && sq.column === targetCol && sq.pieceSrc && sq.pieceSrc[1] === "k" && sq.pieceColor !== pieceData.pieceColor
        );
        if (square) {
            return true;
        }
    }

    return false;
}

export { checkIfPlayersMoveIsCorrect, checkIfPlayerWillBeCheckmated, checkIfPlayerWillBeInPat };