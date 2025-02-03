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
    <div className="navitem">
      <NavLink className="navitem__link" to={to} onClick={handleClick}>
        {label}
      </NavLink>
    </div>
  );
}

export default NavItem;
