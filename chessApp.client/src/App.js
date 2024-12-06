import React from "react";
import { Routes, Route } from 'react-router-dom';
import GamePage from "./pages/GamePage"
import PageNotFound from "./pages/PageNotFound"
import LobbyPage from "./pages/LobbyPage"
import HomePage from "./pages/HomePage";
import CreateGame from "./pages/CreateGame";
import NameFormPage from "./pages/NameFormPage";
import Navbar from "./components/navbar/Navbar"
import "./App.css"

function App() {
  return (
    <>
      <Navbar />
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="new-game" element={<CreateGame />} />
          <Route path="game/:gameId" element={<GamePage />} />
          <Route path="lobby" element={<LobbyPage />} />
          <Route path="player-name" element={<NameFormPage path={"/"}/>} />
          <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
