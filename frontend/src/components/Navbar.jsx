// Navbar.jsx
import React from 'react';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    <img src="/images/Logo.png" alt="Logo"/>
                </a>

                <button
                    className="navbar-toggler d-lg-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMainCollapse" // Célja a Fő Collapse konténer
                    aria-controls="navbarMainCollapse"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarMainCollapse">

                    <ul className="navbar-nav me-auto my-2 navbar-nav-scroll" style={{ "--bs-scroll-height": "100px" }}>
                        <li className="nav-item">
                            <a className="nav-link active" href="/map">Térkép</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/szures">Sofőrök</a>
                        </li>
                    </ul>
                    <button
                        className="navbar-toggler d-none d-lg-block ms-auto"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarAuthCollapse"
                        aria-controls="navbarAuthCollapse"
                        aria-expanded="false"
                        aria-label="Toggle authentication"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>

                <div className="collapse justify-content-end" id="navbarAuthCollapse" style={{ position: 'absolute', top: '100%', right: 0, width: 'auto', zIndex: 102 }}>
                    <ul className="navbar-nav p-2">
                        <li className="nav-item">
                            <a className="nav-link text-dark" href="/login">Bejelentkezés</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-dark" href="/register">Regisztráció</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;