import React from "react";
import DrawRequestIcon from "../../icons/DrawRequestIcon.tsx";
import ResignIcon from "../../icons/ResignIcon.tsx";
import DrawRequestPopup from "./game-info__right/drawRequestPopup/DrawRequestPopup.tsx";
import MovesHistory from "./game-info__right/moves-history/MovesHistory.tsx";

import { GameControllerType } from "./../../../hooks/useGameController.tsx"

import "./GameInfoRight.scss"
import RotateBoardIcon from "components/icons/RotateBoardIcon.tsx";

interface GameInfoRightPlayerProps {
  gameController: GameControllerType
}

function GameInfoRight({ gameController }: GameInfoRightPlayerProps) {

  return (
    <div className="game-page__right">
        <MovesHistory />
        <div className="game-page__right__buttons">
          {gameController.drawRequest.canAcceptDraw && (
            <DrawRequestPopup
              handleAcceptedDraw={gameController.onClickAcceptDrawRequest}
              handleDeclinedDraw={gameController.drawRequest.declineDrawRequest}
            />
          )}
          {gameController.player.current?.role === "player" ?
            <>
              <button onClick={gameController.onClickResignGame}>
                <ResignIcon size={32} />
              </button>
              <button
                onClick={gameController.drawRequest.sendDrawRequest}
                ref={gameController.drawRequest.setButtonRef}
              >
                <DrawRequestIcon size={32} />
              </button>
            </>
            : 
            <button onClick={gameController.onClickRotateBoardForObserver}>
                <RotateBoardIcon size={32}/>
            </button>
          }
          
        </div>
      </div>
  );
}

export default GameInfoRight;