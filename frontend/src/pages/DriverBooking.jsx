import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/driverbooking.css'; // Az új, kompatibilis CSS

const driverBooking = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Státusz címke (ugyanaz a logika, mint az utasoknál)
    const getStatusBadge = (status) => {
        let className = "status-badge";
        let label = status;

        switch (status) {
            case 'PENDING': className += " pending"; label = "Függőben"; break;
            case 'ACCEPTED': className += " accepted"; label = "Elfogadva"; break;
            case 'REJECTED': className += " rejected"; label = "Elutasítva"; break;
            default: className += " unknown";
        }
        return <span className={className}>{label}</span>;
    };

    // Dátum formázó
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('hu-HU', {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    // Jelentkezés kezelése (Elfogadás / Elutasítás)
    const handleBookingAction = async (tripId, bookingId, action) => {
        // action lehet: 'ACCEPTED' vagy 'REJECTED'
        const token = localStorage.getItem('token');

        try {
            // Backend végpont (pl. PUT /api/bookings/{id}/status)
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
                method: 'PUT', // Vagy PATCH, backendtől függ
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: action })
            });

            if (response.ok) {
                // UI frissítése újratöltés nélkül
                setTrips(prevTrips => prevTrips.map(trip => {
                    if (trip.tripId === tripId) {
                        return {
                            ...trip,
                            bookings: trip.bookings.map(b =>
                                b.bookingid === bookingId ? { ...b, status: action } : b
                            )
                        };
                    }
                    return trip;
                }));
                alert(`Jelentkezés sikeresen ${action === 'ACCEPTED' ? 'elfogadva' : 'elutasítva'}!`);
            } else {
                alert("Hiba történt a művelet során.");
            }
        } catch (error) {
            console.error(error);
            alert("Szerver hiba.");
        }
    };

    useEffect(() => {
        const fetchDriverTrips = async () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            try {
                // Olyan végpont kell, ami visszaadja a sofőr útjait ÉS benne a bookingokat
                const response = await fetch(`http://localhost:5000/api/trips/driver/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setTrips(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
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

                    {!loading && trips.length === 0 && (
                        <div className="text-center text-muted">
                            <p>Még nem hirdettél meg egy utat sem.</p>
                            <a href="/map" className="btn btn-primary">Hirdess egyet most!</a>
                        </div>
                    )}

                    <div className="trip-list">
                        {trips.map((trip) => (
                            <div key={trip.tripId} className="trip-card">
                                {/* Kártya Fejléc: Útvonal infó */}
                                <div className="trip-header">
                                    <div>
                                        <h5 className="trip-route">{trip.startLocation} &rarr; {trip.destination}</h5>
                                        <small className="trip-date">{formatDate(trip.startTime)}</small>
                                    </div>
                                    <span className="seat-info">{trip.seatsAvailable} szabad hely</span>
                                </div>

                                <hr />

                                {/* Jelentkezők listája */}
                                <h6 className="passengers-title">Jelentkezők ({trip.bookings ? trip.bookings.length : 0}):</h6>

                                <div className="passengers-list">
                                    {trip.bookings && trip.bookings.length > 0 ? (
                                        trip.bookings.map(booking => (
                                            <div key={booking.bookingid} className="passenger-row">
                                                <div className="passenger-info">
                                                    {/* Ha a backend küld nevet, azt írjuk ki, ha nem, akkor ID-t */}
                                                    <span className="fw-bold">{booking.passengerName || `Utas #${booking.user_id}`}</span>
                                                    <span className="small text-muted ms-2">({formatDate(booking.joined_at)})</span>
                                                </div>

                                                <div className="passenger-actions">
                                                    {booking.status === 'PENDING' ? (
                                                        <>
                                                            <button
                                                                className="btn btn-success btn-sm me-2"
                                                                onClick={() => handleBookingAction(trip.tripId, booking.bookingid, 'ACCEPTED')}
                                                            >
                                                                ✔
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleBookingAction(trip.tripId, booking.bookingid, 'REJECTED')}
                                                            >
                                                                ✖
                                                            </button>
                                                        </>
                                                    ) : (
                                                        getStatusBadge(booking.status)
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted small fst-italic">Még nincs jelentkező erre az útra.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default driverBooking;