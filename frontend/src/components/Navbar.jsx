import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [nextTrip, setNextTrip] = useState(null);
    const [userPfp, setUserPfp] = useState(null);
    
    const [pendingCount, setPendingCount] = useState(0); // Sofőrnek
    const [acceptedCount, setAcceptedCount] = useState(0); // Utasnak

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        const savedPfp = localStorage.getItem('userPfp');

        if (token && userId) {
            setIsLoggedIn(true);
            const savedName = localStorage.getItem('userName');
            setUserData({ name: savedName || "Felhasználó" });
            if (role) setUserRole(role);
            if (savedPfp) setUserPfp(savedPfp);

            fetchNextTrip(userId, role);
            checkNotifications(userId, role);
        }
    }, [location.pathname]);

    const fetchNextTrip = async (userId, role) => {
        try {
            let tripToShow = null;
            if (role === 'DRIVER') {
                const trips = await request(`/trips/driver/${userId}`);
                const activeOrUpcoming = trips
                    .filter(t => t.live || t.isLive)
                    .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
                if (activeOrUpcoming.length > 0) tripToShow = activeOrUpcoming[0];
            } else {
                const trips = await request(`/trips/user/${userId}`);
                const myTrips = trips.filter(t => new Date(t.departureTime) > new Date() && (t.live||t.isLive));
                if(myTrips.length > 0) tripToShow = myTrips[0];
            }
            setNextTrip(tripToShow);
        } catch (error) { console.error(error); }
    };

    const checkNotifications = async (userId, role) => {
        try {
            if (role === 'DRIVER') {
                const trips = await request(`/trips/driver/${userId}`);
                let count = 0;
                for (const trip of trips) {
                    if (trip.live || trip.isLive) {
                        const passengers = await request(`/bookings/passengers/${trip.tripID}`);
                        count += passengers.filter(p => p.status === 'PENDING').length;
                    }
                }
                setPendingCount(count);
            }
            else if (role === 'PASSENGER' || role === 'USER') {
                const bookings = await request(`/bookings/user/${userId}`);
                const accepted = bookings.filter(b => b.status === 'JOINED' && new Date(b.joinedAt) > new Date(Date.now() - 86400000)).length;
            }
        } catch (e) { console.log("Notification check failed", e); }
    };

    const handleTripClick = () => {
        if (!nextTrip) return;
        navigate('/map', { state: { activeTrip: nextTrip } });
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const isOngoing = nextTrip ? new Date() >= new Date(nextTrip.departureTime) : false;

    return (
        <nav className="navbar navbar-expand-lg sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    <img src="/images/logo.jpeg" alt="Logo"/>
                </a>

                {isLoggedIn && nextTrip && (
                    <div
                        className="d-flex align-items-center ms-auto me-3 p-2 rounded cursor-pointer trip-status-bar"
                        style={{
                            background: isOngoing
                                ? 'linear-gradient(90deg, #28a745 0%, #81c784 100%)'
                                : 'linear-gradient(90deg, #ffc107 0%, #ffdb58 100%)',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
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
                            </div>
                        </div>
                        <div className="ms-2"><i className="fas fa-chevron-right text-dark"></i></div>
                    </div>
                )}

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMainCollapse">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarMainCollapse">
                    <ul className="navbar-nav me-auto my-2 navbar-nav-scroll">
                        <li className="nav-item"><a className="nav-link active" href="/map">Térkép</a></li>

                        {/* SOFŐR MENÜ */}
                        {userRole === "DRIVER" && (
                            <>
                                <li className="nav-item"><a className="nav-link" href="/driver/dashboard">Pult</a></li>
                                <li className="nav-item position-relative">
                                    <a className="nav-link text-warning fw-bold" href="/driverbooking">
                                        Jelentkezők
                                        {pendingCount > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </a>
                                </li>
                            </>
                        )}

                        {(userRole === "PASSENGER" || userRole === "USER") && (
                             <li className="nav-item position-relative">
                                <a className="nav-link text-info fw-bold" href="/passengerbooking">
                                    Foglalásaim
                                </a>
                            </li>
                        )}
                    </ul>

                    <div className="d-flex align-items-center d-none d-lg-flex">
                        {isLoggedIn ? (
                            <div className="dropdown">
                                <button className="btn btn-outline-dark dropdown-toggle fw-bold border-0 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                                    <img src={userPfp || "/images/avatar-placeholder.png"} className="rounded-circle border border-secondary" style={{width: '35px', height: '35px', objectFit: 'cover'}}/>
                                    <span>{userData?.name}</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><a className="dropdown-item" href="/user/profile">Profilom</a></li>
                                    <li><a className="dropdown-item" href="/settings">Beállítások</a></li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Kijelentkezés</button></li>
                                </ul>
                            </div>
                        ) : (
                            <div className="d-flex gap-2">
                                <a className="btn btn-outline-dark" href="/login">Belépés</a>
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