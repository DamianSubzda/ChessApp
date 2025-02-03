import { useLocation, useNavigate } from "react-router-dom";
import "./NameFormPage.scss"

import NameForm from "../components/forms/NameForm";

function NameFormPage(){
	const navigate = useNavigate();
	const location = useLocation();

	const redirectPath = location.state?.redirectPath || "/";

	function onSubmit(name){
			if (name.trim() !== ""){
					localStorage.setItem("PlayerName", name);
					navigate(redirectPath);
			}else {
					alert("Name cannot be null!");   
			}
	}

	return (
			<div className="nameform__page">
					<NameForm onSubmit={onSubmit}/>
			</div>
	);
}

export default NameFormPage;