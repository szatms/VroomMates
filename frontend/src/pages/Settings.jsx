import React, { useEffect, useState, useRef } from 'react';
import '../assets/style/settings.css';
import { request } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await request("/users/me");
                setUser(userData);
                if (userData.role) localStorage.setItem('role', userData.role);
            } catch (error) {
                console.error("Hiba az adatok betöltésekor", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Kép konvertáló
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
        });
    };

    // Fájl feltöltés
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const base64 = await convertToBase64(file);
            const userId = localStorage.getItem('userId');

            // Backend hívás
            const updatedUser = await request(`/users/${userId}`, "PUT", {
                pfp: base64
            });

            // State és LocalStorage frissítése
            setUser(updatedUser);
            localStorage.setItem('userPfp', base64);

            alert("Sikeres feltöltés!");
            window.location.reload();

        } catch (error) {
            console.error("Hiba a képfeltöltéskor:", error);
            alert("Sikertelen feltöltés! (Ellenőrizd, hogy az adatbázisban a mező LONGTEXT típusú-e)");
        }
    };

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

    return (
        <>
            <Navbar />
            <div className="settings-page">
                <div className="settings-container">
                    <header className="settings-header">
                        <div className="header-left"><i className="bi bi-gear-fill" style={{ fontSize: '3rem' }}></i></div>
                        <h1 className="header-title">BEÁLLÍTÁSOK</h1>
                        <div className="header-buttons">
                            <button className="btn-custom btn-logout" onClick={handleLogout}>KIJELENTKEZÉS</button>
                            <button className="btn-custom btn-back" onClick={() => navigate(-1)}>VISSZA</button>
                        </div>
                    </header>

                    <div className="settings-body">
                        {/* --- BAL OLDAL: PROFILE ADATOK --- */}
                        <div className="column profile-column">
                            <h2 className="section-title">PROFIL</h2>
                            <div className="info-grid">
                                <div className="info-row"><span className="label">NÉV</span><span className="value">{userData.displayName || "User"}</span></div>
                                <div className="info-row"><span className="label">FELHASZNÁLÓNÉV</span><span className="value">{userData.userName || "-"}</span></div>
                                <div className="info-row"><span className="label">EMAIL</span><span className="value">{userData.email || "-"}</span></div>

                                {/* AUTÓ ÉS RENDSZÁM SOROK TÖRÖLVE INNEN */}

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
                                    <div className="position-relative d-inline-block">
                                        <img
                                            src={userData.pfp}
                                            className="circle-img"
                                            alt="Pfp"
                                            onClick={() => fileInputRef.current.click()}
                                            style={{cursor: 'pointer', width: '150px', height: '150px'}}
                                            title="Kattints a módosításhoz"
                                        />

                                        {/* Kis ceruza ikon */}
                                        <div
                                            className="position-absolute bg-white rounded-circle shadow d-flex justify-content-center align-items-center"
                                            style={{width: '35px', height: '35px', bottom: '5px', right: '10px', cursor: 'pointer'}}
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <i className="bi bi-pencil-fill text-dark" style={{fontSize: '1rem'}}></i>
                                        </div>

                                        {/* Rejtett input */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{display: 'none'}}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {/* MÁSODIK KARIKA (Autó kép) TÖRÖLVE */}
                                </div>
                            </div>
                        </div>

                        {/* --- JOBB OLDAL --- */}
                        <div className="column other-column">
                            <h2 className="section-title">EGYÉB</h2>
                            <div className="settings-list">
                                <div className="setting-item"><span className="label">ÉRTESÍTÉSEK</span><button className="btn-toggle on">BE</button></div>
                                <div className="setting-item"><span className="label">JELSZÓ MÓDOSÍTÁSA</span><button className="btn-action">MÓDOSÍTÁS</button></div>
                                <div className="setting-item"><span className="label">TÉMA</span><button className="btn-action">SÖTÉT</button></div>
                                <div className="mt-5 footer-area">
                                    <div className="d-flex justify-content-between"><span>VERZIÓ</span><span>1.0.0</span></div>
                                    <div className="d-flex justify-content-between mt-3 text-danger fw-bold"><span>FIÓK TÖRLÉSE</span><button className="btn btn-danger btn-sm">TÖRLÉS</button></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}