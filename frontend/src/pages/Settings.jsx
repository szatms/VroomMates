import React, { useEffect, useState, useRef } from 'react';
import '../assets/style/settings.css';
import { request } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

// A "szokásos" sötétzöld gradiens
const gradientStyle = {
    background: "linear-gradient(135deg, #145b32 0%, #198754 100%)",
    color: "#fff",
    border: "none"
};

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

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const base64 = await convertToBase64(file);
            const userId = localStorage.getItem('userId');

            const updatedUser = await request(`/users/${userId}`, "PUT", { pfp: base64 });

            setUser(updatedUser);
            localStorage.setItem('userPfp', base64);

            alert("Sikeres feltöltés!");
            window.location.reload();

        } catch (error) {
            console.error("Hiba a képfeltöltéskor:", error);
            alert("Sikertelen feltöltés!");
        }
    };

    const handleDriverStatusChange = async (targetIsDriver) => {
        const newRole = targetIsDriver ? 'DRIVER' : 'PASSENGER';
        setUser(prev => ({ ...prev, isDriver: targetIsDriver, role: newRole }));
        localStorage.setItem('role', newRole);

        const userId = user?.id || localStorage.getItem('userId');
        if (!userId) return;

        try {
            const updatedUser = await request(`/users/${userId}`, "PUT", { isDriver: targetIsDriver, driver: targetIsDriver });
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

    if (loading) return <div className="settings-loading text-white">Betöltés...</div>;

    const userData = user || {};

    return (
        <>
            <Navbar />
            <div className="settings-page">
                {/* A konténerre ráhúzzuk a gradienst */}
                <div className="settings-container shadow-lg" style={gradientStyle}>

                    {/* Header átlátszó háttérrel és fehér szöveggel */}
                    <header className="settings-header bg-transparent border-bottom border-white border-opacity-25">
                        <div className="header-left text-white"><i className="bi bi-gear-fill" style={{ fontSize: '3rem' }}></i></div>
                        <h1 className="header-title text-white">BEÁLLÍTÁSOK</h1>
                        <div className="header-buttons">
                            <button className="btn-custom btn-logout" onClick={handleLogout}>KIJELENTKEZÉS</button>
                            <button className="btn-custom btn-back text-dark bg-light border-0" onClick={() => navigate(-1)}>VISSZA</button>
                        </div>
                    </header>

                    <div className="settings-body">
                        {/* --- BAL OLDAL --- */}
                        <div className="column profile-column bg-transparent border-end border-white border-opacity-10">
                            <h2 className="section-title text-white border-white border-opacity-25">PROFIL</h2>
                            <div className="info-grid">
                                {/* A címkék (label) halványabb fehérek, az értékek (value) vastag fehérek */}
                                <div className="info-row border-white border-opacity-10">
                                    <span className="label text-white-50">NÉV</span>
                                    <span className="value text-white">{userData.displayName || "User"}</span>
                                </div>
                                <div className="info-row border-white border-opacity-10">
                                    <span className="label text-white-50">FELHASZNÁLÓNÉV</span>
                                    <span className="value text-white">{userData.userName || "-"}</span>
                                </div>
                                <div className="info-row border-white border-opacity-10">
                                    <span className="label text-white-50">EMAIL</span>
                                    <span className="value text-white">{userData.email || "-"}</span>
                                </div>

                                <div className="radio-section mt-4 mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="label text-white-50 fw-bold">AKTÍV SOFŐR</span>
                                        <div className="radio-options text-white">
                                            <label className="me-3" style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="activeDriver"
                                                    checked={userData.isDriver === true}
                                                    onChange={() => handleDriverStatusChange(true)}
                                                    className="me-1"
                                                    style={{ accentColor: '#ffc107', cursor: 'pointer' }}
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
                                                    style={{ accentColor: '#ffc107', cursor: 'pointer' }}
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
                                            className="circle-img border border-3 border-white shadow"
                                            alt="Pfp"
                                            onClick={() => fileInputRef.current.click()}
                                            style={{cursor: 'pointer', width: '150px', height: '150px', objectFit: 'cover'}}
                                            title="Kattints a módosításhoz"
                                        />

                                        <div
                                            className="position-absolute bg-warning rounded-circle shadow d-flex justify-content-center align-items-center"
                                            style={{width: '35px', height: '35px', bottom: '5px', right: '10px', cursor: 'pointer'}}
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <i className="bi bi-pencil-fill text-dark" style={{fontSize: '1rem'}}></i>
                                        </div>

                                        <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleFileChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- JOBB OLDAL --- */}
                        <div className="column other-column bg-transparent">
                            <h2 className="section-title text-white border-white border-opacity-25">EGYÉB</h2>
                            <div className="settings-list">
                                <div className="setting-item border-white border-opacity-10">
                                    <span className="label text-white-50">JELSZÓ MÓDOSÍTÁSA</span>
                                    <button className="btn-action text-white border-white hover-bg-white hover-text-dark">MÓDOSÍTÁS</button>
                                </div>

                                <div className="mt-5 footer-area border-top border-white border-opacity-25 pt-3">
                                    <div className="d-flex justify-content-between text-white-50"><span>VERZIÓ</span><span>1.0.0</span></div>
                                    <div className="d-flex justify-content-between mt-3 text-warning fw-bold">
                                        <span>FIÓK TÖRLÉSE</span>
                                        <button className="btn btn-outline-danger btn-sm text-white border-white">TÖRLÉS</button>
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