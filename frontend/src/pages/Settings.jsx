import React, { useEffect, useState } from 'react';
import '../assets/style/settings.css';
import { request } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- 1. Adatok betöltése ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // User betöltése
                const userData = await request("/users/me");
                setUser(userData);
                if (userData.role) localStorage.setItem('role', userData.role);

                // Autó betöltése (ha van ID)
                const currentUserId = userData.id || userData.userId || localStorage.getItem('userId');

                if (currentUserId) {
                    try {
                        const vehicleData = await request(`/vehicles/owner/${currentUserId}`);
                        setVehicle(vehicleData);
                    } catch (e) {
                        setVehicle(null);
                    }
                }
            } catch (error) {
                console.error("Hiba az adatok betöltésekor", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- 2. Státusz váltó logika ---
    const handleDriverStatusChange = async (targetIsDriver) => {
        const newRole = targetIsDriver ? 'DRIVER' : 'PASSENGER';

        setUser(prev => ({
            ...prev,
            isDriver: targetIsDriver,
            role: newRole
        }));
        localStorage.setItem('role', newRole);

        const userId = user?.id || localStorage.getItem('userId');
        if (!userId) return;

        try {
            const updatedUser = await request(`/users/${userId}`, "PUT", {
                isDriver: targetIsDriver,
                driver: targetIsDriver
            });

            // Biztosítjuk, hogy a válasz alapján frissüljön az isDriver
            const finalIsDriver = (updatedUser.driver !== undefined) ? updatedUser.driver : updatedUser.isDriver;
            setUser({ ...updatedUser, isDriver: finalIsDriver });

        } catch (error) {
            console.error("Hiba mentéskor:", error);
            setUser(prev => ({ ...prev, isDriver: !targetIsDriver }));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className="settings-loading">Loading...</div>;

    const userData = user || {};
    // Ha nincs autó adat, üres objektumot használunk
    const carData = vehicle || {};

    return (
        <>
            <Navbar />
            <div className="settings-page">
                <div className="settings-container">
                    <header className="settings-header">
                        <div className="header-left"><i className="bi bi-gear-fill" style={{ fontSize: '3rem' }}></i></div>
                        <h1 className="header-title">SETTINGS</h1>
                        <div className="header-buttons">
                            <button className="btn-custom btn-logout" onClick={handleLogout}>LOG OUT</button>
                            <button className="btn-custom btn-back" onClick={() => navigate(-1)}>BACK</button>
                        </div>
                    </header>

                    <div className="settings-body">
                        {/* --- BAL OLDAL: PROFILE ADATOK --- */}
                        <div className="column profile-column">
                            <h2 className="section-title">PROFIL</h2>
                            <div className="info-grid">
                                <div className="info-row"><span className="label">NÉV</span><span className="value">{userData.displayName || "User"}</span></div>
                                <div className="info-row"><span className="label">FELHASZNÁLÓNÉV</span><span className="value">{userData.userName || "-"}</span></div>
                                <div className="info-row"><span className="label">REGISZTRÁCIÓ DÁTUMA</span><span className="value">{userData.birthDate || "-"}</span></div>

                                {/* --- AUTÓ ADATOK (A JSON alapján) --- */}
                                <div className="info-row">
                                    <span className="label">AUTÓ</span>
                                    <span className="value">
                                        {carData.make ? `${carData.make} ${carData.model}` : (userData.carType || "-")}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="label">ÉVJÁRAT / ÜZEMANYAG</span>
                                    <span className="value">
                                        {carData.year ? `${carData.year}, ${carData.fuel}` : "-"}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="label">RENDSZÁM</span>
                                    <span className="value" style={{textTransform: 'uppercase'}}>
                                        {carData.plate || "-"}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="label">ÜLÉSEK SZÁMA</span>
                                    <span className="value text-end">
                                        {carData.seats || userData.seats || "-"}
                                    </span>
                                </div>

                                {/* --- RÁDIÓ GOMBOK --- */}
                                <div className="radio-section mt-4 mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="label">AKTÍV SOFŐR</span>
                                        <div className="radio-options">
                                            <label className="me-3" style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="activeDriver"
                                                    checked={userData.isDriver === true}
                                                    onChange={() => handleDriverStatusChange(true)}
                                                    className="me-1"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                IGEN
                                            </label>
                                            <label style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="activeDriver"
                                                    checked={userData.isDriver !== true}
                                                    onChange={() => handleDriverStatusChange(false)}
                                                    className="me-1"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                NEM
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-images mt-5 text-center">
                                    <img src={userData.pfp || "/images/avatar-placeholder.png"} className="circle-img me-3" alt="Pfp" />

                                    {/* Csak akkor mutatjuk az autót, ha driver ÉS van autója */}
                                    {userData.isDriver && (
                                        <img
                                            // A JSON-ben "picture" mezőben jön a base64 string
                                            src={carData.picture || "/images/car-placeholder.jpg"}
                                            className="circle-img"
                                            alt="Car"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- JOBB OLDAL --- */}
                        <div className="column other-column">
                            <h2 className="section-title">OTHER</h2>
                            <div className="settings-list">
                                <div className="setting-item"><span className="label">ÉRTESÍTÉSEK</span><button className="btn-toggle on">ON</button></div>
                                <div className="setting-item"><span className="label">JELSZÓ MEGVÁLTOZTATÁSA</span><button className="btn-action">CHANGE</button></div>
                                <div className="setting-item"><span className="label">TÉMA</span><button className="btn-action">DARK</button></div>
                                <div className="mt-5 footer-area">
                                    <div className="d-flex justify-content-between"><span>VERZIÓ</span><span>0.0.1</span></div>
                                    <div className="d-flex justify-content-between mt-3 text-danger fw-bold"><span>FIÓK TÖRLÉSE</span><button className="btn btn-danger btn-sm">DELETE</button></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}