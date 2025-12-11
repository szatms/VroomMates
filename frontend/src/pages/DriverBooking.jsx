import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import { request } from '../utils/api';

const gradientStyle = {
    background: "linear-gradient(135deg, #145b32 0%, #198754 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "15px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.3)"
};

const TripPassengers = ({ tripId }) => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const data = await request(`/bookings/passengers/${tripId}`);
                const visiblePassengers = data.filter(p => p.status === 'PENDING' || p.status === 'JOINED');
                setPassengers(visiblePassengers);
            } catch (error) {
                console.error("Hiba az utasok betöltésekor:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplicants();
    }, [tripId]);

    const handleAction = async (passenger, action) => {
        try {
            await request(`/bookings/${passenger.bookingID}/${action}`, 'POST');

            if (action === 'reject') {
                // Ha elutasítjuk, azonnal kivesszük a listából
                setPassengers(prev => prev.filter(p => p.userID !== passenger.userID));
            } else {
                // Ha elfogadjuk, frissítjük a státuszát JOINED-re
                setPassengers(prev => prev.map(p =>
                    p.userID === passenger.userID ? { ...p, status: 'JOINED' } : p
                ));
            }
        } catch (error) {
            alert("Hiba: " + error.message);
        }
    };

    if (loading) return <div className="text-center p-3 text-white-50">Betöltés...</div>;
    if (passengers.length === 0) return <div className="text-center p-3 text-white-50 fst-italic">Nincsenek megjeleníthető utasok.</div>;

    return (
        <div className="list-group list-group-flush">
            {passengers.map(p => (
                <div key={p.userID} className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-center p-3 bg-transparent border-bottom border-white border-opacity-25">

                    <div className="d-flex align-items-center mb-3 mb-md-0 w-100">
                        <img
                            src={p.pfp || "/images/avatar-placeholder.png"}
                            className="rounded-circle border border-2 border-white me-3 shadow-sm"
                            style={{width: '50px', height: '50px', objectFit:'cover'}}
                        />
                        <div>
                            <div className="fw-bold fs-6 text-white d-flex align-items-center gap-2">
                                {p.name}
                                {p.rating && p.rating > 0 && (
                                    <span className="badge bg-warning text-dark rounded-pill d-flex align-items-center px-2 py-1" style={{fontSize: '0.7rem'}}>
                                        <i className="bi bi-star-fill me-1"></i> {p.rating.toFixed(1)}
                                    </span>
                                )}
                            </div>

                            <div className="small text-white-50 d-flex align-items-center gap-2">
                                <span>{p.email}</span>
                                <span className="text-white-50">•</span>
                                <span className="fw-bold text-white" style={{fontSize: '0.8rem'}}>
                                    <i className="bi bi-geo-alt-fill me-1"></i>
                                    {p.completedTrips || 0} út
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-2 w-100 justify-content-md-end">
                        {p.status === 'PENDING' ? (
                            <>
                                <button
                                    className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-success shadow-sm flex-grow-1 flex-md-grow-0"
                                    onClick={() => handleAction(p, 'accept')}
                                >
                                    <i className="bi bi-check-lg me-1"></i> Elfogad
                                </button>
                                <button
                                    className="btn btn-outline-light btn-sm rounded-pill px-3 fw-bold shadow-sm flex-grow-1 flex-md-grow-0"
                                    onClick={() => handleAction(p, 'reject')}
                                >
                                    <i className="bi bi-x-lg me-1"></i> Elutasít
                                </button>
                            </>
                        ) : (
                            <span className="badge bg-success rounded-pill px-3 py-2 border border-white">
                                <i className="bi bi-check-circle-fill me-1"></i> ELFOGADVA
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const DriverBooking = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDriverTrips = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            try {
                const data = await request(`/trips/driver/${userId}`);
                const active = data.filter(t => t.live || t.isLive).sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
                setTrips(active);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchDriverTrips();
    }, []);

    return (
        <>
            <Navbar />
            <div className="container py-5" style={{minHeight: '90vh'}}>
                <h2 className="text-center mb-5 text-white fw-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    <i className="bi bi-person-check-fill me-2"></i>Jelentkezők Kezelése
                </h2>

                {loading && <div className="text-center text-white"><div className="spinner-border"></div></div>}

                {!loading && trips.length === 0 && (
                    <div className="alert alert-dark text-center opacity-75">
                        Még nincsenek aktív hirdetett útjaid.
                    </div>
                )}

                <div className="row g-4">
                    {trips.map((trip) => (
                        <div key={trip.tripID} className="col-12">
                            <div className="card shadow-lg" style={gradientStyle}>

                                <div className="card-header bg-transparent border-bottom border-white border-opacity-25 p-3">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                        <div className="fw-bold fs-5 text-white mb-2 mb-md-0">
                                            <i className="bi bi-geo-alt-fill text-warning me-2"></i>
                                            {trip.startLocation.split(',')[0]}
                                            <i className="bi bi-arrow-right mx-2 text-white-50"></i>
                                            {trip.endLocation.split(',')[0]}
                                        </div>
                                        <span className="badge bg-black bg-opacity-25 text-white border border-white border-opacity-25 rounded-pill px-3 py-2">
                                            <i className="bi bi-calendar-event me-2"></i>
                                            {new Date(trip.departureTime).toLocaleDateString()} {new Date(trip.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body p-0">
                                    <TripPassengers tripId={trip.tripID} />
                                </div>

                                <div className="card-footer bg-transparent border-top border-white border-opacity-25 text-center p-2">
                                    <small className="text-white-50">Szabad helyek: <span className="fw-bold text-white">{trip.remainingSeats}</span></small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default DriverBooking;