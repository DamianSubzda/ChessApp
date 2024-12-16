import React from "react";

type ResignIconProps = {
  size: number;
};

function ResignIcon({ size }: ResignIconProps) {
  const viewBoxSize = size;
  const flagPoleWidth = size / 20;
  const flagPoleHeight = size * 0.7;
  const flagPoleX = size / 3.5 - flagPoleWidth / 2;
  const flagPoleY = size / 1.8 - flagPoleHeight / 2;

  const flagWidth = size * 0.5;
  const flagHeight = size * 0.35;
  const flagXStart = flagPoleX + flagPoleWidth;
  const flagYStart = flagPoleY;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
    >
      {/* Drzewiec flagi */}
      <rect
        x={flagPoleX}
        y={flagPoleY}
        width={flagPoleWidth}
        height={flagPoleHeight}
        fill="#6b6b6b"
      />
      {/* Flaga */}
      <path
        d={`M${flagXStart} ${flagYStart}
            L${flagXStart + flagWidth} ${flagYStart}
            L${flagXStart + flagWidth * 0.7} ${flagYStart + flagHeight / 2}
            L${flagXStart + flagWidth} ${flagYStart + flagHeight}
            L${flagXStart} ${flagYStart + flagHeight} Z`}
        fill="#f15a5a"
      />
    </svg>
  );
}

export default ResignIcon;
