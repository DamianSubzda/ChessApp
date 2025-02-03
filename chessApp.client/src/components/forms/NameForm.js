import { useState } from "react";
import "./NameForm.scss"

function NameForm({ onSubmit }){
	const [name, setName] = useState("")

	function handleInputChange(event) {
			setName(event.target.value);
	}

	function handleSubmit() {
			onSubmit(name);
	}

	return (
		<div className="nameform__panel">
			<p className="nameform__label">Enter username:</p>
			<input
				type="text"
				value={name}
				onChange={handleInputChange}
				className="nameform__input"
				placeholder="Type your username..."
			/>
			<button className="nameform__button" onClick={handleSubmit}>
				Submit
			</button>
		</div>
	);
	
}

export default NameForm;