import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import config from "../../config.json";
import "./Navbar.scss";

import NavItem from "./NavItem.tsx";
import ArrowLeftIcon from "../icons/ArrowLeft.tsx";

function Navbar() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  const [isGameFinished, setIsGameFinished] = useState(false);

  useEffect(()=> {
    setIsGameFinished(false);
  }, [gameId]);

  const getGameStatus = async () => {
    if (!gameId) return false;

    try {
      const response = await fetch(`${config.apiURL}game-status?gameId=${gameId}`);
      if (response.ok) {
        const status = await response.json();

        const finished = status !== 1;
        setIsGameFinished(finished);
        return finished;
      } else {
        console.error("Failed to fetch game status:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Error fetching game status:", error);
      return false;
    }
  };


  const handleBack = async () => {
    const finished = await getGameStatus();
    if (gameId && !finished) {
      setShowPopup(true);
      setPendingPath(-1);
    } else {
      navigate(-1);
    }
  };

  const handleNavigate = async (path) => {
    const finished = await getGameStatus();
    if (gameId && !finished) {
      setShowPopup(true);
      setPendingPath(path);
    } else {
      navigate(path);
    }
  };

  const confirmExit = () => {
    setShowPopup(false);
    if (pendingPath === -1) {
      navigate(-1);
    } else {
      navigate(pendingPath);
    }
    setPendingPath(null);
  };

  const cancelExit = () => {
    setShowPopup(false);
    setPendingPath(null);
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar__back" onClick={handleBack}>
          <ArrowLeftIcon size={15} />
        </div>
        <NavItem to="/" label="Home" isInGame={gameId && !isGameFinished} onNavigate={handleNavigate} />
        <NavItem to="/new-game" label="New Game" isInGame={gameId && !isGameFinished} onNavigate={handleNavigate} />
        <NavItem to="/lobby" label="Lobby" isInGame={gameId && !isGameFinished} onNavigate={handleNavigate} />
        <NavItem to="/player-name" label="Change Name" isInGame={gameId && !isGameFinished} onNavigate={handleNavigate} />
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Are you sure you want to leave the game?</p>
            <div className="popup-actions">
              <button onClick={confirmExit} className="popup-button confirm">
                Yes
              </button>
              <button onClick={cancelExit} className="popup-button cancel">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
