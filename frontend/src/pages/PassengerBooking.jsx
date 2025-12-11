import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/booking.css'; // CSS importálása

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dátum formázó segédfüggvény (pl. 2025. 12. 10. 22:57)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Státusz fordítás és színkódolás
    const getStatusBadge = (status) => {
        let className = "status-badge";
        let label = status;

        switch (status) {
            case 'PENDING':
                className += " pending";
                label = "Függőben";
                break;
            case 'ACCEPTED': // Feltételezett státusz
            case 'CONFIRMED':
                className += " accepted";
                label = "Elfogadva";
                break;
            case 'REJECTED': // Feltételezett státusz
            case 'CANCELLED':
                className += " rejected";
                label = "Elutasítva";
                break;
            default:
                className += " unknown";
        }

        return <span className={className}>{label}</span>;
    };

    // Foglalás törlése (Delete funkció a képről)
    const handleDelete = async (bookingId) => {
        if (!window.confirm("Biztosan törölni szeretnéd ezt a foglalást?")) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Sikeres törlés után frissítjük a listát a kliens oldalon
                setBookings(bookings.filter(b => b.bookingid !== bookingId));
                alert("Foglalás sikeresen törölve.");
            } else {
                alert("Hiba történt a törlés során.");
            }
        } catch (err) {
            console.error(err);
            alert("Szerver hiba.");
        }
    };

    useEffect(() => {
        const fetchBookings = async () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId) {
                setError("Nem vagy bejelentkezve.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/bookings/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Nem sikerült betölteni a foglalásokat.');
                }

                const data = await response.json();
                setBookings(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    return (
        <>
            <Navbar />
            <div className="bookings-page-container">
                <div className="bookings-content">
                    <h2 className="page-title">Foglalásaim</h2>

                    {loading && <p className="text-center">Betöltés...</p>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {!loading && !error && bookings.length === 0 && (
                        <div className="text-center text-muted">
                            <p>Még nincsenek foglalásaid.</p>
                            <a href="/map" className="btn btn-primary">Keress egy utat!</a>
                        </div>
                    )}

                    <div className="booking-list">
                        {bookings.map((booking) => (
                            <div key={booking.bookingid} className="booking-card">
                                <div className="booking-header">
                                    <h5 className="trip-id">Utazás #{booking.trip_id}</h5>
                                    {getStatusBadge(booking.status)}
                                </div>

                                <div className="booking-body">
                                    <div className="info-row">
                                        <span className="label">Foglalás ideje:</span>
                                        <span className="value">{formatDate(booking.joined_at)}</span>
                                    </div>

                                    {/* Ha van left_at adat (pl. kiszállt), megjelenítjük */}
                                    {booking.left_at && (
                                        <div className="info-row">
                                            <span className="label">Kiszállás ideje:</span>
                                            <span className="value">{formatDate(booking.left_at)}</span>
                                        </div>
                                    )}

                                    <div className="info-row">
                                        <span className="label">Azonosító:</span>
                                        <span className="value">#{booking.bookingid}</span>
                                    </div>
                                </div>

                                <div className="booking-footer">
                                    <button
                                        className="btn btn-outline-danger btn-sm w-100"
                                        onClick={() => handleDelete(booking.bookingid)}
                                    >
                                        Foglalás Törlése
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyBookings;