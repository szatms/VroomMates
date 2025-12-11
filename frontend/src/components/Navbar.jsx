import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [nextTrip, setNextTrip] = useState(null);
    const [userPfp, setUserPfp] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        const savedPfp = localStorage.getItem('userPfp');

        if (token) {
            setIsLoggedIn(true);
            const savedName = localStorage.getItem('userName');
            setUserData({ name: savedName || "Felhasználó" });
            if (role) setUserRole(role);
            if (savedPfp) setUserPfp(savedPfp);

            fetchNextTrip(userId, role);
        }
    }, [location.pathname]);

    const fetchNextTrip = async (userId, role) => {
        if (!userId) return;
        try {
            let tripToShow = null;

            if (role === 'DRIVER') {
                const trips = await request(`/trips/driver/${userId}`);
                const now = new Date();
                const activeOrUpcoming = trips
                    .filter(t => t.live || t.isLive)
                    .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

                if (activeOrUpcoming.length > 0) tripToShow = activeOrUpcoming[0];

            } else {
                const savedTripId = localStorage.getItem('passengerActiveTripId');
                if (savedTripId) {
                    const trip = await request(`/trips/${savedTripId}`);
                    if (trip && (trip.live || trip.isLive)) {
                        tripToShow = trip;
                    }
                }
            }
            setNextTrip(tripToShow);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTripClick = () => {
        if (!nextTrip) return;
        navigate('/map', { state: { activeTrip: nextTrip } });
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setUserData(null);
        setUserRole(null);
        setNextTrip(null);
        setUserPfp(null);
        window.location.href = '/login';
    };

    const isOngoing = nextTrip ? new Date() >= new Date(nextTrip.departureTime) : false;

    return (
        <nav className="navbar navbar-expand-lg sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    <img src="/images/logo.jpeg" alt="Logo"/>
                </a>

                {/* --- DINAMIKUS ÚT SÁV --- */}
                {isLoggedIn && nextTrip && (
                    <div
                        className="d-flex align-items-center ms-auto me-3 p-2 rounded cursor-pointer"
                        style={{
                            background: isOngoing
                                ? 'linear-gradient(90deg, #28a745 0%, #81c784 100%)'
                                : 'linear-gradient(90deg, #ffc107 0%, #ffdb58 100%)',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={handleTripClick}
                    >
                        <div className="me-2 d-none d-sm-block">
                            <i className={`fas ${isOngoing ? 'fa-route' : 'fa-car-side'} text-dark fs-5`}></i>
                        </div>
                        <div style={{lineHeight: '1.1'}}>
                            <div className="text-dark fw-bold text-uppercase" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>
                                {isOngoing ? "JELENLEGI ÚT" : "KÖVETKEZŐ ÚT"}
                            </div>
                            <div className="text-dark fw-bold small">
                                {new Date(nextTrip.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                <span className="mx-1">•</span>
                                {nextTrip.endLocation.split(',')[0]}
                            </div>
                        </div>
                        <div className="ms-2">
                            <i className="fas fa-chevron-right text-dark"></i>
                        </div>
                    </div>
                )}

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMainCollapse">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarMainCollapse">
                    <ul className="navbar-nav me-auto my-2 navbar-nav-scroll">
                        <li className="nav-item">
                            <a className="nav-link active" href="/map">Térkép</a>
                        </li>

                        {/* Sofőr menük */}
                        {userRole === "DRIVER" && (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link text-dark fw-bold" href="/driver/dashboard">
                                        Sofőr Panel
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-success fw-bold" href="/driverbooking">
                                        <i className="bi bi-people-fill me-1"></i> Jelentkezők
                                    </a>
                                </li>
                            </>
                        )}

                        {/* Utas menü */}
                        {userRole === "PASSENGER" && (
                             <li className="nav-item">
                                <a className="nav-link text-primary fw-bold" href="/passengerbooking">
                                    Foglalásaim
                                </a>
                            </li>
                        )}

                        {isLoggedIn && (
                            <>
                                <li className="nav-item border-top mt-2 pt-2 d-lg-none">
                                    <a className="nav-link text-white" href="/user/profile">
                                        <i className="bi bi-person-circle me-2"></i>Profilom
                                    </a>
                                </li>
                                <li className="nav-item d-lg-none">
                                    <a className="nav-link text-white" href="/settings">
                                        <i className="bi bi-gear-fill me-2"></i>Beállítások
                                    </a>
                                </li>
                                <li className="nav-item d-lg-none">
                                    <button className="nav-link btn btn-link text-danger text-start w-100" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>Kijelentkezés
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* 🔥 DESKTOP NÉZET (d-none d-lg-flex): Dropdown menü */}
                    <div className="d-flex align-items-center d-none d-lg-flex">
                        {isLoggedIn ? (
                            <div className="dropdown">
                                <button className="btn btn-outline-dark dropdown-toggle fw-bold border-0 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                                    <img
                                        src={userPfp || "/images/avatar-placeholder.png"}
                                        alt="Pfp"
                                        className="rounded-circle border border-secondary"
                                        style={{width: '35px', height: '35px', objectFit: 'cover'}}
                                    />
                                    <span>Szia, {userData?.name}!</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><a className="dropdown-item" href="/user/profile">Profilom</a></li>
                                    {/* 🔥 TÖRÖLVE: Járművem menüpont */}
                                    <li><a className="dropdown-item" href="/settings">Beállítások</a></li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Kijelentkezés</button></li>
                                </ul>
                            </div>
                        ) : (
                            <div className="d-flex gap-2">
                                <a className="btn btn-outline-dark" href="/login">Bejelentkezés</a>
                                <a className="btn btn-dark" href="/register">Regisztráció</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;