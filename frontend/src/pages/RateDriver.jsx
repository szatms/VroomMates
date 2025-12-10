import React, { useState } from 'react';
import '../assets/style/rating.css'; // A CSS importálása
import Navbar from '../components/Navbar.jsx'; // Ha szeretnéd, hogy itt is legyen navbar

const RateDriver = () => {
    // Állapot a kiválasztott csillagoknak (rating) és az épp egérrel érintett csillagnak (hover)
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    // Backend hívás a gomb megnyomásakor
    const submitRating = async () => {
        if (rating === 0) {
            alert("Kérlek válassz legalább 1 csillagot!");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        // Itt feltételezem, hogy az URL-ből vagy localStorage-ból tudod, kit értékelünk.
        // Példa: az utolsó sofőr ID-ja el van mentve, vagy URL paraméterként jön.
        const driverId = localStorage.getItem('lastDriverId') || 1;

        try {
            const response = await fetch('http://localhost:5000/api/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    driverId: driverId,
                    score: rating, // A csillagok száma (1-5)
                    comment: "Felhasználói értékelés" // Opcionális
                })
            });

            if (response.ok) {
                alert("Köszönjük az értékelést!");
                window.location.href = '/map'; // Visszairányítás a térképre
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
                    <img
                        src="/images/driver-placeholder-1.jpg"
                        alt="Bing"
                        className="profile-img"
                    />
                </div>
                <p className="driver-name">Bing</p>

                <h2 className="rating-title">Rate your driver:</h2>

                {/* Csillagok */}
                <div className="stars-wrapper">
                    {[...Array(5)].map((star, index) => {
                        index += 1; // Hogy 1-től induljon a számozás
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
                    {rating > 0 ? `${rating} csillag` : "Értékelj!"}
                </p>

                {/* Küldés Gomb */}
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

export default RateDriver;