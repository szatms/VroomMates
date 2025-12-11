import React, { useState } from 'react';
import '../assets/style/rating.css';
import Navbar from '../components/Navbar.jsx';

const gradientStyle = {
    background: "linear-gradient(135deg, #145b32 0%, #198754 100%)",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const RateDriver = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    const submitRating = async () => {
        if (rating === 0) return alert("Kérlek válassz legalább 1 csillagot!");
        setLoading(true);
        const token = localStorage.getItem('token');
        const driverId = localStorage.getItem('lastDriverId') || 1;

        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tripId: 1, ratedUserId: driverId, score: rating, comment: "User rating" })
            });
            if (response.ok) {
                alert("Köszönjük az értékelést!");
                window.location.href = '/map';
            } else alert("Hiba történt.");
        } catch (error) { alert("Nem sikerült elérni a szervert."); }
        finally { setLoading(false); }
    };

    return (
        <>
        <Navbar />
        <div style={gradientStyle}>
            <div className="card shadow-lg border-0 p-4 text-center" style={{maxWidth: '400px', width: '90%', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)'}}>

                <div className="mx-auto mb-3" style={{width: '100px', height: '100px'}}>
                    <img
                        src="/images/driver-placeholder-1.jpg"
                        alt="Driver"
                        className="rounded-circle border border-3 border-white shadow"
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
                </div>

                <h4 className="fw-bold mb-0 text-white">Bing</h4>
                <div className="badge bg-warning text-dark mb-4 mt-2 px-3 py-1">SOFŐR</div>

                <h5 className="mb-3 opacity-75 text-white">Hogy sikerült az út?</h5>

                <div className="d-flex justify-content-center gap-2 mb-4">
                    {[...Array(5)].map((_, index) => {
                        const starVal = index + 1;
                        return (
                            <i
                                key={starVal}
                                className={`bi bi-star-fill fs-2 cursor-pointer ${starVal <= (hover || rating) ? 'text-warning' : 'text-white-50'}`}
                                style={{transition: 'transform 0.2s', transform: starVal === hover ? 'scale(1.2)' : 'scale(1)', cursor: 'pointer'}}
                                onClick={() => setRating(starVal)}
                                onMouseEnter={() => setHover(starVal)}
                                onMouseLeave={() => setHover(0)} // Hover reset
                            ></i>
                        );
                    })}
                </div>

                <p className="mb-4 fw-bold text-warning" style={{height: '24px'}}>
                    {rating > 0 ? `${rating} csillag` : "Értékeld!"}
                </p>

                <button className="btn btn-light w-100 rounded-pill fw-bold text-success py-2 shadow" onClick={submitRating} disabled={loading}>
                    {loading ? "Küldés..." : "ÉRTÉKELÉS ELKÜLDÉSE"}
                </button>
            </div>
        </div>
        </>
    );
};

export default RateDriver;