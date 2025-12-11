import React, { useState, useEffect } from 'react';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            setIsLoggedIn(true);

            const savedName = localStorage.getItem('userName');
            const savedRole = localStorage.getItem('role');

            setUserData({ name: savedName || "Felhasználó" });
            if (savedRole) setUserRole(savedRole);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        setUserData(null);
        setUserRole(null);
        window.location.href = '/login';
    };

    return (
        <nav className="navbar navbar-expand-lg sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    <img src="/images/logo.jpeg" alt="Logo" style={{maxHeight: '40px'}}/>
                </a>

                <button
                    className="navbar-toggler d-lg-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMainCollapse"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarMainCollapse">
                    <ul className="navbar-nav me-auto my-2 navbar-nav-scroll">
                        <li className="nav-item">
                            <a className="nav-link active" href="/map">Térkép</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/driver/dashboard">Sofőrök</a>
                        </li>

                        {/* 🔥 DINAMIKUS GOMB (Mindkettőnek megjelenik, de máshova visz) */}
                        {isLoggedIn && (
                            <li className="nav-item">
                                <a
                                    className={`nav-link fw-bold ${userRole === 'DRIVER' ? 'text-success' : 'text-primary'}`}
                                    href={userRole === 'DRIVER' ? '/driverbooking' : '/passengerbooking'}
                                >
                                    {/* Ikon és szöveg cseréje szerepkör alapján */}
                                    {userRole === 'DRIVER' ? (
                                        <>
                                            <i className="bi bi-car-front-fill me-1"></i> Utazásaim
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-backpack-fill me-1"></i> Utazásaim
                                        </>
                                    )}
                                </a>
                            </li>
                        )}
                    </ul>

                    <button
                        className="navbar-toggler d-none d-lg-block ms-auto"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarAuthCollapse"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>

                <div className="collapse justify-content-end" id="navbarAuthCollapse"
                     style={{
                         position: 'absolute',
                         top: '100%',
                         right: 0,
                         backgroundColor: 'white',
                         border: '1px solid #ddd',
                         borderRadius: '0 0 5px 5px',
                         zIndex: 1000
                     }}
                >
                    <ul className="navbar-nav p-2">
                        {isLoggedIn ? (
                            <>
                                <li className="nav-item border-bottom mb-1">
                                    <span className="nav-link text-dark fw-bold">
                                        Szia, {userData ? userData.name : 'Vendég'}!
                                    </span>
                                </li>

                                <li className="nav-item">
                                    <a className="nav-link text-dark" href="/user/profile">
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