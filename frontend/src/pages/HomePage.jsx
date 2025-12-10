import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/homepage.css';
import { request } from '../utils/api'; //

export default function HomePage() {
    const navigate = useNavigate();

    // State-ek az adatokhoz
    const [stats, setStats] = useState({
        totalDrivers: 0,
        totalPassengers: 0,
        activeTrips: 0,
        latestRatings: []
    });
    const [featuredTrips, setFeaturedTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Kereső mezők state-jei
    const [searchParams, setSearchParams] = useState({
        from: "",
        to: "",
        date: new Date().toISOString().split('T')[0], // Mai dátum alapból
        time: "08:00"
    });

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // 1. Statisztikák és Vélemények lekérése a /api/stats/home végpontról
                const statsData = await request('/stats/home');
                if (statsData) {
                    setStats(statsData);
                }

                // 2. Aktív utak lekérése a Carouselhez a /api/trips végpontról
                const tripsData = await request('/trips');

                if (tripsData && tripsData.length > 0) {
                    // Csak a LIVE utakat vesszük, max 3-at
                    const activeTrips = tripsData.filter(t => t.isLive).slice(0, 3);

                    // Mivel a TripDTO-ban csak driverID van, le kell kérnünk a sofőr adatait is
                    const tripsWithDriverInfo = await Promise.all(activeTrips.map(async (trip) => {
                        try {
                            const driverData = await request(`/users/${trip.driverID}`);
                            return { ...trip, driver: driverData };
                        } catch (e) {
                            return { ...trip, driver: { displayName: "Ismeretlen", pfp: null } };
                        }
                    }));

                    setFeaturedTrips(tripsWithDriverInfo);
                }

            } catch (error) {
                console.error("Hiba az adatok betöltésekor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const handleSearchChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Átirányítás a térképre, átadva a keresési paramétereket
        navigate('/map', { state: { searchParams } });
    };

    return (
        <>
            <Navbar />

            <div className="home-page-content-container py-5">

                {/* --- 1. CÍMSOR --- */}
                <header className="header-section mb-5 px-3">
                    <h1>Spórolj az utazáson</h1>
                    <p>Utazz autóban, spórolj és védd a környezetet!</p>
                </header>

                {/* --- 2. FŐ SZEKCIÓ (Keresés + Sofőr Slide) --- */}
                <div className="row g-4 mb-5 mx-0 px-3">

                    {/* BAL OLDAL: KERESŐ */}
                    <div className="col-lg-6 col-md-12">
                        <div className="search-box p-4 shadow-lg h-100">
                            <form onSubmit={handleSearchSubmit}>
                                {/* Honnan */}
                                <div className="input-group mb-3 custom-input-group">
                                    <span className="input-label">Honnan?</span>
                                    <input
                                        type="text"
                                        name="from"
                                        className="form-control"
                                        placeholder="Indulás helye"
                                        value={searchParams.from}
                                        onChange={handleSearchChange}
                                    />
                                </div>

                                {/* Hová */}
                                <div className="input-group mb-3 custom-input-group">
                                    <span className="input-label">Hová?</span>
                                    <input
                                        type="text"
                                        name="to"
                                        className="form-control"
                                        placeholder="Érkezés helye"
                                        value={searchParams.to}
                                        onChange={handleSearchChange}
                                    />
                                </div>

                                {/* Dátum / Idő */}
                                <div className="row mb-4">
                                    <div className="col-6">
                                        <div className="custom-input-wrapper">
                                            <input
                                                type="date"
                                                name="date"
                                                className="form-control"
                                                value={searchParams.date}
                                                onChange={handleSearchChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="custom-input-wrapper">
                                            <input
                                                type="time"
                                                name="time"
                                                className="form-control"
                                                value={searchParams.time}
                                                onChange={handleSearchChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Gombok */}
                                <div className="d-flex align-items-center">
                                    <button type="submit" className="btn btn-black search-btn me-3">Keresés</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* JOBB OLDAL: SOFŐR SLIDE (CAROUSEL) */}
                    <div className="col-lg-6 col-md-12">
                        <div id="driverCarousel" className="carousel slide driver-carousel-box shadow-lg" data-bs-ride="carousel">

                            {/* Navigációs nyilak */}
                            <button className="carousel-control-prev" type="button" data-bs-target="#driverCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#driverCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>

                            {/* Slide-ok */}
                            <div className="carousel-inner h-100">
                                {featuredTrips.length === 0 ? (
                                    <div className="carousel-item active h-100">
                                        <div className="driver-slide-content h-100 d-flex flex-column align-items-center justify-content-center">
                                            <h3>Nincs aktív út jelenleg</h3>
                                            <p>Légy te az első, aki hirdet!</p>
                                        </div>
                                    </div>
                                ) : (
                                    featuredTrips.map((trip, index) => (
                                        <div key={trip.tripID} className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`}>
                                            <div className="driver-slide-content h-100 d-flex flex-column align-items-center justify-content-center">
                                                <div className="badge-driver mb-2">Aktív út</div>
                                                <img
                                                    src={trip.driver.pfp || "/images/avatar-placeholder.png"}
                                                    className="driver-avatar rounded-circle mb-3"
                                                    alt="Avatar"
                                                />
                                                <h3 className="driver-name">{trip.driver.displayName || trip.driver.userName}</h3>
                                                <p className="driver-route">
                                                    Indulás: {new Date(trip.departureTime).toLocaleDateString()} {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                                {trip.tripMessage && <p className="small fst-italic">"{trip.tripMessage}"</p>}
                                                <div className="driver-rating text-warning">
                                                    Szabad helyek: {trip.remainingSeats}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- STATISZTIKA --- */}
                <h4 className="px-3 mb-3 text-white">Statisztika</h4>
                <div className="row g-4 px-3 mb-5">
                    <div className="col-md-4">
                        <div className="card-custom">
                            <img src="/images/car-ride-people.jpg" alt="Utasok" />
                            <div className="card-body-custom">
                                <p className="mb-0 text-muted">Összes felhasználó</p>
                                <h5>{stats.totalPassengers}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-custom">
                            <img src="/images/driving.jpg" alt="Sofőrök" />
                            <div className="card-body-custom">
                                <p className="mb-0 text-muted">Sofőrök száma</p>
                                <h5>{stats.totalDrivers}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-custom">
                            <img src="/images/available-driver.jpg" alt="Elérhető" />
                            <div className="card-body-custom">
                                <p className="mb-0 text-muted">Aktív utak</p>
                                <h5>{stats.activeTrips}</h5>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. VÉLEMÉNYEK --- */}
                <h4 className="px-3 mb-3 text-white">Legutóbbi Vélemények</h4>
                <div className="row g-4 px-3">
                    {stats.latestRatings.length === 0 ? (
                        <p className="text-white ms-3">Még nem érkeztek vélemények.</p>
                    ) : (
                        stats.latestRatings.map((rating, idx) => (
                            <div key={idx} className="col-md-4">
                                <div className="card-review p-4 h-100">
                                    {/* A csillag ikonok (i class='fas fa-star') maradtak, mert azok FontAwesome ikonok, nem emojik */}
                                    <div className="mb-2 text-warning">
                                        {[...Array(rating.score)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                                    </div>
                                    <h5 className="fst-italic">"{rating.comment}"</h5>
                                    <div className="d-flex align-items-center mt-auto pt-3">
                                        <img
                                            src={rating.raterPfp || "/images/avatar-placeholder.png"}
                                            className="rounded-circle me-2"
                                            width="40"
                                            height="40"
                                            style={{objectFit: "cover"}}
                                            alt="User"
                                        />
                                        <small className="fw-bold">{rating.raterName}</small>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    );
}