import React, { useState, useEffect } from 'react';

const Navbar = () => {
    // Állapot a bejelentkezés figyeléséhez
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Ellenőrizzük, van-e token a localStorage-ban (vagy sessionStorage-ban)
        const token = localStorage.getItem('token');

        if (token) {
            setIsLoggedIn(true);
            // ITT: A valóságban itt dekódolnád a tokent vagy kérnéd le az adatokat API-ról.
            // Most példaként beállítunk egy statikus nevet:
            const savedName = localStorage.getItem('userName'); // Opcionális: ha a nevet is elmentetted
            setUserData({ name: savedName || "Felhasználó" });
        }
    }, []);

    const handleLogout = () => {
        // Token törlése
        localStorage.removeItem('token');
        localStorage.removeItem('userName'); // Ha mást is tárolsz

        // State frissítése
        setIsLoggedIn(false);
        setUserData(null);

        // Opcionális: átirányítás a login oldalra vagy főoldalra
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

                    {/* Ez a gomb nyitja a jobb oldali auth menüt desktopon */}
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

                {/* AUTH SZEKCIÓ */}
                <div className="collapse justify-content-end" id="navbarAuthCollapse" style={{ position: 'absolute', top: '100%', right: 0, width: 'auto', zIndex: 102, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '0 0 5px 5px' }}>
                    <ul className="navbar-nav p-2">
                        {isLoggedIn ? (
                            // HA BE VAN JELENTKEZVE
                            <>
                                <li className="nav-item border-bottom mb-1">
                                    <span className="nav-link text-dark fw-bold">
                                        {/* Itt jelenítjük meg a felhasználó nevét */}
                                        Szia, {userData?.name}!
                                    </span>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-dark" href="/profile">
                                        Profilom
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