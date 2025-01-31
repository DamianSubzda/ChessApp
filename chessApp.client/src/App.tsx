import React from "react";
import { Routes, Route } from 'react-router-dom';
import GamePage from "./pages/GamePage.tsx"
import PageNotFound from "./pages/PageNotFound.js"
import LobbyPage from "./pages/LobbyPage.js"
import HomePage from "./pages/HomePage.js";
import CreateGamePage from "./pages/CreateGamePage.tsx";
import NameFormPage from "./pages/NameFormPage.js";
import Navbar from "./components/navbar/Navbar.tsx"
import "./App.scss"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="new-game" element={<><Navbar /><CreateGamePage /></>} />
        <Route path="game/:gameId" element={<><Navbar /><GamePage /></>} />
        <Route path="lobby" element={<><Navbar /><LobbyPage /></>} />
        <Route path="player-name" element={<><Navbar /><NameFormPage /></>} />
        <Route path="*" element={<><Navbar /><PageNotFound /></>} />
      </Routes>
    </>
  );
}

export default App;
