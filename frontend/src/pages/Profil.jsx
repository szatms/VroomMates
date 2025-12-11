import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/profile.css';
import { request } from '../utils/api';
import { useNavigate } from 'react-router-dom';

// A sötétzöld gradiens stílus (mint a Home-on)
const gradientStyle = {
    background: "linear-gradient(135deg, #145b32 0%, #198754 100%)",
    color: "#fff",
    border: "none"
};

const formatLocation = (fullAddress) => {
    if (!fullAddress) return { city: "Ismeretlen", addr: "" };
    const parts = fullAddress.split(',');
    const city = parts[0].trim();
    const addr = parts.length > 1 ? parts.slice(1).join(',').trim() : "";
    return { city, addr };
};

export default function Profile() {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await request("/users/me");
                setUser(userData);

                if (userData && userData.userId) {
                    const trips = await request(`/trips/user/${userData.userId}`);
                    // Csak a lezárt utakat mutatjuk
                    const finishedTrips = trips
                        .filter(t => !t.isLive && !t.live)
                        .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
                    setHistory(finishedTrips);
                }

            } catch (error) {
                console.error("Nem sikerült betölteni a profilt", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 text-white">
            <div className="spinner-border" role="status"><span className="visually-hidden">Betöltés..</span></div>
        </div>
    );

    if (!user) return <div className="text-white text-center mt-5">Hiba: Nincs bejelentkezve.</div>;

    return (
        <>
            <Navbar />

            <div className="profile-page-wrapper">
                {/* --- HEADER --- */}
                <div className="profile-header d-flex align-items-center justify-content-between px-5 py-4 text-white">
                    <div className="d-flex align-items-center gap-4">
                        <img
                            src={user.pfp || "/images/avatar-placeholder.png"}
                            alt="Profil"
                            className="rounded-circle border border-3 border-white shadow"
                            style={{width: '100px', height: '100px', objectFit: 'cover'}}
                        />
                        <div>
                            <h1 className="display-5 fw-bold mb-0 text-uppercase">{user.displayName || user.userName}</h1>
                            <p className="lead mb-0 opacity-75">{user.email}</p>
                        </div>
                    </div>

                    <div className="d-flex gap-3">
                        <button className="btn btn-secondary px-4 py-2 fw-bold shadow-sm" onClick={() => navigate('/settings')}>
                            <i className="bi bi-gear-fill me-2"></i> BEÁLLÍTÁSOK
                        </button>
                        <button className="btn btn-dark px-4 py-2 fw-bold border-white shadow-sm" onClick={() => navigate(-1)}>
                            VISSZA
                        </button>
                    </div>
                </div>

                {/* --- TARTALOM --- */}
                <div className="profile-body row mx-0">

                    {/* BAL OLDAL: STATISZTIKÁK */}
                    <div className="col-lg-4 col-md-12 p-4 text-white border-end border-secondary border-opacity-25">
                        <div className="stats-card p-4 rounded bg-dark bg-opacity-25 shadow-sm">
                            <h4 className="mb-4 border-bottom border-secondary pb-2 text-warning fw-bold">
                                <i className="bi bi-bar-chart-fill me-2"></i>STATISZTIKÁIM
                            </h4>

                            {/* Értékek felerősítve: fs-3, fw-bolder, text-white */}
                            <div className="mb-4">
                                <div className="opacity-75 text-uppercase small ls-1">Megtett út</div>
                                <div className="fw-bolder text-white fs-3">{(user.distance || 0).toFixed(1)} km</div>
                            </div>

                            <div className="mb-4">
                                <div className="opacity-75 text-uppercase small ls-1">CO2 Spórolva</div>
                                <div className="fw-bolder text-white fs-3">{(user.co2 || 0).toFixed(1)} kg</div>
                            </div>

                            <div>
                                <div className="opacity-75 text-uppercase small ls-1">Tagság kezdete</div>
                                {/* Pontos dátum formátum */}
                                <div className="fw-bold text-white fs-5">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('hu-HU') : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JOBB OLDAL: ELŐZMÉNYEK (Gradiens Kártyákkal) */}
                    <div className="col-lg-8 col-md-12 p-4 text-white">
                        <h3 className="mb-4 border-bottom border-secondary pb-2 fw-bold">
                            <i className="bi bi-clock-history me-2"></i>UTAZÁSI ELŐZMÉNYEK
                        </h3>

                        {history.length === 0 ? (
                            <p className="text-center opacity-50 mt-5 fst-italic">Még nincsenek lezárt útjaid.</p>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {history.map(trip => {
                                    const start = formatLocation(trip.startLocation);
                                    const end = formatLocation(trip.endLocation);
                                    const isDriver = trip.driverID === user.userId;

                                    return (
                                        // A kártya megkapja a gradientStyle-t
                                        <div key={trip.tripID} className="card border-0 shadow-lg overflow-hidden rounded-4" style={gradientStyle}>

                                            {/* Fejléc */}
                                            <div className="card-header bg-transparent border-0 p-3 pb-0">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="badge bg-black bg-opacity-25 text-white border border-white border-opacity-25">
                                                        {new Date(trip.departureTime).toLocaleDateString()}
                                                    </span>
                                                    <span className={`badge ${isDriver ? 'bg-warning text-dark' : 'bg-info text-dark'} shadow-sm`}>
                                                        {isDriver ? 'SOFŐR VOLTAM' : 'UTAS VOLTAM'}
                                                    </span>
                                                </div>

                                                <div className="d-flex align-items-center fw-bold fs-5 text-white">
                                                    <span className="me-2">{start.city}</span>
                                                    <i className="bi bi-arrow-right text-white-50 mx-2"></i>
                                                    <span className="ms-2">{end.city}</span>
                                                </div>
                                                <div className="small text-white-50">
                                                    {start.addr} &rarr; {end.addr}
                                                </div>
                                            </div>

                                            {/* Test: Áttetsző fehér doboz a részleteknek */}
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between align-items-center mt-2 p-2 rounded-3" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>

                                                    {/* Statisztika ikonokkal */}
                                                    <div className="d-flex gap-3 text-white small fw-bold">
                                                        <span><i className="bi bi-geo-alt me-1"></i>{(trip.distance || 0).toFixed(1)} km</span>
                                                        {/* A CO2 itt világosabb zöldes árnyalatú, vagy simán fehér, hogy olvasható legyen */}
                                                        <span style={{color: '#a8e6cf'}}><i className="bi bi-tree me-1"></i>-{(trip.co2 || 0).toFixed(2)} kg</span>
                                                    </div>

                                                    {/* Résztvevők */}
                                                    <div className="d-flex align-items-center">
                                                        {/* Sofőr */}
                                                        <div className="position-relative me-3 text-center" title={`Sofőr: ${trip.driverName}`}>
                                                            <img
                                                                src={trip.driverPfp || "/images/avatar-placeholder.png"}
                                                                className="rounded-circle border border-2 border-warning"
                                                                style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                                            />
                                                            <div className="position-absolute bottom-0 end-0 bg-warning rounded-circle px-1" style={{fontSize: '8px', lineHeight:'10px'}}>
                                                                <i className="fas fa-steering-wheel text-dark"></i>
                                                            </div>
                                                        </div>

                                                        {/* Utasok */}
                                                        {trip.passengers && trip.passengers.map(p => (
                                                            <img
                                                                key={p.userID}
                                                                src={p.pfp || "/images/avatar-placeholder.png"}
                                                                className="rounded-circle border border-white ms-n2 shadow-sm"
                                                                style={{width: '30px', height: '30px', objectFit: 'cover', marginLeft: '-10px', zIndex: 1}}
                                                                title={`Utas: ${p.name}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}