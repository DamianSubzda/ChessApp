import React from "react";

type DrawRequestIconProps = {
  size: number;
};

function DrawRequestIcon({ size }: DrawRequestIconProps) {
  const viewBoxSize = size;

  const lineThickness = size / 16; // Grubość linii
  const textSize = size / 2; // Rozmiar tekstu
  const textOffsetX =  - size / 12; // Przesunięcie tekstu w poziomie
  const textOffsetY = size / 7; // Przesunięcie tekstu w pionie

  const lineStartX = size / 4; // Start X linii ukośnej
  const lineStartY = size - size / 6; // Start Y linii ukośnej
  const lineEndX = size - size / 4; // Koniec X linii ukośnej
  const lineEndY = size / 6; // Koniec Y linii ukośnej

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
    >
      {/* Linia ukośna */}
      <line
        x1={lineStartX}
        y1={lineStartY}
        x2={lineEndX}
        y2={lineEndY}
        stroke="red"
        strokeWidth={lineThickness}
        strokeLinecap="round"
      />

      {/* "1" */}
      <text
        x={lineStartX - textOffsetX * 1.1}
        y={lineEndY + textOffsetY * 1.1}
        fill="black"
        fontSize={textSize}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
      >
        1
      </text>

      {/* "2" */}
      <text
        x={lineEndX + textOffsetX * 0.5}
        y={lineStartY - textOffsetY * 0.9}
        fill="black"
        fontSize={textSize}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
      >
        2
      </text>
    </svg>
  );
}

export default DrawRequestIcon;
