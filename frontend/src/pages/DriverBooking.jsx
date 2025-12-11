import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/driverbooking.css';

// --- ALKOMPONENS ---
// Most már vár egy 'rawBookings' propot is, ami a szülőtől jön!
const TripPassengers = ({ tripId, rawBookings = [] }) => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Utasok betöltése (Név + Email miatt kell, mert a rawBookings-ban lehet csak ID van)
    useEffect(() => {
        const fetchPassengers = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:5000/api/bookings/passengers/${tripId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPassengers(data);
                }
            } catch (error) {
                console.error("Hiba:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPassengers();
    }, [tripId]);

    // SEGÉDFÜGGVÉNY: Booking ID keresése
    const findBookingId = (userId) => {
        // Megnézzük a szülőtől kapott nyers listát
        // A backendtől függően a mező neve lehet 'user_id', 'userId', vagy 'passengerId'
        const match = rawBookings.find(b =>
            b.user_id === userId || b.userId === userId || b.passengerId === userId
        );

        // Ha megvan, visszaadjuk a bookingid-t (vagy bookingId-t)
        return match ? (match.bookingid || match.bookingId) : null;
    };

    // 2. Státusz módosítása
    const handleStatusAction = async (passenger, action) => {
        const token = localStorage.getItem('token');

        // ITT A TRÜKK: Megkeressük az ID-t a másik listából
        const bookingId = findBookingId(passenger.userID);

        if (!bookingId) {
            console.error("DEBUG - Keresett UserID:", passenger.userID);
            console.error("DEBUG - Elérhető Raw Bookings:", rawBookings);
            alert("HIBA: Nem található a bookingId ehhez az utashoz! (Nézd meg a konzolt)");
            return;
        }

        try {
            // Most már be tudjuk illeszteni a bookingId-t az URL-be!
            // action: 'accept' vagy 'reject'
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // UI frissítése
                const newStatus = action === 'accept' ? 'JOINED' : 'REJECTED';
                setPassengers(prev => prev.map(p =>
                    p.userID === passenger.userID ? { ...p, status: newStatus } : p
                ));
            } else {
                alert("Sikertelen művelet.");
            }
        } catch (error) {
            console.error(error);
            alert("Szerver hiba.");
        }
    };

    const getStatusBadge = (status) => {
        let className = "status-badge";
        let label = status;
        switch (status) {
            case 'PENDING': className += " pending"; label = "Függőben"; break;
            case 'JOINED':
            case 'ACCEPTED': className += " joined"; label = "Csatlakozott"; break;
            case 'REJECTED': className += " rejected"; label = "Elutasítva"; break;
            case 'LEFT': className += " left"; label = "Kiszállt"; break;
            case 'CANCELLED': className += " cancelled"; label = "Lemondta"; break;
            default: className += " unknown";
        }
        return <span className={className}>{label}</span>;
    };

    if (loading) return <div className="p-2 small">Betöltés...</div>;
    if (passengers.length === 0) return <div className="p-2 small text-muted">Még nincs utas.</div>;

    return (
        <div className="passengers-list">
            {passengers.map(p => (
                <div key={p.userID} className="passenger-row">
                    <div className="passenger-info">
                        <div className="fw-bold">{p.name || `User #${p.userID}`}</div>
                        <div className="small text-muted">{p.email}</div>
                    </div>

                    <div className="passenger-actions">
                        {p.status === 'PENDING' ? (
                            <>
                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => handleStatusAction(p, 'accept')}
                                >
                                    ✔
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleStatusAction(p, 'reject')}
                                >
                                    ✖
                                </button>
                            </>
                        ) : (
                            getStatusBadge(p.status)
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
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    useEffect(() => {
        const fetchDriverTrips = async () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            try {
                // Ez a végpont valószínűleg visszaadja a teljes Trip objektumot,
                // amiben remélhetőleg benne van a 'bookings' lista is!
                const response = await fetch(`http://localhost:5000/api/trips/driver/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTrips(data);
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
                <div className="driver-content">
                    <h2 className="page-title">Hirdetett Útjaim</h2>
                    {loading && <p className="text-center">Betöltés...</p>}

                    <div className="trip-list">
                        {trips.map((trip) => (
                            <div key={trip.tripId} className="trip-card">
                                <div className="trip-header">
                                    <div>
                                        <h5 className="trip-route">{trip.startLocation} &rarr; {trip.destination}</h5>
                                        <small className="trip-date">{formatDate(trip.startTime)}</small>
                                    </div>
                                    <span className="seat-info">{trip.seatsAvailable} hely</span>
                                </div>
                                <hr />
                                <h6 className="passengers-title">Jelentkezők:</h6>

                                {/* ITT A LÉNYEG:
                                    Átadjuk a trip.bookings-t is a gyereknek!
                                    Remélhetőleg ebben benne vannak a booking ID-k.
                                */}
                                <TripPassengers
                                    tripId={trip.tripId}
                                    rawBookings={trip.bookings || []}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DriverBooking;