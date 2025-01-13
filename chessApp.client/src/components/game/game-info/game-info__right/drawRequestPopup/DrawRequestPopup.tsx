import React from "react";
import "./DrawRequestPopup.scss"

type DrawRequestPopupPropsType = {
    handleAcceptedDraw(): void,
    handleDeclinedDraw(): void
}

function DrawRequestPopup({ handleAcceptedDraw, handleDeclinedDraw }: DrawRequestPopupPropsType) {
  return (
    <div className="draw-popup">
      <p>Your opponent has requested a draw. Do you accept?</p>
      <div className="draw-popup__buttons">
        <button
          className="draw-popup__button draw-popup__button--accept"
          onClick={handleAcceptedDraw}
        >
          Accept
        </button>
        <button
          className="draw-popup__button draw-popup__button--decline"
          onClick={handleDeclinedDraw}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export default DrawRequestPopup;
