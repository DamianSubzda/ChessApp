import { useNavigate } from "react-router-dom";
import React from 'react';
import NavItem from "./NavItem";

function Navbar(){
    const navigate = useNavigate();

    return(
        <nav style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd', display: "flex", flexDirection: "row", gap: "10px" }}>
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>
                Back
            </button>
            <NavItem to="/" label="Home" />
            <NavItem to="/new-game" label="New Game" />
            <NavItem to="/lobby" label="Lobby" />
            <NavItem to="/player-name" label="Change Name" />
        </nav>
    )
}

export default Navbar;