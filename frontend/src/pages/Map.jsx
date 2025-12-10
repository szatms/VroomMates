import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/map.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
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
    const [origin, setOrigin] = useState({ text: "", pos: null });
    const [dest, setDest] = useState({ text: "", pos: null });
    const [comment, setComment] = useState("");

    // Autocomplete states
    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [destSuggestions, setDestSuggestions] = useState([]);

    const [tripDate, setTripDate] = useState("");
    const [tripTime, setTripTime] = useState("");

    const [routePath, setRoutePath] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([47.5316, 21.6273]); // Debrecen
    const [zoom, setZoom] = useState(13);

    // --- AUTOCOMPLETE LOGIKA ---
    // Debounce: Csak akkor keres, ha a felhasználó megállt a gépelésben (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (origin.text && !origin.pos) { // Csak ha még nincs kiválasztva koordináta
                fetchSuggestions(origin.text, setOriginSuggestions);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [origin.text]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (dest.text && !dest.pos) {
                fetchSuggestions(dest.text, setDestSuggestions);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [dest.text]);

    const fetchSuggestions = async (query, setSuggestions) => {
        if (query.length < 3) return; // Túl rövid keresésnél ne induljon el
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Hiba a címkeresésnél:", error);
        }
    };

    const selectSuggestion = (item, type) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const displayName = item.display_name;

        if (type === 'origin') {
            setOrigin({ text: displayName, pos: [lat, lon] });
            setOriginSuggestions([]); // Lista elrejtése
            setMapCenter([lat, lon]); // Térkép odaugrik
        } else {
            setDest({ text: displayName, pos: [lat, lon] });
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
        setOriginSuggestions([]);
        setDestSuggestions([]);
    };

    const handleCreateTrip = async () => {
        // --- 1. VALIDÁCIÓ ---
        if (!origin.pos || !dest.pos) {
            alert("Kérlek válassz kezdő- és végpontot a listából vagy a térképről!");
            return;
        }
        if (!tripDate || !tripTime) {
            alert("Kérlek add meg a dátumot és az időpontot!");
            return;
        }

        // Idő ellenőrzés (ne legyen múltbeli)
        const selectedDateTime = new Date(`${tripDate}T${tripTime}`);
        const now = new Date();
        if (selectedDateTime < now) {
            alert("Nem hozhatsz létre utat a múltban! Kérlek adj meg jövőbeli időpontot.");
            return;
        }

        const ownerID = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!token || !ownerID) {
            alert("Jelentkezz be az úthirdetéshez!");
            return;
        }

        setLoading(true);
        const finalDateTime = `${tripDate}T${tripTime}:00`;

        try {
            // --- 2. MENTÉS A BACKENDRE ---
            await request('/trips', 'POST', {
                driverID: Number(ownerID),
                startLat: origin.pos[0],
                startLon: origin.pos[1],
                endLat: dest.pos[0],
                endLon: dest.pos[1],
                tripMessage: comment,
                departureTime: finalDateTime,
                isLive: true
            });

            alert("Sikeres úthirdetés!");

            // --- 3. ÚTVONAL KIRAJZOLÁSA (Csak vizuális) ---
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${origin.pos[1]},${origin.pos[0]};${dest.pos[1]},${dest.pos[0]}?overview=full&geometries=geojson`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.code === 'Ok') {
                    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    setRoutePath(coords);
                }
            } catch (routeError) {
                console.warn("Útvonal rajzolása sikertelen (de a mentés sikerült):", routeError);
                setRoutePath([origin.pos, dest.pos]); // Fallback: egyenes vonal
            }

        } catch (error) {
            console.error("Hiba az út létrehozásakor:", error);
            alert("❌ Nem sikerült létrehozni az utat. " + (error.message || "Ismeretlen hiba."));
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <>
            <Navbar />
            <div className="map-page-container">
                <div className="travel-sidebar">
                    <h2 className="travel-title text-center mb-4">Új Út Hirdetése</h2>

                    <div className="travel-form d-flex flex-column gap-3">

                        {/* INDULÁS HELYE (Autocomplete) */}
                        <div className="input-wrapper input-container">
                            <label className="small fw-bold text-secondary">
                                Indulás helye <span className="required-star">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control map-input"
                                placeholder="Pl. Debrecen, Vezér utca..."
                                value={origin.text}
                                onChange={(e) => {
                                    setOrigin({ ...origin, text: e.target.value, pos: null }); // pos: null, hogy újra lehessen keresni
                                }}
                            />
                            {/* Találati lista */}
                            {originSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {originSuggestions.map((item, index) => (
                                        <li key={index} className="suggestion-item" onClick={() => selectSuggestion(item, 'origin')}>
                                            {item.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* ÉRKEZÉS HELYE (Autocomplete) */}
                        <div className="input-wrapper input-container">
                            <label className="small fw-bold text-secondary">
                                Érkezés helye <span className="required-star">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control map-input"
                                placeholder="Pl. Budapest..."
                                value={dest.text}
                                onChange={(e) => {
                                    setDest({ ...dest, text: e.target.value, pos: null });
                                }}
                            />
                            {destSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {destSuggestions.map((item, index) => (
                                        <li key={index} className="suggestion-item" onClick={() => selectSuggestion(item, 'dest')}>
                                            {item.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* DÁTUM ÉS IDŐ */}
                        <div className="row">
                            <div className="col-7">
                                <div className="input-wrapper">
                                    <label className="small fw-bold text-secondary">
                                        Dátum <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control map-input"
                                        value={tripDate}
                                        min={today}
                                        onChange={(e) => setTripDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-5">
                                <div className="input-wrapper">
                                    <label className="small fw-bold text-secondary">
                                        Idő <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        className="form-control map-input"
                                        value={tripTime}
                                        onChange={(e) => setTripTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* KOMMENT */}
                        <div className="input-wrapper">
                            <label className="small fw-bold text-secondary">Megjegyzés</label>
                            <textarea
                                className="form-control map-input"
                                placeholder="Pl. Csomagok, kisállat..."
                                rows="2"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <button
                            className="btn btn-primary w-100 mt-3 py-2 fw-bold"
                            onClick={handleCreateTrip}
                            disabled={loading}
                        >
                            {loading ? "Mentés..." : "Útvonal Létrehozása"}
                        </button>

                        {(origin.pos || dest.pos) && (
                            <button className="btn btn-outline-danger w-100 mt-2" onClick={handleReset}>
                                Törlés
                            </button>
                        )}
                    </div>
                </div>

                <div className="map-view-container">
                    <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                        <ChangeView center={mapCenter} zoom={zoom} />
                        <LocationSelector setOrigin={setOrigin} setDest={setDest} originPos={origin.pos} destPos={dest.pos} />
                        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {origin.pos && <Marker position={origin.pos}><Popup>Indulás: {origin.text}</Popup></Marker>}
                        {dest.pos && <Marker position={dest.pos}><Popup>Érkezés: {dest.text}</Popup></Marker>}
                        {routePath.length > 0 && <Polyline positions={routePath} pathOptions={{ color: 'blue', weight: 5 }} />}
                    </MapContainer>
                </div>
            </div>
        </>
    );
}