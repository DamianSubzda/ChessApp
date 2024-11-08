import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function MenuPage(){

    return(
        <div>
            <Router>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
        </div>
    );
}

export default MenuPage;