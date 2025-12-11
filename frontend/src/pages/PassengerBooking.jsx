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

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('hu-HU', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    useEffect(() => {
        const fetchBookings = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            try {
                const myBookings = await request(`/bookings/user/${userId}`);
                
                const enrichedBookings = await Promise.all(myBookings.map(async (b) => {
                    try {
                        const trip = await request(`/trips/${b.tripID}`);
                        return { ...b, tripDetails: trip };
                    } catch { return b; }
                }));
                
                setBookings(enrichedBookings.reverse());
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchBookings();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="badge bg-warning text-dark border border-white"><i className="bi bi-hourglass-split me-1"></i>FÜGGŐBEN</span>;
            case 'JOINED': return <span className="badge bg-success border border-white"><i className="bi bi-check-circle-fill me-1"></i>ELFOGADVA</span>;
            case 'REJECTED': return <span className="badge bg-danger border border-white"><i className="bi bi-x-circle me-1"></i>ELUTASÍTVA</span>;
            case 'CANCELLED': return <span className="badge bg-secondary border border-white">LEMONDVA</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm("Biztosan törlöd a jelentkezést?")) return;
        try {
            const userId = localStorage.getItem('userId');
            const booking = bookings.find(b => b.bookingID === bookingId);
            if(booking) {
                await request(`/bookings/leave`, 'POST', { tripID: booking.tripID, userID: Number(userId) });
                window.location.reload();
            }
        } catch (e) { alert("Hiba a törlésnél: " + e.message); }
    };

    return (
        <>
            <Navbar />
            <div className="container py-5" style={{minHeight: '90vh'}}>
                <h2 className="text-center text-white mb-5 fw-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                    <i className="bi bi-ticket-perforated-fill me-2"></i>Foglalásaim
                </h2>

                {loading && <div className="text-center text-white"><div className="spinner-border"></div></div>}

                {!loading && bookings.length === 0 && (
                    <div className="text-center text-white-50 fst-italic">
                        <p>Még nincsenek foglalásaid.</p>
                        <a href="/map" className="btn btn-warning fw-bold text-dark mt-3">Keress egy utat!</a>
                    </div>
                )}

                <div className="row g-4 justify-content-center">
                    {bookings.map((booking) => (
                        <div key={booking.bookingID} className="col-lg-8">
                            <div className="card shadow-lg" style={gradientStyle}>
                                <div className="card-body p-4">
                                    
                                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-white border-opacity-25">
                                        {getStatusBadge(booking.status)}
                                        <small className="opacity-75 text-end">
                                            Jelentkezés: {formatDate(booking.joinedAt)}
                                        </small>
                                    </div>

                                    {booking.tripDetails ? (
                                        <div className="row align-items-center">
                                            <div className="col-md-5 mb-3 mb-md-0">
                                                <div className="fs-5 fw-bold">{booking.tripDetails.startLocation.split(',')[0]}</div>
                                                <i className="bi bi-arrow-down text-white-50 my-1 mx-2"></i>
                                                <div className="fs-5 fw-bold">{booking.tripDetails.endLocation.split(',')[0]}</div>

                                                <div className="mt-3 badge bg-black bg-opacity-25 border border-white border-opacity-25 px-3 py-2">
                                                    <i className="bi bi-calendar-event me-2 text-warning"></i>
                                                    {formatDate(booking.tripDetails.departureTime)}
                                                </div>
                                            </div>

                                            <div className="col-md-4 text-center border-start border-white border-opacity-25 my-3 my-md-0 py-2">
                                                <div className="d-flex flex-column align-items-center">
                                                    <img
                                                        src={booking.tripDetails.driverPfp || "/images/avatar-placeholder.png"}
                                                        className="rounded-circle border border-2 border-white mb-2 shadow-sm"
                                                        style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                                    />
                                                    <div className="fw-bold d-flex align-items-center gap-2">
                                                        {booking.tripDetails.driverName}
                                                        {booking.tripDetails.driverRating && (
                                                            <span className="badge bg-warning text-dark p-1 rounded-circle" style={{fontSize:'0.6rem'}}>
                                                                {booking.tripDetails.driverRating.toFixed(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="text-white-50">Sofőr</small>

                                                    <div className="mt-2 bg-white bg-opacity-10 px-2 py-1 rounded small">
                                                        <i className="bi bi-car-front-fill me-1"></i>
                                                        {booking.tripDetails.vehicleMake} {booking.tripDetails.vehicleModel}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-3 text-end">
                                                {booking.status === 'PENDING' && (
                                                    <button className="btn btn-outline-light btn-sm w-100 fw-bold hover-scale" onClick={() => handleDelete(booking.bookingID)}>
                                                        Visszavonás
                                                    </button>
                                                )}
                                                {booking.status === 'JOINED' && (
                                                    <div className="text-center bg-white bg-opacity-10 p-2 rounded border border-white border-opacity-25">
                                                        <small className="fw-bold">Jó utat!</small>
                                                    </div>
                                                )}
                                                {booking.status === 'REJECTED' && (
                                                    <div className="text-center text-white-50 small">
                                                        Sajnos elutasítva.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-white-50 text-center">Út adatok nem elérhetők.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MyBookings;