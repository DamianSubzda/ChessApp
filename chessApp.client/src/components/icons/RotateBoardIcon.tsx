import React from "react";

type RotateBoardIconProps = {
  size: number;
};

function RotateBoardIcon({ size }: RotateBoardIconProps) {
  const viewBoxSize = size;
  const center = size / 2;
  // Promień okręgu – dostosowany do rozmiaru ikony
  const radius = size * 0.30;
  // Ustalamy grubość linii na podstawie rozmiaru
  const strokeWidth = size / 12;

  // Ustawienia łuku:
  // Rozpoczynamy od kąta -45° (w radianach: -PI/4)
  // i rysujemy łuk o rozpiętości 270° (3/2PI), co tworzy charakterystyczny "odwrócony" kształt
  const startAngle = -Math.PI / 4; // -45°
  const sweepAngle = (3 * Math.PI) / 2; // 270°
  const endAngle = startAngle + sweepAngle;

  // Obliczamy współrzędne punktu początkowego i końcowego łuku
  const startX = center + radius * Math.cos(startAngle);
  const startY = center + radius * Math.sin(startAngle);
  const endX = center + radius * Math.cos(endAngle);
  const endY = center + radius * Math.sin(endAngle);

  // Ustalamy flagi łuku (duży łuk, kierunek rysowania)
  const largeArcFlag = sweepAngle > Math.PI ? 1 : 0;
  // Używamy sweepFlag = 1 (w SVG oznacza to rysowanie zgodnie z ruchem wskazówek zegara)
  const sweepFlag = 1;

  // Budujemy komendę ścieżki (path) dla elementu <path>
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;

  // Ustawienia grotu strzałki
  const arrowHeadLength = size / 6;
  const arrowHeadOffset = (40 * Math.PI) / 180; // 40° w radianach

  // Kąt styczny do okręgu w punkcie końcowym łuku – dla okręgu jest to kąt promienia + 90°
  const tangentAngle = endAngle + Math.PI / 2.3;

  // Obliczamy dwa punkty, które utworzą grot (linia w lewo i prawo od punktu końcowego)
  const arrowPoint1X = endX - arrowHeadLength * Math.cos(tangentAngle - arrowHeadOffset);
  const arrowPoint1Y = endY - arrowHeadLength * Math.sin(tangentAngle - arrowHeadOffset);
  const arrowPoint2X = endX - arrowHeadLength * Math.cos(tangentAngle + arrowHeadOffset);
  const arrowPoint2Y = endY - arrowHeadLength * Math.sin(tangentAngle + arrowHeadOffset);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
    >
      {/* Łuk symbolizujący obrót */}
      <path
        d={arcPath}
        fill="none"
        stroke="black"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Groty strzałki (dwie linie) */}
      <line
        x1={endX}
        y1={endY}
        x2={arrowPoint1X}
        y2={arrowPoint1Y}
        stroke="black"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line
        x1={endX}
        y1={endY}
        x2={arrowPoint2X}
        y2={arrowPoint2Y}
        stroke="black"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default RotateBoardIcon;
