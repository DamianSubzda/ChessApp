import { useNavigate, useParams, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import NavItem from "./NavItem";
import ArrowLeftIcon from "../icons/ArrowLeft.tsx";
import config from "./../../config.json";
import "./Navbar.scss";

function Navbar() {
  const navigate = useNavigate();
  const { gameId } = useParams(); // Pobieranie gameId z URL
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  const [isGameFinished, setIsGameFinished] = useState(false);

  const getGameStatus = async () => {
    console.log("getGameStatus", gameId);
    if (!gameId) return;

    try {
      const response = await fetch(`${config.apiURL}/game-status?gameId=${gameId}`);
      if (response.ok) {
        const status = await response.json();
        console.log("Game status:", status);
        setIsGameFinished(status === "Finished"); // Zakładamy, że API zwraca "Finished"
      } else {
        console.error("Failed to fetch game status:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching game status:", error);
    }
  };

  const handleBack = () => {
    console.log("back");
    getGameStatus();
    if (gameId && !isGameFinished) {
      setShowPopup(true);
      setPendingPath(-1); // Zwraca do poprzedniej strony
    } else {
      navigate(-1);
    }
  };

  const handleNavigate = (path) => {
    console.log("navigate");
    getGameStatus();
    if (gameId && !isGameFinished) {
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
        <button onClick={handleBack}>
          <ArrowLeftIcon size={10} />
        </button>
        <NavItem to="/" label="Home" onNavigate={handleNavigate} />
        <NavItem to="/new-game" label="New Game" onNavigate={handleNavigate} />
        <NavItem to="/lobby" label="Lobby" onNavigate={handleNavigate} />
        <NavItem to="/player-name" label="Change Name" onNavigate={handleNavigate} />
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
