import React, { useState, useEffect } from 'react';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            setIsLoggedIn(true);
            const savedName = localStorage.getItem('userName');
            setUserData({ name: savedName || "Felhasználó" });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setUserData(null);
        window.location.href = '/login';
    };

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
                    data-bs-target="#navbarMainCollapse"
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

                <div className="collapse justify-content-end" id="navbarAuthCollapse" style={{ position: 'absolute', top: '100%', right: 0, width: 'auto', zIndex: 102, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '0 0 5px 5px' }}>
                    <ul className="navbar-nav p-2">
                        {isLoggedIn ? (
                            // HA BE VAN JELENTKEZVE
                            <>
                                <li className="nav-item border-bottom mb-1">
                                    <span className="nav-link text-dark fw-bold">
                                        Szia, {userData?.name}!
                                    </span>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-dark" href="/profile">
                                        Profilom
                                    </a>
                                </li>
                                {/* ÚJ GOMB ITT */}
                                <li className="nav-item">
                                    <a className="nav-link text-dark" href="/user/vehicle">
                                        Járműveim
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <button
                                        onClick={handleLogout}
                                        className="nav-link btn btn-link text-danger text-start w-100"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        Kijelentkezés
                                    </button>
                                </li>
                            </>
                        ) : (
                            // HA NINCS BEJELENTKEZVE
                            <>
                                <li className="nav-item">
                                    <a className="nav-link text-dark" href="/login">Bejelentkezés</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-dark" href="/register">Regisztráció</a>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;