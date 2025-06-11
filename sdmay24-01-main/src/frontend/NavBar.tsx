import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
    return (
        <header className="header">
            <div className="nav">
                <h1>Scheduler</h1>
                <Link className="nav-button" to="/classes">Classes</Link>
                <Link className="nav-button" to="/cohort">Cohort</Link>
                <Link className="nav-button" to="/">Schedule</Link>
                <Link className="nav-button" to="/import">Import</Link>
            </div>
        </header>
    );
}

export default NavBar;