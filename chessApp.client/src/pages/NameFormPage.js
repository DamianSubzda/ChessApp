import NameForm from "../components/UI/NameForm";
import { useLocation, useNavigate } from "react-router-dom";
import "./NameFormPage.scss"

function NameFormPage({ path }){
    const navigate = useNavigate();
    const location = useLocation();

    const redirectPath = location.state?.redirectPath || "/";

    function onSubmit(name){
        if (name.trim() !== ""){
            localStorage.setItem("PlayerName", name);
            navigate(redirectPath);
        }else{
            alert("Name cannot be null!");   
        }
    }

    return (
        <div className="name-form-page">
            <NameForm onSubmit={onSubmit}/>
        </div>
    );
}

export default NameFormPage;