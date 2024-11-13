
function checkMove(piece, target, squares){
    console.log(piece);
    console.log(target);

    switch (piece.piece[1]) {
        case "p":
            return checkPawn(piece, target, squares)
        case "r":
            return checkRook(piece, target, squares)
        case "n":
            return checkKnight(piece, target, squares)
        case "b":
            return checkBishop(piece, target, squares)
        case "q":
            return checkQueen(piece, target, squares)
        case "k":
            return checkKing(piece, target, squares)
        default:
            return false;
    }
}

function checkPawn(piece, target, squares){
    console.log("Checking pawn");

    if (piece.piece[0] === "w"){
        //white pawn
        if (piece.column !== target.column){
            //sprawdzenie zbicia
            return false;
        }
        if (target.row === piece.row + 2){
            //First move
            if (piece.row === 2){
                return checkCollision(piece, target, squares);
            }else{
                return false;
            }
        }
        if (target.row === piece.row + 1){
            return checkCollision(piece, target, squares);
        }
    }
    else{
        //black pawn
        if (piece.column !== target.column){
            //sprawdzenie zbicia
            return false;
        }
        if (target.row === piece.row - 2){
            //First move
            if (piece.row === 7){
                return checkCollision(piece, target, squares);
            }else{
                return false;
            }
        }
        if (target.row === piece.row - 1){
            return checkCollision(piece, target, squares);
        }
    }

    return false;
}

function checkRook(piece, target, squares){
    console.log("Checking rook");
    return true;
}

function checkKnight(piece, target, squares){
    console.log("Checking knight");
    return true;
}

function checkBishop(piece, target, squares){

}

function checkQueen(piece, target, squares){

}

function checkKing(piece, target, squares){
    console.log("checking king");
    console.log(piece);
    if (Math.abs(target.row - piece.row) > 1) return false;
    if (Math.abs(target.column - piece.column) > 1) return false;
    if (checkIfEnemiesKingIsInRange(target.row, target.column, squares, piece.pieceColor)) return false;
    return !checkIfSquareIsClear(target.row, target.column, squares)

}


function checkCollision(piece, target, squares){
    
}

function checkIfEnemiesKingIsInRange(row, column, squares, pieceColor){
    console.log(row, column, pieceColor, squares);
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
        const targetRow = row + rowOffset;
        const targetCol = column + colOffset;

        const square = squares.find(
            (sq) => sq.row === targetRow && sq.column === targetCol && sq.piece && sq.piece[1] === "k" && sq.pieceColor !== pieceColor
        );
        console.log(square);
        if (square) {
            return true; // Król przeciwnika jest w zasięgu
        }
    }

    return false;
}

function checkIfSquareIsClear(row, column, squares){
    if (squares.find((square) => square.row === row && square.column === column).piece === null){
        return false;
    }
    return true;
}

function checkIfSquareIsClearFromAllyPieces(row, column, squares){ //toDo
    if (squares.find((square)=> square.row === row && square.column === column).piece === null){
        return false;
    }
    return true;
}


export default checkMove;