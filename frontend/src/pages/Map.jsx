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

function LocationSelector({ setOriginPos, setDestPos, originPos, destPos }) {
    useMapEvents({
        click(e) {
            // Itt is szűrhetnénk, de a fő logikában tisztább
            if (!originPos) {
                setOriginPos([e.latlng.lat, e.latlng.lng]);
            } else if (!destPos) {
                setDestPos([e.latlng.lat, e.latlng.lng]);
            }
        },
    });
    return null;
}

export default function Map() {
    const [originPos, setOriginPos] = useState(null);
    const [destPos, setDestPos] = useState(null);
    const [routePath, setRoutePath] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([47.5316, 21.6273]);
    const [zoom, setZoom] = useState(13);

    // Reset gomb
    const handleReset = () => {
        setOriginPos(null);
        setDestPos(null);
        setRoutePath([]);
    };

    // --- AZ ÚTVONAL LEKÉRÉSE ÉS KIRAJZOLÁSA ---
    useEffect(() => {
        const fetchRoute = async () => {
            // 1. Csak akkor futunk, ha mindkét pont megvan
            if (originPos && destPos) {

                // 2. SZEREPKÖR ELLENŐRZÉSE
                const userRole = localStorage.getItem('role'); // Loginból elmentett role

                if (userRole !== 'DRIVER') {
                    alert("Csak regisztrált sofőrök generálhatnak útvonalat!");
                    // Töröljük a pontokat, hogy ne maradjanak ott
                    handleReset();
                    return;
                }

                setLoading(true);
                const token = localStorage.getItem('token');

                try {
                    const response = await fetch('http://localhost:5000/api/route', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            startLat: originPos[0],
                            startLon: originPos[1],
                            destLat: destPos[0],
                            destLon: destPos[1]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Backend válasz feldolgozása
                        // Figyelem: A backendtől függ, hol van a koordináta tömb!
                        // Ha OpenRouteService raw data: data.features[0].geometry.coordinates
                        // Ha saját backend tisztított adat: data (tömb) vagy data.coordinates

                        let rawCoordinates = [];
                        if (Array.isArray(data)) rawCoordinates = data;
                        else if (data.coordinates) rawCoordinates = data.coordinates;
                        else if (data.features) rawCoordinates = data.features[0].geometry.coordinates;

                        // 3. KOORDINÁTA FORDÍTÁS ÉS RAJZOLÁS ELŐKÉSZÍTÉSE
                        // [Lon, Lat] -> [Lat, Lon] konverzió a Leafletnek
                        const leafletPath = rawCoordinates.map(coord => [coord[1], coord[0]]);

                        setRoutePath(leafletPath); // Ez indítja a kirajzolást a return-ben

                    } else {
                        console.error("Hiba a backend válaszban");
                    }
                } catch (error) {
                    console.error("Backend hiba:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRoute();
    }, [originPos, destPos]);

    return (
        <>
            <Navbar />
            <div className="map-page-container">
                {/* Bal sáv (rövidítve a példában) */}
                <div className="travel-sidebar">
                    <h2 className="travel-title text-center mb-4">Útvonaltervezés</h2>
                    <div className="text-center mb-3">
                        {loading ? "Számítás folyamatban..." : "Kattints a térképre!"}
                    </div>
                    {(originPos || destPos) && (
                        <button className="btn btn-danger w-100" onClick={handleReset}>
                            Törlés / Újra
                        </button>
                    )}
                </div>

                {/* Jobb oldal - TÉRKÉP */}
                <div className="map-view-container">
                    <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                        <ChangeView center={mapCenter} zoom={zoom} />

                        <LocationSelector
                            setOriginPos={setOriginPos}
                            setDestPos={setDestPos}
                            originPos={originPos}
                            destPos={destPos}
                        />

                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {originPos && <Marker position={originPos}><Popup>Indulás</Popup></Marker>}
                        {destPos && <Marker position={destPos}><Popup>Érkezés</Popup></Marker>}

                        {/* 4. ITT TÖRTÉNIK A KIRAJZOLÁS */}
                        {routePath.length > 0 && (
                            <Polyline
                                positions={routePath}
                                pathOptions={{ color: 'blue', weight: 5, opacity: 0.7 }}
                            />
                        )}
                    </MapContainer>
                </div>
            </div>
        </>
    );
}