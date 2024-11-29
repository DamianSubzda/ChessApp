import NameForm from "../components/UI/NameForm";
import { useLocation, useNavigate } from "react-router-dom";

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
        <NameForm onSubmit={onSubmit}/>
    );
}

export default NameFormPage;