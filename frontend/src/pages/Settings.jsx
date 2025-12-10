import React, { useEffect, useState } from 'react';
import '../assets/style/settings.css';
import { request } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- 1. Adatok betöltése ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await request("/users/me");
                setUser(userData);
                if (userData.role) {
                    localStorage.setItem('role', userData.role);
                }
            } catch (error) {
                console.error("Hiba az adatok betöltésekor", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // --- 2. Státusz váltó logika ---
    const handleDriverStatusChange = async (isDriverValue) => {
        const newRole = isDriverValue ? 'DRIVER' : 'PASSENGER';

        // UI frissítés
        setUser(prev => ({
            ...prev,
            driver: isDriverValue,
            role: newRole
        }));
        localStorage.setItem('role', newRole);

        if (!localStorage.getItem('userId'))     {
            console.error("HIBA: Nincs user ID!");
            return;
        }

        try {
            const updatedUser = await request(`/users/${localStorage.getItem('userId')}`, "PUT", {
                driver: isDriverValue
            });
            setUser(updatedUser);
        } catch (error) {
            console.error("Hiba a mentéskor:", error);
            setUser(prev => ({ ...prev, isDriver: !isDriverValue }));
            localStorage.setItem('role', !isDriverValue ? 'DRIVER' : 'PASSENGER');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('role');
        navigate('/login');
    };

    if (loading) return <div className="settings-loading">Loading...</div>;
    const userData = user || {};

    return (
        <>
            <Navbar />
            <div className="settings-page">
                <div className="settings-container">
                    {/* --- HEADER --- */}
                    <header className="settings-header">
                        <div className="header-left">
                            <i className="bi bi-gear-fill" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h1 className="header-title">SETTINGS</h1>
                        <div className="header-buttons">
                            <button className="btn-custom btn-logout" onClick={handleLogout}>LOG OUT</button>
                            <button className="btn-custom btn-back" onClick={() => navigate(-1)}>BACK</button>
                        </div>
                    </header>

                    <div className="settings-body">
                        {/* --- BAL OLDAL: PROFILE ADATOK --- */}
                        <div className="column profile-column">
                            <h2 className="section-title">PROFILE</h2>

                            <div className="info-grid">
                                <div className="info-row">
                                    <span className="label">NAME</span>
                                    <span className="value">{userData.displayName || "John Doe"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">NICKNAME</span>
                                    <span className="value">{userData.userName || "Gigachad"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">DATE OF BIRTH</span>
                                    <span className="value">{userData.birthDate || "1969.05.13."}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">CAR</span>
                                    <span className="value">{userData.carType || "Honda Civic Type R"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">PASSENGER SEATS</span>
                                    <span className="value text-end">{userData.seats || "4"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">HOME ADDRESS</span>
                                    <span className="value text-end" style={{ maxWidth: '60%' }}>{userData.homeAddress || "1234 Exa City, Example street 1/A"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">WORKPLACE ADDRESS</span>
                                    <span className="value text-end" style={{ maxWidth: '60%' }}>{userData.workAddress || "4028 Debrecen, Kassai road 26."}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">WORK SCHEDULE</span>
                                    <span className="value text-end">{userData.schedule || "M - F, 9 - 5"}</span>
                                </div>

                                {/* --- RÁDIÓ GOMBOK SZEKCIÓ --- */}
                                <div className="radio-section mt-4 mb-4">
                                    {/* Active Driver */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="label">ACTIVE DRIVER</span>
                                        <div className="radio-options">
                                            <label className="me-3" style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="activeDriver"
                                                    checked={!!userData.isDriver}
                                                    onChange={() => handleDriverStatusChange(true)}
                                                    className="me-1"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                YES
                                            </label>

                                            <label style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="activeDriver"
                                                    checked={!userData.isDriver}
                                                    onChange={() => handleDriverStatusChange(false)}
                                                    className="me-1"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                NO
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {/* --- RÁDIÓ GOMBOK VÉGE --- */}

                                <div className="profile-images mt-5 text-center">
                                    <img src={userData.pfp || "/images/avatar-placeholder.png"} className="circle-img me-3" alt="Pfp" />
                                    {userData.isDriver && <img src="/images/car-placeholder.jpg" className="circle-img" alt="Car" />}
                                </div>
                            </div>
                        </div>

                        {/* --- JOBB OLDAL: BEÁLLÍTÁSOK --- */}
                        <div className="column other-column">
                            <h2 className="section-title">OTHER</h2>
                            <div className="settings-list">
                                <div className="setting-item">
                                    <span className="label">NOTIFICATIONS</span>
                                    <button className="btn-toggle on">ON</button>
                                </div>
                                <div className="setting-item">
                                    <span className="label">CHANGE PASSWORD</span>
                                    <button className="btn-action">CHANGE</button>
                                </div>
                                <div className="setting-item">
                                    <span className="label">THEME</span>
                                    <button className="btn-action">DARK</button>
                                </div>
                                <div className="mt-5 footer-area">
                                    <div className="d-flex justify-content-between">
                                        <span>VERSION</span>
                                        <span>0.0.1</span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-3 text-danger fw-bold">
                                        <span>DELETE ACCOUNT</span>
                                        <button className="btn btn-danger btn-sm">DELETE</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}