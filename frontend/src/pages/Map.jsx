import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/map.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Ikon javítás
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

// Kattintás figyelő: Frissíti a koordinátát ÉS a szöveget is
function LocationSelector({ setOrigin, setDest, originPos, destPos }) {
    useMapEvents({
        click(e) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;
            const text = `${lat.toFixed(5)}, ${lon.toFixed(5)}`; // Koordináta szövegként

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
    // Összevont state: Text (amit látsz) + Pos (ami a matekhoz kell)
    const [origin, setOrigin] = useState({ text: "", pos: null });
    const [dest, setDest] = useState({ text: "", pos: null });

    const [routePath, setRoutePath] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([47.5316, 21.6273]);
    const [zoom, setZoom] = useState(13);

    // NOMINATIM: Szöveg -> Koordináta átalakító
    const geocode = async (searchText, type) => {
        if (!searchText) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                // Frissítjük a megfelelő state-et a kapott koordinátával
                if (type === 'origin') {
                    setOrigin(prev => ({ ...prev, pos: [lat, lon] }));
                    setMapCenter([lat, lon]); // Odaugrunk
                } else {
                    setDest(prev => ({ ...prev, pos: [lat, lon] }));
                }
            }
        } catch (error) {
            console.error("Nem sikerült megtalálni a címet:", error);
        }
    };

    // Ha kimegy a fókusz a mezőből (blur), vagy Entert nyomsz, keressen rá
    const handleSearch = (e, type) => {
        if (e.key === 'Enter' || e.type === 'blur') {
            geocode(type === 'origin' ? origin.text : dest.text, type);
        }
    };

    const handleReset = () => {
        setOrigin({ text: "", pos: null });
        setDest({ text: "", pos: null });
        setRoutePath([]);
    };

    const handleCreateTrip = async () => {
        if (!origin.pos || !dest.pos) {
            alert("Kérlek adj meg érvényes indulási és érkezési pontot (kattintással vagy kereséssel)!");
            return;
        }

        const userRole = localStorage.getItem('role');
        const token = localStorage.getItem('token');

        if (userRole !== 'DRIVER') {
            alert("Csak sofőrök hirdethetnek meg utat!");
            return;
        }

        setLoading(true);

        // 1. Backend mentés
        try {
            await fetch('http://localhost:5000/api/trip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    startLat: origin.pos[0],
                    startLon: origin.pos[1],
                    destLat: dest.pos[0],
                    destLon: dest.pos[1]
                })
            });
        } catch (error) {
            console.warn("Backend hiba (de a rajzolást folytatjuk):", error);
        }

        // 2. OSRM Rajzolás
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${origin.pos[1]},${origin.pos[0]};${dest.pos[1]},${dest.pos[0]}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok') {
                const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                setRoutePath(coords);
            } else {
                alert("Nem található útvonal.");
            }
        } catch (error) {
            // Fallback: Egyenes vonal
            setRoutePath([origin.pos, dest.pos]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="map-page-container">
                <div className="travel-sidebar">
                    <h2 className="travel-title text-center mb-4">Új Út Hirdetése</h2>

                    <div className="travel-form d-flex flex-column gap-3">
                        <div className="text-center small text-muted mb-2">
                            Írd be a címet és nyomj Entert, VAGY kattints a térképre!
                        </div>

                        {/* ORIGIN INPUT - Most már írható! */}
                        <div className="input-wrapper">
                            <label className="small fw-bold text-secondary">Indulás:</label>
                            <input
                                type="text"
                                className="form-control map-input"
                                placeholder="Pl. Debrecen (vagy kattints)"
                                value={origin.text}
                                // Itt engedjük az írást:
                                onChange={(e) => setOrigin({ ...origin, text: e.target.value })}
                                // Enterre vagy kattintásra máshova keresünk:
                                onKeyDown={(e) => handleSearch(e, 'origin')}
                                onBlur={(e) => handleSearch(e, 'origin')}
                            />
                        </div>

                        {/* DEST INPUT - Most már írható! */}
                        <div className="input-wrapper">
                            <label className="small fw-bold text-secondary">Érkezés:</label>
                            <input
                                type="text"
                                className="form-control map-input"
                                placeholder="Pl. Budapest (vagy kattints)"
                                value={dest.text}
                                onChange={(e) => setDest({ ...dest, text: e.target.value })}
                                onKeyDown={(e) => handleSearch(e, 'dest')}
                                onBlur={(e) => handleSearch(e, 'dest')}
                            />
                        </div>

                        <button
                            className="btn btn-primary w-100 mt-3 py-2 fw-bold"
                            onClick={handleCreateTrip}
                            disabled={loading || !origin.pos || !dest.pos}
                        >
                            {loading ? "Tervezés..." : "Útvonal Létrehozása"}
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

                        <LocationSelector
                            setOrigin={setOrigin}
                            setDest={setDest}
                            originPos={origin.pos}
                            destPos={dest.pos}
                        />

                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {origin.pos && <Marker position={origin.pos}><Popup>Indulás</Popup></Marker>}
                        {dest.pos && <Marker position={dest.pos}><Popup>Érkezés</Popup></Marker>}

                        {routePath.length > 0 && (
                            <Polyline positions={routePath} pathOptions={{ color: 'blue', weight: 5 }} />
                        )}
                    </MapContainer>
                </div>
            </div>
        </>
    );
}