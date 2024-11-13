import "./Square.scss"
import { changeDigitsToLetter } from "../../utils/boardUtil";

function Square(props){
    const { row, column, piece, pieceColor, onDropPiece } = props;

    const handleDragStart = (e) => {
        e.dataTransfer.setData("piece", JSON.stringify({ piece, pieceColor, row, column }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const pieceData = JSON.parse(e.dataTransfer.getData("piece"));
        onDropPiece(pieceData, { row, column });
    }
    
    const handleDragOver = (e) => {
        e.preventDefault();
    }

    return(
        <div 
            className="square" 
            style={{ backgroundColor: (row + column) % 2 === 1? "white" : "green" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {piece && <div className="piece" id={`${pieceColor}-${piece}`}>
                <img src={`/assets/pieces/neo/${piece}`} alt="" onDragStart={handleDragStart}/>
            </div>}
            { column === 1 || row === 1  ? <div className="notation">
                <p>{changeDigitsToLetter(column)}{row}</p>
            </div> : ""}
        </div>
    );

    
}

export default Square;