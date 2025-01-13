
import { useState } from "react";

function NameForm({ onSubmit }){
    const [name, setName] = useState("")

    function handleInputChange(event) {
        setName(event.target.value);
    }

    function handleSubmit() {
        onSubmit(name);
    }

    return(
        <div style={{backgroundColor: `rgb(245, 245, 245);`, padding: `1rem`}}>
            <p>Name:</p>
            <input value={name} onChange={handleInputChange} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default NameForm;