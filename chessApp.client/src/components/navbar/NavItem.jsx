import { NavLink } from "react-router-dom";

function NavItem({ to, label}) {
    return(
        <>
            <NavLink to={to}>
                {label}
            </NavLink>
        </>
    )
}

export default NavItem;