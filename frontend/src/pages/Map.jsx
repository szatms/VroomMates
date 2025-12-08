// frontend/src/pages/Map.jsx

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/map.css';

// Leaflet importok
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Ikon hiba javítása
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Segédkomponens: Térkép mozgatása
function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

export default function Map() {
    // Input mezők szövege
    const [originText, setOriginText] = useState("");
    const [destText, setDestText] = useState("");

    // Koordináták
    const [originPos, setOriginPos] = useState(null);
    const [destPos, setDestPos] = useState(null);

    // Útvonal pontok
    const [routePath, setRoutePath] = useState([]);

    // Térkép nézet
    const [mapCenter, setMapCenter] = useState([47.5316, 21.6273]);
    const [zoom, setZoom] = useState(13);

    // 1. Koordináta keresés (Nominatim API)
    const getCoordinates = async (query) => {
        if (!query) return null;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await response.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
            return null;
        } catch (error) {
            console.error("Geocoding hiba:", error);
            return null;
        }
    };

    // Keresés gomb logika
    const handlePlanRoute = async () => {
        if (!originText || !destText) {
            alert("Kérlek add meg az indulási és érkezési helyet!");
            return;
        }

        const startCoords = await getCoordinates(originText);
        const endCoords = await getCoordinates(destText);

        if (startCoords && endCoords) {
            setOriginPos(startCoords);
            setDestPos(endCoords);
            setMapCenter(startCoords);
            setZoom(13);
        } else {
            alert("Nem sikerült megtalálni az egyik címet.");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handlePlanRoute();
    };

    // 2. Útvonal lekérése a Backendről
    useEffect(() => {
        const fetchRoute = async () => {
            if (originPos && destPos) {
                try {
                    const response = await fetch(
                        `http://localhost:8080/api/route?startLat=${originPos[0]}&startLon=${originPos[1]}&endLat=${destPos[0]}&endLon=${destPos[1]}`
                    );

                    if (response.ok) {
                        const coordinates = await response.json();
                        setRoutePath(coordinates);

                        // Opcionális: középre igazítás
                        const midLat = (originPos[0] + destPos[0]) / 2;
                        const midLon = (originPos[1] + destPos[1]) / 2;
                        setMapCenter([midLat, midLon]);
                        setZoom(12);
                    }
                } catch (error) {
                    console.error("Backend hiba:", error);
                }
            }
        };

        fetchRoute();
    }, [originPos, destPos]);

    return (
        <>
            <Navbar />

            <div className="map-page-container">

                {/* --- BAL OLDALI SÁV --- */}
                <div className="travel-sidebar">
                    <h2 className="travel-title text-center mb-4">Travel!</h2>
                    <hr className="sidebar-divider" />

                    <div className="travel-form d-flex flex-column gap-3">

                        {/* Origin */}
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="form-control map-input"
                                placeholder="Origin... (pl. Debrecen)"
                                value={originText}
                                onChange={(e) => setOriginText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        {/* Destination */}
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="form-control map-input"
                                placeholder="Destination... (pl. Budapest)"
                                value={destText}
                                onChange={(e) => setDestText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <div className="input-wrapper">
                            <input type="text" className="form-control map-input" placeholder="When..." />
                        </div>

                        <div className="input-wrapper">
                            <input type="number" className="form-control map-input" placeholder="Group size" />
                        </div>

                        {/* Útvonaltervezés Gomb */}
                        <button
                            className="btn btn-search w-100 mt-2"
                            onClick={handlePlanRoute}
                        >
                            Útvonaltervezés
                        </button>

                        <div className="text-end">
                            <a href="#" className="usual-route-link">Usual route</a>
                        </div>
                    </div>

                    <hr className="sidebar-divider my-4" />

                    <h5 className="mb-3">Available drivers:</h5>

                    {/* Sofőr kártya (teljes tartalommal) */}
                    <div className="driver-offer-card d-flex align-items-center p-2 rounded">
                        <div className="driver-img-container me-3">
                            <img src="/images/driver-placeholder-1.jpg" alt="Bing" className="rounded-circle map-driver-avatar" />
                        </div>
                        <div className="driver-details">
                            <div className="d-flex align-items-center">
                                <span className="driver-name fw-bold me-2">Bing</span>
                                <span className="driver-stars text-warning">★★★★</span>
                            </div>
                            <p className="driver-eta mb-0">
                                {routePath.length > 0 ? "Útvonal megtervezve!" : "At your origin in 52 minutes."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- JOBB OLDALI TÉRKÉP (A HIÁNYZÓ RÉSZ!) --- */}
                <div className="map-view-container">
                    <MapContainer
                        center={mapCenter}
                        zoom={zoom}
                        style={{ height: "100%", width: "100%" }} // Fontos a magasság!
                        scrollWheelZoom={true}
                    >
                        <ChangeView center={mapCenter} zoom={zoom} />

                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {originPos && <Marker position={originPos}><Popup>Indulás</Popup></Marker>}
                        {destPos && <Marker position={destPos}><Popup>Érkezés</Popup></Marker>}

                        {/* Zöld vonal */}
                        {routePath.length > 0 && (
                            <Polyline
                                positions={routePath}
                                pathOptions={{ color: '#6fb055', weight: 6, opacity: 0.8 }}
                            />
                        )}
                    </MapContainer>
                </div>

            </div>
        </>
    );
}