import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import ActiveTripPanel from '../components/ActiveTripPanel.jsx';
import '../assets/style/map.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { request } from '../utils/api';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

function LocationSelector({ setOrigin, setDest, originPos, destPos }) {
    useMapEvents({
        click(e) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;
            const text = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

            if (!originPos) {
                setOrigin({ pos: [lat, lon], text: text });
            } else if (!destPos) {
                setDest({ pos: [lat, lon], text: text });
            }
        },
    });
    return null;
}

export default function Map() {
    const location = useLocation();
    const [mode, setMode] = useState('driver');

    // Keresési state-ek
    const [origin, setOrigin] = useState({ text: "", pos: null });
    const [dest, setDest] = useState({ text: "", pos: null });
    const [comment, setComment] = useState("");
    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [destSuggestions, setDestSuggestions] = useState([]);

    // Dátum és idő state-ek
    const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
    const [tripTime, setTripTime] = useState("12:00");
    const [searchTimeStart, setSearchTimeStart] = useState("00:00");
    const [searchTimeEnd, setSearchTimeEnd] = useState("23:59");

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([47.5316, 21.6273]);
    const [zoom, setZoom] = useState(13);

    // --- ÚJ STATE: AKTÍV UTAZÁS ---
    const [activeTripData, setActiveTripData] = useState(null);

    // --- 1. AUTOMATIKUS AKTÍV ÚT DETEKTÁLÁS ---
    useEffect(() => {
        const checkActiveTrip = async () => {
            const userId = localStorage.getItem('userId');
            const role = localStorage.getItem('role');
            if (!userId) return;

            // Ha SOFŐR
            if (role === 'DRIVER') {
                try {
                    const trips = await request(`/trips/driver/${userId}`);
                    const now = new Date();
                    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

                    const currentTrip = trips.find(t => {
                        const isLive = t.live === true || t.isLive === true;
                        const depTime = new Date(t.departureTime);
                        return isLive && (depTime <= twoHoursLater);
                    });

                    if (currentTrip) {
                        const passengers = await request(`/bookings/passengers/${currentTrip.tripID}`);
                        setActiveTripData({
                            ...currentTrip,
                            passengers: passengers || [],
                            isFinished: false
                        });
                        setMode('driver');
                    }
                } catch (e) { console.error(e); }
            }
            // Ha UTAS
            else if (role === 'USER' || role === 'PASSENGER') {
                const savedTripId = localStorage.getItem('passengerActiveTripId');
                if (savedTripId) {
                    try {
                        const trip = await request(`/trips/${savedTripId}`);
                        if (trip && (trip.live || trip.isLive)) {
                            setActiveTripData({
                                ...trip,
                                driverName: trip.driverName || "Sofőr " + trip.driverID,
                                driverPfp: "/images/driver-placeholder-1.jpg",
                                vehicleModel: "Autó",
                                isFinished: false
                            });
                            setMode('passenger');
                        } else {
                            localStorage.removeItem('passengerActiveTripId');
                        }
                    } catch (e) { console.error(e); }
                }
            }
        };
        checkActiveTrip();
    }, []);

    // --- 2. ÚJ FUNKCIÓ: AJÁNLOTT UTAK BETÖLTÉSE (TOP 5) ---
    useEffect(() => {
        if (mode === 'passenger' && !activeTripData) {
            const fetchRecommendedTrips = async () => {
                try {
                    const trips = await request('/trips');
                    if (!trips) return;

                    const now = new Date();

                    // Szűrés: Legyen ÉLŐ (isLive) és (Jövőbeli VAGY Nemrég indult)
                    const activeOrUpcoming = trips.filter(t => {
                        const isLive = t.live === true || t.isLive === true;
                        if (!isLive) return false;

                        const dep = new Date(t.departureTime);
                        const isRecent = dep > new Date(now.getTime() - 24 * 60 * 60 * 1000);

                        return isRecent;
                    });

                    activeOrUpcoming.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

                    if (!origin.text && !dest.text) {
                        setSearchResults(activeOrUpcoming.slice(0, 5));
                    }
                } catch (e) {
                    console.error("Nem sikerült betölteni az ajánlott utakat:", e);
                }
            };
            fetchRecommendedTrips();
        }
    }, [mode, activeTripData]);


    // --- 3. AUTOMATIKUS KITÖLTÉS (HomePage navigáció után) ---
    useEffect(() => {
        if (location.state?.searchParams) {
            const { from, to, date, timeStart, timeEnd } = location.state.searchParams;
            if (location.state.activeTab === 'search') setMode('passenger');
            if (date) setTripDate(date);
            if (timeStart) setSearchTimeStart(timeStart);
            if (timeEnd) setSearchTimeEnd(timeEnd);

            const geocodeAndSet = async (address, isOrigin) => {
                if (!address) return;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}&limit=1`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        const locData = { text: address, pos: [lat, lon] };
                        if (isOrigin) { setOrigin(locData); setMapCenter([lat, lon]); }
                        else setDest(locData);
                    }
                } catch (e) {}
            };
            geocodeAndSet(from, true);
            geocodeAndSet(to, false);
        }
    }, [location.state]);

    const fetchSuggestions = async (query, setSuggestions) => {
        if (query.length < 3) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&countrycodes=hu`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {}
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (origin.text && !origin.pos) fetchSuggestions(origin.text, setOriginSuggestions);
        }, 500);
        return () => clearTimeout(timer);
    }, [origin.text]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (dest.text && !dest.pos) fetchSuggestions(dest.text, setDestSuggestions);
        }, 500);
        return () => clearTimeout(timer);
    }, [dest.text]);

    const selectSuggestion = (item, type) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (type === 'origin') {
            setOrigin({ text: item.display_name, pos: [lat, lon] });
            setOriginSuggestions([]);
            setMapCenter([lat, lon]);
        } else {
            setDest({ text: item.display_name, pos: [lat, lon] });
            setDestSuggestions([]);
        }
    };

    const handleReset = () => {
        setOrigin({ text: "", pos: null });
        setDest({ text: "", pos: null });
        setSearchResults([]); // Ez törli a listát
        setActiveTripData(null);
    };

    const handleCreateTrip = async () => {
        if (!origin.pos || !dest.pos) return alert("Add meg a kezdő és végpontot!");

        const selectedDateTime = new Date(`${tripDate}T${tripTime}:00`);
        const now = new Date();
        if (selectedDateTime < now) {
            return alert("Nem hozhatsz létre utat a múltban! Kérlek ellenőrizd a dátumot és időt.");
        }

        const ownerID = localStorage.getItem('userId');
        setLoading(true);
        try {
            await request('/trips', 'POST', {
                driverID: Number(ownerID),
                startLat: origin.pos[0],
                startLon: origin.pos[1],
                startLocation: origin.text,
                endLat: dest.pos[0],
                endLon: dest.pos[1],
                endLocation: dest.text,
                tripMessage: comment,
                departureTime: `${tripDate}T${tripTime}:00`,
                isLive: true
            });

            alert("Sikeres úthirdetés! Az út megjelent a rendszerben.");
            handleReset();

        } catch (error) {
            alert("Hiba: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchTrip = async () => {
        if (!origin.pos || !dest.pos) return alert("Add meg a címeket!");
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                startLat: origin.pos[0],
                startLon: origin.pos[1],
                endLat: dest.pos[0],
                endLon: dest.pos[1]
            });
            const results = await request(`/trips/search?${queryParams.toString()}`, 'GET');

            const filteredResults = results.filter(trip => {
                if (!(trip.live || trip.isLive)) return false;

                const tripDateObj = new Date(trip.departureTime);
                if (tripDate) {
                    const tDate = tripDateObj.toLocaleDateString('sv-SE');
                    if (tDate !== tripDate) return false;
                }
                const tTime = tripDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                return tTime >= searchTimeStart && tTime <= searchTimeEnd;
            });

            setSearchResults(filteredResults);
            if (filteredResults.length === 0) alert("Nincs találat.");
        } catch (error) {
            alert("Keresési hiba");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinTrip = async (trip) => {
        const userId = localStorage.getItem('userId');
        if (!userId) return alert("Jelentkezz be!");

        try {
            await request('/bookings/join', 'POST', {
                tripID: trip.tripID,
                userID: Number(userId)
            });

            localStorage.setItem('passengerActiveTripId', trip.tripID);

            setActiveTripData({
                ...trip,
                driverName: trip.driverName || "Sofőr",
                driverPfp: "/images/driver-placeholder-1.jpg",
                vehicleModel: "Honda Civic",
                isFinished: false
            });

        } catch (error) {
            alert("Hiba: " + error.message);
        }
    };

    const endActiveTrip = () => {
        setActiveTripData(null);
        setMode('driver');
        localStorage.removeItem('passengerActiveTripId');
        handleReset();
        window.location.reload();
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <>
            <Navbar />
            <div className="map-page-container">
                {activeTripData ? (
                    <ActiveTripPanel mode={mode} tripData={activeTripData} onEndTrip={endActiveTrip} currentUser={localStorage.getItem('userId')}/>
                ) : (
                    <div className="travel-sidebar">
                        <div className="btn-group w-100 mb-4">
                            <button className={`btn ${mode === 'driver' ? 'btn-warning' : 'btn-outline-light'}`} onClick={() => {setMode('driver'); handleReset();}}>Sofőr</button>
                            <button className={`btn ${mode === 'passenger' ? 'btn-info' : 'btn-outline-light'}`} onClick={() => {setMode('passenger'); handleReset();}}>Utas</button>
                        </div>
                        <h2 className="travel-title text-center mb-3">{mode === 'driver' ? 'Új Út' : 'Keresés'}</h2>
                        <div className="travel-form d-flex flex-column gap-3">
                            <div className="input-wrapper input-container">
                                <label className="small fw-bold">Indulás</label>
                                <input type="text" className="form-control map-input" value={origin.text} placeholder="Honnan?" onChange={(e) => setOrigin({ ...origin, text: e.target.value, pos: null })} />
                                {originSuggestions.length > 0 && <ul className="suggestions-list">{originSuggestions.map((item, i) => <li key={i} className="suggestion-item" onClick={() => selectSuggestion(item, 'origin')}>{item.display_name}</li>)}</ul>}
                            </div>
                            <div className="input-wrapper input-container">
                                <label className="small fw-bold">Érkezés</label>
                                <input type="text" className="form-control map-input" value={dest.text} placeholder="Hová?" onChange={(e) => setDest({ ...dest, text: e.target.value, pos: null })} />
                                {destSuggestions.length > 0 && <ul className="suggestions-list">{destSuggestions.map((item, i) => <li key={i} className="suggestion-item" onClick={() => selectSuggestion(item, 'dest')}>{item.display_name}</li>)}</ul>}
                            </div>

                            {mode === 'driver' && (
                                <>
                                    <div className="row">
                                        <div className="col-7"><label className="small fw-bold mb-1">Dátum</label><input type="date" className="form-control map-input" min={today} value={tripDate} onChange={(e) => setTripDate(e.target.value)} /></div>
                                        <div className="col-5"><label className="small fw-bold mb-1">Idő</label><input type="time" className="form-control map-input" value={tripTime} onChange={(e) => setTripTime(e.target.value)} /></div>
                                    </div>
                                    <div className="input-wrapper"><label className="small fw-bold mb-1">Megjegyzés</label><textarea className="form-control map-input" rows="2" value={comment} onChange={(e) => setComment(e.target.value)} /></div>
                                    <button className="btn btn-primary w-100 mt-2 py-2 fw-bold" onClick={handleCreateTrip} disabled={loading}>Indulás!</button>
                                </>
                            )}

                            {mode === 'passenger' && (
                                <>
                                    <div className="input-wrapper"><label className="small fw-bold mb-1">Dátum</label><input type="date" className="form-control map-input" value={tripDate} onChange={(e) => setTripDate(e.target.value)} /></div>
                                    <div className="row">
                                        <div className="col-6"><label className="small fw-bold mb-1">Legkorábban</label><input type="time" className="form-control map-input" value={searchTimeStart} onChange={(e) => setSearchTimeStart(e.target.value)} /></div>
                                        <div className="col-6"><label className="small fw-bold mb-1">Legkésőbb</label><input type="time" className="form-control map-input" value={searchTimeEnd} onChange={(e) => setSearchTimeEnd(e.target.value)} /></div>
                                    </div>
                                    <button className="btn btn-info w-100 mt-2 py-2 fw-bold" onClick={handleSearchTrip} disabled={loading}>Keresés</button>
                                </>
                            )}

                            {/* TALÁLATOK LISTÁJA (Most már alapból mutatja az ajánlottakat is) */}
                            {mode === 'passenger' && searchResults.length > 0 && (
                                <div className="search-results mt-2" style={{overflowY: 'auto', maxHeight: '300px'}}>
                                    {/* Címke a listához, hogy egyértelmű legyen */}
                                    <h6 className="text-center text-white border-bottom pb-2">
                                        {!origin.pos ? "Ajánlott Járatok (Következő 5)" : "Keresési Találatok"}
                                    </h6>

                                    {searchResults.map(trip => (
                                        <div key={trip.tripID} className="card bg-dark text-white mb-2 border-secondary">
                                            <div className="card-body p-2">
                                                <div className="d-flex justify-content-between">
                                                    <strong>{new Date(trip.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</strong>
                                                    <span className="text-warning fw-bold">{trip.remainingSeats} szabad</span>
                                                </div>
                                                <div className="small text-truncate" title={trip.startLocation + ' -> ' + trip.endLocation}>
                                                    {trip.startLocation} &rarr; {trip.endLocation}
                                                </div>
                                                <div className="small text-white-50 mt-1">Sofőr: {trip.driverName || "..."}</div>
                                                <button className="btn btn-sm btn-outline-light w-100 mt-2" onClick={() => handleJoinTrip(trip)}>Jelentkezés</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="map-view-container">
                    <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                        <ChangeView center={mapCenter} zoom={zoom} />
                        {!activeTripData && <LocationSelector setOrigin={setOrigin} setDest={setDest} originPos={origin.pos} destPos={dest.pos} />}
                        <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {origin.pos && <Marker position={origin.pos}><Popup>Start</Popup></Marker>}
                        {dest.pos && <Marker position={dest.pos}><Popup>Cél</Popup></Marker>}

                        {mode === 'passenger' && searchResults.map(trip => (
                             <Marker key={trip.tripID} position={[trip.startLat, trip.startLon]} opacity={0.7}>
                                <Popup><b>{trip.driverName}</b><br/><button className="btn btn-sm btn-primary mt-1" onClick={() => handleJoinTrip(trip)}>Go!</button></Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </>
    );
}