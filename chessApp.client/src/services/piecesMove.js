
function checkMove(pieceData, target, squares){

    if (!checkIfSquareIsClearFromAllyPieces(pieceData, target, squares)) return false;

    switch (pieceData.pieceSrc[1]) {
        case "p":
            return checkPawn(pieceData, target, squares)
        case "r":
            return checkRook(pieceData, target, squares)
        case "n":
            return checkKnight(pieceData, target, squares)
        case "b":
            return checkBishop(pieceData, target, squares)
        case "q":
            return checkQueen(pieceData, target, squares)
        case "k":
            return checkKing(pieceData, target, squares)
        default:
            return false;
    }
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
    console.log("Checking pawn");

    if (pieceData.pieceColor === "white"){
        //white pawn
        if (pieceData.column !== target.column){
            //sprawdzenie zbicia
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
    console.log("pawn coolision");
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
    console.log("pawn takes");
    if (squares.find((sq) => sq.row === target.row && sq.column === target.column).pieceSrc !== null){
        return true;
    }
    return false;
}

function checkRook(pieceData, target, squares){
    console.log("Checking rook");

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
    console.log("Checking knight");

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
    console.log("queen collision");
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
    console.log("checking king");
    if (Math.abs(target.row - pieceData.row) > 1) return false;
    if (Math.abs(target.column - pieceData.column) > 1) return false;
    if (checkIfEnemiesKingIsInRange(pieceData, target, squares)) return false;
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

export default checkMove;