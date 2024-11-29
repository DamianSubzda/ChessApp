import React from "react";
import { Routes, Route } from 'react-router-dom';
import GamePage from "./pages/GamePage"
import PageNotFound from "./pages/PageNotFound"
import LobbyPage from "./pages/LobbyPage"
import MenuPage from "./pages/MenuPage";
import CreateGame from "./pages/CreateGame";
import NameFormPage from "./pages/NameFormPage";

function App() {
  return (
    <>
        <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/new-game" element={<CreateGame />} />
            <Route path="/game/:gameId" element={<GamePage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/player-name" element={<NameFormPage path={"/"}/>} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    </>
  );
}

export default App;
