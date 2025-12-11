import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/driverbooking.css';

const formatLocation = (fullAddress) => {
    if (!fullAddress) return { city: "Ismeretlen", addr: "" };
    const parts = fullAddress.split(',');
    const city = parts[0].trim();
    const addr = parts.length > 1 ? parts.slice(1).join(',').trim() : "";
    return { city, addr };
};

const TripPassengers = ({ tripId }) => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplicants = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`/api/bookings/passengers/${tripId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPassengers(data);
                }
            } catch (error) {
                console.error("Hiba az utasok betöltésekor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [tripId]);

    const handleStatusAction = async (passenger, action) => {
        const token = localStorage.getItem('token');

        if (!passenger.bookingID) {
            alert("Hiba: Nem található foglalási azonosító!");
            return;
        }

        try {
            const response = await fetch(`/api/bookings/${passenger.bookingID}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Helyi frissítés, hogy azonnal látszódjon az eredmény
                const newStatus = action === 'accept' ? 'JOINED' : 'REJECTED';
                setPassengers(prev => prev.map(p =>
                    p.userID === passenger.userID ? { ...p, status: newStatus } : p
                ));
            } else {
                const err = await response.json();
                alert("Hiba: " + (err.message || "Sikertelen művelet."));
            }
        } catch (error) {
            console.error(error);
            alert("Szerver hiba.");
        }
    };

    if (loading) return <div className="p-3 text-center small text-muted"><div className="spinner-border spinner-border-sm me-2"></div>Betöltés...</div>;
    if (passengers.length === 0) return <div className="p-3 text-center small text-muted fst-italic">Még senki nem jelentkezett erre az útra.</div>;

    return (
        <div className="passengers-list mt-2">
            {passengers.map(p => (
                <div key={p.userID} className="passenger-row d-flex justify-content-between align-items-center p-3 border-bottom bg-white rounded-3 mb-2 shadow-sm">

                    {/* --- BAL OLDAL: Profilkép + Név + Email --- */}
                    <div className="d-flex align-items-center">
                        <img
                            src={p.pfp}
                            alt="User"
                            className="rounded-circle border border-2 border-light me-3"
                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                        />
                        <div>
                            <div className="fw-bold text-dark mb-0" style={{fontSize: '1rem'}}>
                                {p.name || `User #${p.userID}`}
                            </div>
                            <div className="text-muted small">
                                {p.email}
                            </div>
                        </div>
                    </div>

                    {/* --- JOBB OLDAL: Gombok vagy Státusz címke --- */}
                    <div className="passenger-actions">
                        {p.status === 'PENDING' ? (
                            <div className="btn-group shadow-sm">
                                <button
                                    className="btn btn-success btn-sm px-3 fw-bold"
                                    onClick={() => handleStatusAction(p, 'accept')}
                                    title="Elfogadás"
                                >
                                    <i className="bi bi-check-lg me-1"></i> Elfogad
                                </button>
                                <button
                                    className="btn btn-outline-danger btn-sm px-3 fw-bold"
                                    onClick={() => handleStatusAction(p, 'reject')}
                                    title="Elutasítás"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        ) : (
                            <span className={`badge rounded-pill px-3 py-2 ${
                                p.status === 'JOINED' ? 'bg-success' :
                                p.status === 'REJECTED' ? 'bg-danger' :
                                p.status === 'CANCELLED' ? 'bg-secondary' : 'bg-warning text-dark'
                            }`}>
                                {p.status === 'JOINED' ? <><i className="bi bi-check-circle-fill me-1"></i> UTAZIK</> :
                                 p.status === 'REJECTED' ? 'ELUTASÍTVA' : p.status}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- FŐ KOMPONENS ---
const DriverBooking = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('hu-HU', {
            month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    useEffect(() => {
        const fetchDriverTrips = async () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId) return;

            try {
                const response = await fetch(`/api/trips/driver/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Rendezés: legközelebbi indulás elől
                    const sorted = data.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
                    setTrips(sorted);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchDriverTrips();
    }, []);

    return (
        <>
            <Navbar />
            <div className="driver-page-container">
                <div className="driver-content container py-4">
                    <h2 className="page-title text-center mb-5 text-white fw-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        <i className="bi bi-card-checklist me-2"></i>Jelentkezők Kezelése
                    </h2>

                    {loading && <div className="text-center text-white"><div className="spinner-border"></div></div>}

                    {!loading && trips.length === 0 && (
                        <div className="alert alert-dark text-center opacity-75">
                            Még nincsenek aktív hirdetett útjaid. <a href="/map" className="text-warning fw-bold">Hirdess egyet most!</a>
                        </div>
                    )}

                    <div className="trip-list d-flex flex-column gap-4">
                        {trips.map((trip) => {
                            const start = formatLocation(trip.startLocation);
                            const end = formatLocation(trip.endLocation);

                            return (
                                <div key={trip.tripID} className="trip-card bg-light rounded-4 shadow-lg overflow-hidden border-0">

                                    {/* --- KÁRTYA FEJLÉC (ÚTVONAL) --- */}
                                    <div className="card-header bg-white p-4 border-bottom">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <span className="badge bg-dark text-warning px-3 py-2 rounded-pill shadow-sm">
                                                <i className="bi bi-calendar-event me-2"></i>
                                                {formatDate(trip.departureTime)}
                                            </span>
                                            <span className="fw-bold text-success small text-uppercase">
                                                <i className="bi bi-people-fill me-1"></i> {trip.remainingSeats} hely szabad
                                            </span>
                                        </div>

                                        <div className="row align-items-center g-2">
                                            {/* INDULÁS */}
                                            <div className="col-5 text-start">
                                                <div className="fw-bolder fs-4 text-dark lh-1">{start.city}</div>
                                                <div className="text-secondary small mt-1 text-truncate">
                                                    <i className="bi bi-geo-alt-fill me-1 text-success"></i>
                                                    {start.addr || "Cím nincs megadva"}
                                                </div>
                                            </div>

                                            {/* NYÍL IKON */}
                                            <div className="col-2 text-center">
                                                <i className="bi bi-arrow-right-circle-fill fs-2 text-success opacity-50"></i>
                                            </div>

                                            {/* ÉRKEZÉS */}
                                            <div className="col-5 text-end">
                                                <div className="fw-bolder fs-4 text-dark lh-1">{end.city}</div>
                                                <div className="text-secondary small mt-1 text-truncate">
                                                    {end.addr || "Cím nincs megadva"}
                                                    <i className="bi bi-geo-alt-fill me-1 text-danger ms-1"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- KÁRTYA TEST (UTASOK) --- */}
                                    <div className="card-body bg-light p-3">
                                        <h6 className="text-uppercase text-muted fw-bold small ms-1 mb-2" style={{ letterSpacing: '1px' }}>
                                            Jelentkezők listája
                                        </h6>
                                        <TripPassengers tripId={trip.tripID} />
                                    </div>

                                    {/* Díszítő csík */}
                                    <div style={{ height: '6px', background: 'linear-gradient(90deg, #198754 0%, #20c997 100%)' }}></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DriverBooking;