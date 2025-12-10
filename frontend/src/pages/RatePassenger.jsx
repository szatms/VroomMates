import React, { useState } from 'react';
import '../assets/style/rating.css';
import Navbar from '../components/Navbar.jsx';

const RatePassenger = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    const submitRating = async () => {
        if (rating === 0) {
            alert("Kérlek válassz legalább 1 csillagot!");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        const passengerId = localStorage.getItem('currentPassengerId') || 1;

        try {
            // A végpontot igazítsd a backendhez (pl. /api/rate/passenger)
            const response = await fetch('/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    targetUserId: passengerId, // Akit értékelünk
                    score: rating,
                    comment: "Utas értékelése"
                })
            });

            if (response.ok) {
                alert("Köszönjük az értékelést!");
                window.location.href = '/'; // Visszairányítás a főoldalra
            } else {
                alert("Hiba történt az értékelés küldésekor.");
            }
        } catch (error) {
            console.error(error);
            alert("Nem sikerült elérni a szervert.");
        } finally {
            setLoading(false);
        }
    };

    return (

       <>
       <Navbar />
        <div className="rating-container">


            <div className="rating-card">
                {/* Profilkép */}
                <div className="profile-wrapper">
                    {/* Itt egy utas placeholder képét érdemes használni */}
                    <img
                        src="/images/passenger-placeholder.jpg"
                        alt="Utas"
                        className="profile-img"
                    />
                </div>

                {/* Utas neve */}
                <p className="driver-name">Utas Neve</p>

                {/* SZÖVEG VÁLTOZÁS */}
                <h2 className="rating-title">Értékeld az utast:</h2>

                {/* Csillagok (Ugyanaz a logika) */}
                <div className="stars-wrapper">
                    {[...Array(5)].map((star, index) => {
                        index += 1;
                        return (
                            <button
                                type="button"
                                key={index}
                                className={index <= (hover || rating) ? "star-btn on" : "star-btn off"}
                                onClick={() => setRating(index)}
                                onMouseEnter={() => setHover(index)}
                                onMouseLeave={() => setHover(rating)}
                            >
                                <span className="star">&#9733;</span>
                            </button>
                        );
                    })}
                </div>

                <p className="rating-value-text">
                    {rating > 0 ? `${rating} csillag` : "Milyen volt az utas?"}
                </p>

                {/* Gomb */}
                <button
                    className="submit-rating-btn"
                    onClick={submitRating}
                    disabled={loading}
                >
                    {loading ? "Küldés..." : "Értékelés Elküldése"}
                </button>
            </div>
        </div>
        </>
    );
};

export default RatePassenger;