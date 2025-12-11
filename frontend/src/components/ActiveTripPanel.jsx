import React, { useState, useEffect } from 'react';
import '../assets/style/map.css';
import { request } from '../utils/api';

export default function ActiveTripPanel({ mode, tripData, onEndTrip }) {
    const [ratings, setRatings] = useState({});
    const [hover, setHover] = useState({});
    const [ratingSubmitted, setRatingSubmitted] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [distance, setDistance] = useState("...");

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
    }, [tripData]);

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

    if ((tripData.isFinished || tripData.live === false) && !ratingSubmitted) {
        return (
            <div className="travel-sidebar p-4 text-white d-flex flex-column h-100" style={{background: 'linear-gradient(180deg, #4aa84a 0%, #2e662e 100%)'}}>
                <h3 className="text-center mb-4">{mode === 'passenger' ? 'Értékeld a sofőrt' : 'Értékeld az utasokat'}</h3>

                <div className="flex-grow-1 overflow-auto">
                    {mode === 'passenger' && (
                        <div className="text-center mb-4">
                            <img src={tripData.driverPfp || "/images/avatar-placeholder.png"} className="rounded-circle border border-white mb-2" width="80" height="80"/>
                            <h5 className="mb-3">{tripData.driverName}</h5>
                            <div className="d-flex justify-content-center gap-2">
                                {[1,2,3,4,5].map(starVal => (
                                    <i
                                        key={starVal}
                                        className={`fas fa-star fa-2x cursor-pointer ${starVal <= (hover['driver'] || ratings['driver'] || 0) ? 'text-warning' : 'text-white-50'}`}
                                        onClick={() => handleRateChange('driver', starVal)}
                                        onMouseEnter={() => handleHoverChange('driver', starVal)}
                                        onMouseLeave={() => handleHoverChange('driver', ratings['driver'] || 0)}
                                    ></i>
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'driver' && (
                        tripData.passengers && tripData.passengers.length > 0 ? (
                            tripData.passengers.map(p => (
                                <div key={p.userID} className="card bg-dark text-white mb-3 border-secondary">
                                    <div className="card-body text-center p-2">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <img src={p.pfp || "/images/avatar-placeholder.png"} className="rounded-circle me-2" width="40" height="40"/>
                                            <h6 className="m-0">{p.name}</h6>
                                        </div>
                                        <div className="d-flex justify-content-center gap-2">
                                            {[1,2,3,4,5].map(starVal => (
                                                <i
                                                    key={starVal}
                                                    className={`fas fa-star fa-lg cursor-pointer ${starVal <= (hover[p.userID] || ratings[p.userID] || 0) ? 'text-warning' : 'text-secondary'}`}
                                                    onClick={() => handleRateChange(p.userID, starVal)}
                                                    onMouseEnter={() => handleHoverChange(p.userID, starVal)}
                                                    onMouseLeave={() => handleHoverChange(p.userID, ratings[p.userID] || 0)}
                                                ></i>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">Nem voltak utasok.</p>
                        )
                    )}
                </div>

                <div className="mt-auto pt-3">
                    <button className="btn btn-light fw-bold w-100 rounded-pill text-success mb-2" onClick={submitRatings}>Küldés</button>
                    <button className="btn btn-link text-white w-100 text-decoration-none" onClick={onEndTrip}>Kihagyás</button>
                </div>
            </div>
        );
    }

    const isStarted = new Date() >= new Date(tripData.departureTime);
    const statusText = isStarted ? "Folyamatban" : "Tervezett";

    if (mode === 'driver') {
        return (
            <div className="travel-sidebar text-white bg-dark d-flex flex-column h-100">
                <div className="d-flex align-items-center mb-3 border-bottom border-secondary pb-3 flex-shrink-0">
                    <div className="badge bg-warning text-dark me-2">DRIVER</div>
                    <h4 className="m-0">{statusText}</h4>
                </div>

                <div className="mb-3 flex-shrink-0">
                    <small className="text-secondary text-uppercase fw-bold">Úti cél</small>
                    <div className="fs-5 fw-bold text-warning">{getCity(tripData.endLocation)}</div>
                    <div className="small text-white-50" style={{lineHeight: '1.2'}}>{getDetails(tripData.endLocation)}</div>
                    <div className="small text-white-50 mt-1">Távolság: {distance} km</div>
                </div>

                <div className="flex-grow-1 overflow-auto mb-3" style={{minHeight: '100px'}}>
                    <small className="text-secondary text-uppercase fw-bold sticky-top bg-dark pb-1 d-block">Utasok</small>
                    {tripData.passengers && tripData.passengers.length > 0 ? (
                        <ul className="list-group list-group-flush mt-2 rounded">
                            {tripData.passengers.map(p => (
                                <li key={p.userID} className="list-group-item bg-secondary text-white d-flex align-items-center border-dark mb-1">
                                    <img src={p.pfp || "/images/avatar-placeholder.png"} className="rounded-circle me-2" width="30" height="30"/>
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

                <div className="mt-auto flex-shrink-0 pt-2 border-top border-secondary">
                    <button className="btn btn-danger w-100 fw-bold py-3 shadow text-uppercase" onClick={handleFinishTrip} disabled={isEnding}>
                        {isEnding ? "Lezárás..." : "ÚT LEZÁRÁSA"}
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'passenger') {
        return (
            <div className="travel-sidebar text-white d-flex flex-column h-100" style={{backgroundColor: '#65B645'}}>
                <div className="text-center mb-4 flex-shrink-0">
                    <h4 className="fw-bold">Jó utat!</h4>
                    <p className="small text-white-50">Érkezés a célállomásra</p>
                </div>

                <div className="flex-grow-1 overflow-auto">
                    <div className="card bg-white text-dark mb-3 shadow border-0 rounded-4 mx-2">
                        <div className="card-body text-center">
                            <small className="text-uppercase text-muted fw-bold mb-2 d-block">Sofőr</small>
                            <img src={tripData.driverPfp || "/images/avatar-placeholder.png"} className="rounded-circle mb-2 border border-3 border-success" width="80" height="80" style={{objectFit: 'cover'}} />
                            <h5 className="fw-bold mb-0">{tripData.driverName}</h5>
                            <div className="text-warning small"><i className="fas fa-star"></i> 5.0</div>
                        </div>
                    </div>

                    <div className="mb-4 text-center">
                        <small className="text-uppercase text-white-50 fw-bold">Jármű</small>
                        <div className="fw-bold fs-5">{tripData.vehicleModel || "Jármű"}</div>
                        <div className="badge bg-dark mt-1">{tripData.vehiclePlate || "RENDSZÁM"}</div>
                        <div className="mt-2 px-3">
                            <img src={tripData.vehiclePic || "/images/car-placeholder.jpg"} className="rounded-3 shadow-sm img-fluid" style={{maxHeight: '120px', objectFit: 'cover'}}/>
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex-shrink-0 pt-2">
                    <button className="btn btn-light w-100 fw-bold text-danger py-2" onClick={() => alert("Kérlek egyeztess a sofőrrel!")}>Lemondás</button>
                </div>
            </div>
        );
    }

    return null;
}