import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
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

    const [origin, setOrigin] = useState({ text: "", pos: null });
    const [dest, setDest] = useState({ text: "", pos: null });
    const [comment, setComment] = useState("");

    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [destSuggestions, setDestSuggestions] = useState([]);

    const [tripDate, setTripDate] = useState("");
    const [tripTime, setTripTime] = useState("");

    // Új state-ek az időszűréshez
    const [searchTimeStart, setSearchTimeStart] = useState("00:00");
    const [searchTimeEnd, setSearchTimeEnd] = useState("23:59");

    const [routePath, setRoutePath] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([47.5316, 21.6273]);
    const [zoom, setZoom] = useState(13);
    const [searchResults, setSearchResults] = useState([]);

    // --- AUTOMATIKUS KITÖLTÉS A HOMEPAGE UTÁN ---
    useEffect(() => {
        if (location.state?.searchParams) {
            const { from, to, date, timeStart, timeEnd } = location.state.searchParams;

            // 1. Mód beállítása
            if (location.state.activeTab === 'search') {
                setMode('passenger');
            }

            // 2. Dátum és Idő beállítása
            if (date) setTripDate(date);
            if (timeStart) setSearchTimeStart(timeStart);
            if (timeEnd) setSearchTimeEnd(timeEnd);

            // 3. Geokódolás a címekhez
            const geocodeAndSet = async (address, isOrigin) => {
                if (!address) return;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}&limit=1`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        const locData = { text: address, pos: [lat, lon] };

                        if (isOrigin) {
                            setOrigin(locData);
                            setMapCenter([lat, lon]);
                        } else {
                            setDest(locData);
                        }
                    } else {
                        if (isOrigin) setOrigin({ text: address, pos: null });
                        else setDest({ text: address, pos: null });
                    }
                } catch (e) {
                    console.error("Geokódolási hiba:", e);
                }
            };

            geocodeAndSet(from, true);
            geocodeAndSet(to, false);
        }
    }, [location.state]);

    // Suggestion Logic
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

    const fetchSuggestions = async (query, setSuggestions) => {
        if (query.length < 3) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&countrycodes=hu`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Hiba:", error);
        }
    };

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
        setComment("");
        setTripDate("");
        setTripTime("");
        setRoutePath([]);
        setSearchResults([]);
    };

    const handleCreateTrip = async () => {
        if (!origin.pos || !dest.pos || !tripDate || !tripTime) {
            alert("Minden mező kitöltése kötelező!");
            return;
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
            alert("Sikeres úthirdetés!");
            handleReset();
        } catch (error) {
            alert("Hiba: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchTrip = async () => {
        if (!origin.pos || !dest.pos) {
            alert("Kérlek válassz a listából pontos címet, hogy meglegyenek a koordináták!");
            return;
        }
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                startLat: origin.pos[0],
                startLon: origin.pos[1],
                endLat: dest.pos[0],
                endLon: dest.pos[1]
            });

            const results = await request(`/trips/search?${queryParams.toString()}`, 'GET');

            // --- JAVÍTOTT IDŐSZŰRÉS LOGIKA ---
            const filteredResults = results.filter(trip => {
                const tripDateObj = new Date(trip.departureTime);

                // 1. Dátum egyezés (Helyi formátumra alakítva: 'YYYY-MM-DD')
                if (tripDate) {
                    // sv-SE formátum ISO-szerű (YYYY-MM-DD), de figyelembe veszi a helyi zónát
                    const tDate = tripDateObj.toLocaleDateString('sv-SE');
                    if (tDate !== tripDate) return false;
                }

                // 2. Időintervallum szűrés
                const tTime = tripDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

                return tTime >= searchTimeStart && tTime <= searchTimeEnd;
            });

            setSearchResults(filteredResults);

            if (filteredResults.length === 0) {
                alert("Sajnos nem találtunk fuvarokat a megadott feltételekkel.");
            }
        } catch (error) {
            console.error("Keresési hiba:", error);
            alert("Hiba történt a keresés során.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinTrip = async (tripId) => {
        const userId = localStorage.getItem('userId');
        if (!userId) return alert("Jelentkezz be a foglaláshoz!");

        try {
            await request('/bookings/join', 'POST', {
                tripID: tripId,
                userID: Number(userId)
            });
            alert("Sikeres jelentkezés!");
        } catch (error) {
            alert("Nem sikerült jelentkezni: " + error.message);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <>
            <Navbar />
            <div className="map-page-container">
                <div className="travel-sidebar">

                    <div className="btn-group w-100 mb-4">
                        <button
                            className={`btn ${mode === 'driver' ? 'btn-warning' : 'btn-outline-light'}`}
                            onClick={() => { setMode('driver'); handleReset(); }}
                        >
                            Sofőr (Hirdetés)
                        </button>
                        <button
                            className={`btn ${mode === 'passenger' ? 'btn-info' : 'btn-outline-light'}`}
                            onClick={() => { setMode('passenger'); handleReset(); }}
                        >
                            Utas (Keresés)
                        </button>
                    </div>

                    <h2 className="travel-title text-center mb-3">
                        {mode === 'driver' ? 'Új Út Hirdetése' : 'Fuvar Keresése'}
                    </h2>

                    <div className="travel-form d-flex flex-column gap-3">
                        <div className="input-wrapper input-container">
                            <label className="small fw-bold">Indulás <span className="required-star">*</span></label>
                            <input type="text" className="form-control map-input" value={origin.text} placeholder="Honnan indulsz?"
                                onChange={(e) => setOrigin({ ...origin, text: e.target.value, pos: null })} />
                            {originSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {originSuggestions.map((item, i) => (
                                        <li key={i} className="suggestion-item" onClick={() => selectSuggestion(item, 'origin')}>{item.display_name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="input-wrapper input-container">
                            <label className="small fw-bold">Érkezés <span className="required-star">*</span></label>
                            <input type="text" className="form-control map-input" value={dest.text} placeholder="Hová utazol?"
                                onChange={(e) => setDest({ ...dest, text: e.target.value, pos: null })} />
                            {destSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {destSuggestions.map((item, i) => (
                                        <li key={i} className="suggestion-item" onClick={() => selectSuggestion(item, 'dest')}>{item.display_name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {mode === 'driver' && (
                            <>
                                <div className="row">
                                    <div className="col-7">
                                        <label className="small fw-bold mb-1">Dátum</label>
                                        <input type="date" className="form-control map-input" min={today} value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
                                    </div>
                                    <div className="col-5">
                                        <label className="small fw-bold mb-1">Idő</label>
                                        <input type="time" className="form-control map-input" value={tripTime} onChange={(e) => setTripTime(e.target.value)} />
                                    </div>
                                </div>
                                <div className="input-wrapper">
                                    <label className="small fw-bold mb-1">Megjegyzés</label>
                                    <textarea className="form-control map-input" rows="2" placeholder="Pl. csomagméret, zene..." value={comment} onChange={(e) => setComment(e.target.value)} />
                                </div>
                                <button className="btn btn-primary w-100 mt-2 py-2 fw-bold" onClick={handleCreateTrip} disabled={loading}>
                                    {loading ? "Mentés..." : "Útvonal Létrehozása"}
                                </button>
                            </>
                        )}

                        {mode === 'passenger' && (
                            <>
                                <div className="input-wrapper">
                                    <label className="small fw-bold mb-1">Dátum</label>
                                    <input type="date" className="form-control map-input" value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
                                </div>

                                <div className="row">
                                    <div className="col-6">
                                        <label className="small fw-bold mb-1">Legkorábban</label>
                                        <input type="time" className="form-control map-input" value={searchTimeStart} onChange={(e) => setSearchTimeStart(e.target.value)} />
                                    </div>
                                    <div className="col-6">
                                        <label className="small fw-bold mb-1">Legkésőbb</label>
                                        <input type="time" className="form-control map-input" value={searchTimeEnd} onChange={(e) => setSearchTimeEnd(e.target.value)} />
                                    </div>
                                </div>

                                <button className="btn btn-info w-100 mt-2 py-2 fw-bold" onClick={handleSearchTrip} disabled={loading}>
                                    {loading ? "Keresés..." : "Fuvarok Listázása"}
                                </button>
                            </>
                        )}

                        {mode === 'passenger' && searchResults.length > 0 && (
                            <div className="search-results mt-3" style={{overflowY: 'auto', maxHeight: '300px'}}>
                                <h5 className="text-center border-bottom pb-2">Találatok:</h5>
                                {searchResults.map(trip => (
                                    <div key={trip.tripID} className="card bg-dark text-white mb-2 border-secondary">
                                        <div className="card-body p-2">
                                            <div className="d-flex justify-content-between">
                                                <strong className="text-warning">{new Date(trip.departureTime).toLocaleDateString()}</strong>
                                                <span className="badge bg-success">{new Date(trip.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <div className="small mt-1">Sofőr: {trip.driverName || "Ismeretlen"}</div>
                                            <div className="small text-truncate">Honnan: {trip.startLocation}</div>
                                            <div className="small text-truncate">Hová: {trip.endLocation}</div>
                                            <div className="small text-end mt-1 text-info fw-bold">{trip.remainingSeats} szabad hely</div>

                                            <button className="btn btn-sm btn-outline-light w-100 mt-2" onClick={() => handleJoinTrip(trip.tripID)}>
                                                Jelentkezés
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(origin.pos || dest.pos) && <button className="btn btn-outline-danger w-100 mt-2" onClick={handleReset}>Törlés</button>}
                    </div>
                </div>

                <div className="map-view-container">
                    <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                        <ChangeView center={mapCenter} zoom={zoom} />
                        <LocationSelector setOrigin={setOrigin} setDest={setDest} originPos={origin.pos} destPos={dest.pos} />
                        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {origin.pos && <Marker position={origin.pos}><Popup>Indulás</Popup></Marker>}
                        {dest.pos && <Marker position={dest.pos}><Popup>Érkezés</Popup></Marker>}

                        {mode === 'passenger' && searchResults.map(trip => (
                            <Marker key={trip.tripID} position={[trip.startLat, trip.startLon]} opacity={0.7}>
                                <Popup>
                                    <b>{trip.driverName}</b><br/>
                                    {new Date(trip.departureTime).toLocaleString()}
                                </Popup>
                            </Marker>
                        ))}

                    </MapContainer>
                </div>
            </div>
        </>
    );
}