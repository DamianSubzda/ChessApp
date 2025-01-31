import { NavLink } from "react-router-dom";
import "./NavItem.scss";
import React from "react";

function NavItem({ to, label, isInGame, onNavigate }) {
    const handleClick = (event) => {
        if (isInGame) {
            event.preventDefault();
            onNavigate(to);
        }
    };

    return (
        <NavLink 
            className="navitem" 
            to={to} 
            onClick={handleClick}
        >
            {label}
        </NavLink>
    );
}

export default NavItem;
