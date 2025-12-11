import React, { useState, useEffect } from 'react';
import '../assets/style/map.css';
import { request } from '../utils/api';

// Belső SVG Csillag komponens (Hogy tuti megjelenjen könyvtár nélkül is)
const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill={filled ? "#ffc107" : "rgba(255, 255, 255, 0.2)"} // Sárga vagy halvány
        stroke={filled ? "#ffc107" : "white"}
        strokeWidth="1.5"
        style={{ cursor: 'pointer', margin: '0 4px', transition: 'transform 0.2s' }}
        className="hover-scale"
    >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);

export default function ActiveTripPanel({ mode, tripData, onEndTrip }) {
    const [ratings, setRatings] = useState({});
    const [hover, setHover] = useState({});
    const [ratingSubmitted, setRatingSubmitted] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [distance, setDistance] = useState("...");
    const [bookingStatus, setBookingStatus] = useState(null);

    // Képkezelő segédfüggvény (Ha base64, de nincs header, vagy ha url)
    const getImageSrc = (imgData, placeholder) => {
        if (!imgData) return placeholder;
        // Ha base64 és nincs előtte a prefix, tegyük elé (opcionális, attól függ hogy tárolod)
        if (imgData.length > 100 && !imgData.startsWith('data:image')) {
            return `data:image/jpeg;base64,${imgData}`;
        }
        return imgData;
    };

    const handleImageError = (e, placeholder) => {
        e.target.src = placeholder;
    };

    const getCity = (fullAddress) => fullAddress ? fullAddress.split(',')[0].trim() : "";
    const getDetails = (fullAddress) => {
        if (!fullAddress) return "";
        const parts = fullAddress.split(',');
        if (parts.length < 2) return "";
        return parts.slice(1).join(',').trim();
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(1);
    };

    useEffect(() => {
        if (tripData && tripData.startLat && tripData.endLat) {
            const dist = calculateDistance(tripData.startLat, tripData.startLon, tripData.endLat, tripData.endLon);
            setDistance(dist);
        }

        if (mode === 'passenger') {
            const fetchStatus = async () => {
                const userId = localStorage.getItem('userId');
                if(!userId) return;
                try {
                    const myBookings = await request(`/bookings/user/${userId}`);
                    const currentBooking = myBookings.find(b => b.tripID === tripData.tripID);
                    if (currentBooking) {
                        setBookingStatus(currentBooking.status);
                    }
                } catch (e) { console.error(e); }
            };
            fetchStatus();
        }
    }, [tripData, mode]);

    const handleFinishTrip = async () => {
        if (!window.confirm("Biztosan lezárod az utat?")) return;
        setIsEnding(true);
        try {
            await request(`/trips/${tripData.tripID}/end`, 'POST');
            tripData.isFinished = true;
            const initRatings = {};
            if (tripData.passengers) {
                tripData.passengers.forEach(p => initRatings[p.userID] = 0);
            }
            setRatings(initRatings);
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsEnding(false);
        }
    };

    const handleRateChange = (targetId, score) => setRatings(prev => ({ ...prev, [targetId]: score }));
    const handleHoverChange = (targetId, score) => setHover(prev => ({ ...prev, [targetId]: score }));

    const submitRatings = async () => {
        try {
            if (mode === 'passenger') {
                const score = ratings['driver'] || 0;
                if (score === 0) return alert("Kérlek értékelj!");
                await request('/ratings', 'POST', {
                    tripId: tripData.tripID,
                    ratedUserId: tripData.driverID,
                    score: score,
                    comment: "Passenger rating driver"
                });
            }
            else {
                const promises = Object.entries(ratings).map(([userId, score]) => {
                    if (score > 0) {
                        return request('/ratings', 'POST', {
                            tripId: tripData.tripID,
                            ratedUserId: Number(userId),
                            score: score,
                            comment: "Driver rating passenger"
                        });
                    }
                    return Promise.resolve();
                });
                await Promise.all(promises);
            }
            alert("Köszönjük az értékelést!");
            setRatingSubmitted(true);
            onEndTrip();
        } catch (error) {
            console.error(error);
            setRatingSubmitted(true);
            onEndTrip();
        }
    };

    // --- ÉRTÉKELÉS NÉZET (LEZÁRT ÚT) ---
    if ((tripData.isFinished || tripData.live === false) && !ratingSubmitted) {
        return (
            <div className="travel-sidebar p-4 text-white d-flex flex-column h-100" style={{background: 'linear-gradient(180deg, #4aa84a 0%, #2e662e 100%)'}}>
                <h3 className="text-center mb-4 fw-bold">{mode === 'passenger' ? 'Értékeld a sofőrt' : 'Értékeld az utasokat'}</h3>

                <div className="flex-grow-1 overflow-auto">
                    {/* --- UTAS ÉRTÉKELI A SOFŐRT --- */}
                    {mode === 'passenger' && (
                        <div className="text-center mb-4 p-3 rounded-4" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                            <img
                                src={getImageSrc(tripData.driverPfp, "/images/avatar-placeholder.png")}
                                onError={(e) => handleImageError(e, "/images/avatar-placeholder.png")}
                                className="rounded-circle border border-2 border-white mb-3 shadow"
                                width="100" height="100" style={{objectFit:'cover'}}
                            />
                            <h4 className="mb-1 fw-bold">{tripData.driverName}</h4>
                            <div className="badge bg-warning text-dark mb-3">SOFŐR</div>

                            <div className="d-flex justify-content-center gap-1">
                                {[1,2,3,4,5].map(starVal => (
                                    <StarIcon
                                        key={starVal}
                                        filled={starVal <= (hover['driver'] || ratings['driver'] || 0)}
                                        onClick={() => handleRateChange('driver', starVal)}
                                        onMouseEnter={() => handleHoverChange('driver', starVal)}
                                        onMouseLeave={() => handleHoverChange('driver', ratings['driver'] || 0)}
                                    />
                                ))}
                            </div>
                            <p className="mt-2 text-warning fw-bold">
                                {ratings['driver'] ? `${ratings['driver']} csillag` : "Érintsd meg a csillagokat!"}
                            </p>
                        </div>
                    )}

                    {/* --- SOFŐR ÉRTÉKELI AZ UTASOKAT --- */}
                    {mode === 'driver' && (
                        tripData.passengers && tripData.passengers.length > 0 ? (
                            tripData.passengers.map(p => (
                                <div key={p.userID} className="card border-0 mb-3 text-white shadow-sm" style={{backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '15px'}}>
                                    <div className="card-body text-center p-3">
                                        <div className="d-flex align-items-center justify-content-center mb-3">
                                            <img
                                                src={getImageSrc(p.pfp, "/images/avatar-placeholder.png")}
                                                onError={(e) => handleImageError(e, "/images/avatar-placeholder.png")}
                                                className="rounded-circle me-3 border border-white"
                                                width="50" height="50" style={{objectFit:'cover'}}
                                            />
                                            <div className="text-start">
                                                <h5 className="m-0 fw-bold">{p.name}</h5>
                                                <small className="text-white-50">Utas</small>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-center gap-1">
                                            {[1,2,3,4,5].map(starVal => (
                                                <StarIcon
                                                    key={starVal}
                                                    filled={starVal <= (hover[p.userID] || ratings[p.userID] || 0)}
                                                    onClick={() => handleRateChange(p.userID, starVal)}
                                                    onMouseEnter={() => handleHoverChange(p.userID, starVal)}
                                                    onMouseLeave={() => handleHoverChange(p.userID, ratings[p.userID] || 0)}
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-2 mb-0 text-warning small fw-bold">
                                            {ratings[p.userID] ? `${ratings[p.userID]} csillag` : "Értékeld!"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center mt-5 text-white-50">Nem voltak utasok ezen az úton.</p>
                        )
                    )}
                </div>

                <div className="mt-auto pt-3">
                    <button className="btn btn-light fw-bold w-100 rounded-pill text-success mb-2 shadow py-2" onClick={submitRatings}>
                        KÜLDÉS
                    </button>
                    <button className="btn btn-link text-white w-100 text-decoration-none" onClick={onEndTrip}>Kihagyás</button>
                </div>
            </div>
        );
    }

    const isStarted = new Date() >= new Date(tripData.departureTime);
    const statusText = isStarted ? "Folyamatban" : "Tervezett";

    // --- SOFŐR NÉZET (AKTÍV ÚT) ---
    if (mode === 'driver') {
        return (
            <div className="travel-sidebar text-white bg-dark d-flex flex-column h-100">
                {/* Fejléc */}
                <div className="d-flex align-items-center mb-3 border-bottom border-secondary pb-3 flex-shrink-0">
                    <div className="badge bg-warning text-dark me-2">DRIVER</div>
                    <h4 className="m-0">{statusText}</h4>
                </div>

                {/* Útvonal infó */}
                <div className="mb-3 flex-shrink-0">
                    <small className="text-secondary text-uppercase fw-bold">Úti cél</small>
                    <div className="fs-5 fw-bold text-warning">{getCity(tripData.endLocation)}</div>
                    <div className="small text-white-50" style={{lineHeight: '1.2'}}>{getDetails(tripData.endLocation)}</div>
                    <div className="small text-white-50 mt-1">Távolság: {distance} km</div>
                </div>

                {/* Utaslista */}
                <div className="flex-grow-1 overflow-auto mb-3" style={{minHeight: '100px'}}>
                    <small className="text-secondary text-uppercase fw-bold sticky-top bg-dark pb-1 d-block">Utasok</small>
                    {tripData.passengers && tripData.passengers.length > 0 ? (
                        <ul className="list-group list-group-flush mt-2 rounded">
                            {tripData.passengers.map(p => (
                                <li key={p.userID} className="list-group-item bg-secondary text-white d-flex align-items-center border-dark mb-1">
                                    <img
                                        src={getImageSrc(p.pfp, "/images/avatar-placeholder.png")}
                                        onError={(e) => handleImageError(e, "/images/avatar-placeholder.png")}
                                        className="rounded-circle me-2" width="30" height="30" style={{objectFit:'cover'}}
                                    />
                                    <div>
                                        <div className="fw-bold">{p.name}</div>
                                        <small className="text-warning">Jelentkezett</small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-white-50 mt-2 fst-italic">Még nincs utas.</p>
                    )}
                </div>

                {/* Lezárás gomb */}
                <div className="mt-auto flex-shrink-0 pt-2 border-top border-secondary">
                    <button className="btn btn-danger w-100 fw-bold py-3 shadow text-uppercase" onClick={handleFinishTrip} disabled={isEnding}>
                        {isEnding ? "Lezárás..." : "ÚT LEZÁRÁSA"}
                    </button>
                </div>
            </div>
        );
    }

    // --- UTAS NÉZET (AKTÍV ÚT) ---
    if (mode === 'passenger') {
        let headerTitle = "Jó utat!";
        let headerSubtitle = "Érkezés a célállomásra";
        let headerColor = "#2e662e";

        if (bookingStatus === 'PENDING') {
            headerTitle = "Jelentkezés elküldve";
            headerSubtitle = "Várakozás a sofőrre...";
            headerColor = "#b58900"; // Sárga
        } else if (bookingStatus === 'REJECTED') {
            headerTitle = "Elutasítva";
            headerSubtitle = "Sajnos elutasítottak.";
            headerColor = "#8a1f1f"; // Piros
        }

        return (
            <div className="travel-sidebar text-white d-flex flex-column h-100" style={{backgroundColor: headerColor}}>

                <div className="text-center mb-4 flex-shrink-0 pt-3">
                    <h4 className="fw-bold mb-1">{headerTitle}</h4>
                    <p className="small text-white-50 mb-0">{headerSubtitle}</p>
                    {bookingStatus && <span className="badge bg-white text-dark mt-2">{bookingStatus}</span>}
                </div>

                <div className="flex-grow-1 overflow-auto">
                    <div className="card bg-white text-dark mb-3 shadow border-0 rounded-4 mx-2">
                        <div className="card-body text-center">
                            <small className="text-uppercase text-muted fw-bold mb-2 d-block">Sofőr</small>
                            <img
                                src={getImageSrc(tripData.driverPfp, "/images/avatar-placeholder.png")}
                                onError={(e) => handleImageError(e, "/images/avatar-placeholder.png")}
                                className="rounded-circle mb-2 border border-3 border-success"
                                width="80" height="80"
                                style={{objectFit: 'cover'}}
                            />
                            <h5 className="fw-bold mb-0">{tripData.driverName}</h5>
                            <div className="text-warning small d-flex justify-content-center align-items-center gap-1">
                                <StarIcon filled={true} /> {tripData.driverRating ? tripData.driverRating.toFixed(1) : "Új"}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 text-center">
                        <small className="text-uppercase text-white-50 fw-bold">Jármű</small>
                        <div className="fw-bold fs-5">
                            {tripData.vehicleMake && tripData.vehicleModel
                                ? `${tripData.vehicleMake} ${tripData.vehicleModel}`
                                : "Jármű adatok"}
                        </div>
                        <div className="badge bg-dark mt-1">{tripData.vehiclePlate || "AAA-000"}</div>
                        <div className="mt-2 px-3">
                            <img
                                src={getImageSrc(tripData.vehiclePicture, "/images/car-placeholder.jpg")}
                                onError={(e) => handleImageError(e, "/images/car-placeholder.jpg")}
                                className="rounded-3 shadow-sm img-fluid"
                                style={{maxHeight: '120px', objectFit: 'cover', width: '100%', borderRadius: '10px'}}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex-shrink-0 pt-2">
                    <button className="btn btn-light w-100 fw-bold text-danger py-2" onClick={() => { localStorage.removeItem('passengerActiveTripId'); window.location.reload(); }}>
                        Bezárás / Kilépés
                    </button>
                </div>
            </div>
        );
    }

    return null;
}