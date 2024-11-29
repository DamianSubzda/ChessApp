import "./Square.scss"
import { changeDigitsToLetter } from "../../utils/boardUtil";
import { useRef } from "react";

function Square(props){
    const { row, column, pieceSrc, pieceColor, onDropPiece } = props;
    const pieceRef = useRef(null);

    const handleDragStart = (e) => {
        e.dataTransfer.setData("piece", JSON.stringify({ pieceSrc, pieceColor, row, column }));
        
        if (pieceRef.current) {
            pieceRef.current.style.opacity = "0.5";
        }
    };

    const handleDragEnd = () => {
        if (pieceRef.current) {
            pieceRef.current.style.opacity = "1";
        }
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
            {pieceSrc && 
            <div className="piece" id={`${row}${column}`} 
                ref={pieceRef} draggable 
                onDragStart={handleDragStart} 
                onDragEnd={handleDragEnd}>
                <img src={`/assets/pieces/neo/${pieceSrc}`} alt="" />
            </div>}
            { column === 1 || row === 1  ? <div className="notation">
                <p>{changeDigitsToLetter(column)}{row}</p>
            </div> : ""}
        </div>
    );
    
    
}

export default Square;