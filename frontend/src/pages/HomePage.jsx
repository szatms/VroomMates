import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/homepage.css';
import { request } from '../utils/api';

// --- STÍLUS KONSTANS ---
const gradientStyle = {
    background: "linear-gradient(135deg, #145b32 0%, #198754 100%)",
    color: "#fff",
    borderRadius: "12px",
    border: "none"
};

// --- SVG CSILLAG KOMPONENS ---
const StarIcon = ({ filled }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill={filled ? "#ffc107" : "rgba(255, 255, 255, 0.3)"}
        style={{ marginRight: "4px" }}
    >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);

// --- BELSŐ KOMPONENS: Cím kereső (Debounced) ---
const AddressAutocomplete = ({ placeholder, value, onChange, icon }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    const fetchAddresses = async (query) => {
        if (!query || query.length < 3) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&countrycodes=hu`);
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Cím keresési hiba:", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (value && value.length > 2) {
                fetchAddresses(value);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [value]);

    const handleSelect = (address) => {
        onChange(address.display_name);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="mb-3 position-relative" ref={wrapperRef}>
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                    <i className={`${icon} text-success`}></i>
                </span>
                <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete="off"
                />
            </div>
            {showSuggestions && suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, top: "100%" }}>
                    {suggestions.map((item, idx) => (
                        <li
                            key={idx}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelect(item)}
                            style={{cursor: 'pointer', color: '#000', fontSize: '0.9rem'}}
                        >
                            {item.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default function HomePage() {
    const navigate = useNavigate();

    // --- State-ek ---
    const [stats, setStats] = useState({
        totalDrivers: 0,
        totalPassengers: 0,
        activeTrips: 0,
        latestRatings: []
    });
    const [featuredTrips, setFeaturedTrips] = useState([]);

    const [searchParams, setSearchParams] = useState({
        from: "",
        to: "",
        date: new Date().toISOString().split('T')[0],
        timeStart: "00:00",
        timeEnd: "23:59"
    });

    // --- Segédfüggvények ---
    const getCity = (fullAddress) => {
        if (!fullAddress) return "";
        return fullAddress.split(',')[0].trim();
    };

    const getDetails = (fullAddress) => {
        if (!fullAddress) return "";
        const parts = fullAddress.split(',');
        if (parts.length < 2) return "";
        const details = parts.slice(1).join(',').trim();
        if (!details) return "";
        return details.length > 60 ? details.substring(0, 60) + "..." : details;
    };

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const statsData = await request('/stats/home');
                if (statsData) setStats(statsData);

                const tripsData = await request('/trips');
                if (tripsData && tripsData.length > 0) {
                    const now = new Date();
                    const futureTrips = tripsData.filter(t => new Date(t.departureTime) > now);
                    futureTrips.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
                    setFeaturedTrips(futureTrips);
                }
            } catch (error) {
                console.error("Hiba az adatok betöltésekor:", error);
            }
        };
        fetchHomeData();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        navigate('/map', {
            state: {
                searchParams: searchParams,
                activeTab: 'search'
            }
        });
    };

    return (
        <>
            <Navbar />

            <div className="home-page-content-container py-5">

                <header className="header-section mb-5 px-3">
                    <h1>Spórolj az utazáson</h1>
                    <p>Utazz autóban, spórolj és védd a környezetet!</p>
                </header>

                <div className="row g-4 mb-5 mx-0 px-3">

                    {/* --- BAL OLDAL: KERESŐ --- */}
                    <div className="col-lg-6 col-md-12">
                        <div className="search-box p-4 shadow h-100" style={gradientStyle}>
                            <h4 className="mb-4 text-white">
                                <i className="fas fa-search me-2"></i>Hová utazol?
                            </h4>
                            <form onSubmit={handleSearchSubmit}>
                                <AddressAutocomplete
                                    icon="fas fa-map-marker-alt"
                                    placeholder="Indulás (pl. Debrecen, Csapó utca)"
                                    value={searchParams.from}
                                    onChange={(val) => setSearchParams({...searchParams, from: val})}
                                />

                                <AddressAutocomplete
                                    icon="fas fa-map-pin"
                                    placeholder="Érkezés (pl. Budapest)"
                                    value={searchParams.to}
                                    onChange={(val) => setSearchParams({...searchParams, to: val})}
                                />

                                <div className="mb-3">
                                    <label className="small text-white-50 mb-1">Utazás dátuma</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={searchParams.date}
                                        onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                                    />
                                </div>

                                <label className="small text-white-50 mb-1">Keresési idősáv</label>
                                <div className="row mb-4">
                                    <div className="col-6">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0"><small>Tól</small></span>
                                            <input
                                                type="time"
                                                className="form-control border-start-0"
                                                value={searchParams.timeStart}
                                                onChange={(e) => setSearchParams({...searchParams, timeStart: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0"><small>Ig</small></span>
                                            <input
                                                type="time"
                                                className="form-control border-start-0"
                                                value={searchParams.timeEnd}
                                                onChange={(e) => setSearchParams({...searchParams, timeEnd: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm">
                                    Keresés
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- JOBB OLDAL: CAROUSEL --- */}
                    <div className="col-lg-6 col-md-12">
                        <div id="driverCarousel" className="carousel slide shadow h-100" data-bs-ride="carousel" style={gradientStyle}>

                            {featuredTrips.length > 1 && (
                                <>
                                    <button className="carousel-control-prev" type="button" data-bs-target="#driverCarousel" data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Előző</span>
                                    </button>
                                    <button className="carousel-control-next" type="button" data-bs-target="#driverCarousel" data-bs-slide="next">
                                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Következő</span>
                                    </button>
                                </>
                            )}

                            <div className="carousel-inner h-100">
                                {featuredTrips.length === 0 ? (
                                    <div className="carousel-item active h-100">
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4 text-white">
                                            <i className="fas fa-road fa-3x text-white-50 mb-3"></i>
                                            <h4>Nincs aktív út jelenleg</h4>
                                            <p className="text-white-50">Légy te az első, aki hirdet!</p>
                                        </div>
                                    </div>
                                ) : (
                                    featuredTrips.map((trip, index) => (
                                        <div key={trip.tripID || index} className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`}>
                                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4 text-white">

                                                <small className="text-uppercase text-white-50 fw-bold mb-3" style={{letterSpacing: "2px"}}>
                                                    Következő járat
                                                </small>

                                                <div className="mb-1 w-100">
                                                    <h3 className="fw-bold mb-0 text-warning">
                                                        {getCity(trip.startLocation || trip.startPoint)}
                                                    </h3>
                                                    <small className="text-white-50 d-block mx-auto text-truncate" style={{maxWidth: "90%", minHeight: "20px"}}>
                                                        {getDetails(trip.startLocation || trip.startPoint)}
                                                    </small>
                                                </div>

                                                <i className="fas fa-arrow-down text-white my-3"></i>

                                                <div className="mb-4 w-100">
                                                    <h3 className="fw-bold mb-0 text-warning">
                                                        {getCity(trip.endLocation || trip.endPoint)}
                                                    </h3>
                                                    <small className="text-white-50 d-block mx-auto text-truncate" style={{maxWidth: "90%", minHeight: "20px"}}>
                                                        {getDetails(trip.endLocation || trip.endPoint)}
                                                    </small>
                                                </div>

                                                <div className="d-flex justify-content-center align-items-center gap-3 fw-bold">
                                                    <span>
                                                        <i className="far fa-calendar-alt me-2"></i>
                                                        {new Date(trip.departureTime).toLocaleDateString('hu-HU')}
                                                    </span>
                                                    <span>|</span>
                                                    <span>
                                                        <i className="far fa-clock me-2"></i>
                                                        {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>

                                                <div className="mt-4 px-4 py-2 bg-white rounded-pill text-dark shadow-sm">
                                                    <span className="fw-bold text-success">
                                                        <i className="fas fa-chair me-2"></i>
                                                        {trip.remainingSeats} szabad hely
                                                    </span>
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
                       <div className="card shadow h-100" style={gradientStyle}>
                           <div className="card-body p-4 text-center">
                               <i className="fas fa-users fa-2x text-white-50 mb-3"></i>
                               <p className="mb-1 text-white-50 text-uppercase small fw-bold">Összes felhasználó</p>
                               <h2 className="fw-bold text-white">{stats.totalPassengers}</h2>
                           </div>
                       </div>
                   </div>
                   <div className="col-md-4">
                       <div className="card shadow h-100" style={gradientStyle}>
                           <div className="card-body p-4 text-center">
                               <i className="fas fa-car fa-2x text-white-50 mb-3"></i>
                               <p className="mb-1 text-white-50 text-uppercase small fw-bold">Sofőrök száma</p>
                               <h2 className="fw-bold text-white">{stats.totalDrivers}</h2>
                           </div>
                       </div>
                   </div>
                   <div className="col-md-4">
                       <div className="card shadow h-100" style={gradientStyle}>
                           <div className="card-body p-4 text-center">
                               <i className="fas fa-route fa-2x text-white-50 mb-3"></i>
                               <p className="mb-1 text-white-50 text-uppercase small fw-bold">Aktív utak száma</p>
                               <h2 className="fw-bold text-white">{stats.activeTrips}</h2>
                           </div>
                       </div>
                   </div>
               </div>

                {/* --- VÉLEMÉNYEK --- */}
                <h4 className="px-3 mb-3 text-white">Legutóbbi Vélemények</h4>
                <div className="row g-4 px-3">
                    {stats.latestRatings.length === 0 ? (
                        <p className="text-white ms-3">Még nem érkeztek vélemények.</p>
                    ) : (
                        stats.latestRatings.map((rating, idx) => (
                            <div key={idx} className="col-md-4">
                                <div className="card h-100 shadow p-4" style={gradientStyle}>

                                    <div className="mb-3 d-flex">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} filled={i < rating.score} />
                                        ))}
                                    </div>

                                    <h5 className="fst-italic text-white mb-3">"{rating.comment}"</h5>

                                    <div className="d-flex align-items-center mt-auto border-top border-secondary pt-3">
                                        <img
                                            src={rating.raterPfp || "/images/avatar-placeholder.png"}
                                            className="rounded-circle me-3 border border-white"
                                            width="45"
                                            height="45"
                                            style={{objectFit: "cover"}}
                                            alt="User"
                                        />
                                        <div>
                                            <small className="fw-bold text-white d-block">{rating.raterName}</small>
                                            <small className="text-white-50">Utas</small>
                                        </div>
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