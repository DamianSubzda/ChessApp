import React from "react";

type ArrowLeftIconProps = {
  size: number;
};

function ArrowLeftIcon({ size }: ArrowLeftIconProps) {
  const viewBoxSize = size;

  const lineThickness = size / 5;
  const horizontalLineLength = size;

  const horizontalStartX = 0;
  const horizontalEndX = size;
  const horizontalY = size/2;

  const diagonalStartX = horizontalStartX;
  const diagonalEndX = horizontalLineLength - size / 2;
  const diagonalStartY = horizontalY;
  const diagonalVector = size / 2;
  const diagonalUpEndY = horizontalY + diagonalVector;
  const diagonalDownEndY = horizontalY - diagonalVector;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" 
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}>
        <line x1={diagonalStartX} x2={diagonalEndX} y1={diagonalStartY} y2={diagonalUpEndY} stroke="black" stroke-width={lineThickness} />
        <line x1={diagonalStartX} x2={diagonalEndX} y1={diagonalStartY} y2={diagonalDownEndY} stroke="black" stroke-width={lineThickness} />
        <line x1={horizontalStartX} x2={horizontalEndX} y1={horizontalY} y2={horizontalY} stroke="black" stroke-width={lineThickness} /> {/*horizontal*/}
    </svg>
  );
}

export default ArrowLeftIcon;
