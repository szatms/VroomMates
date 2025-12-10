import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/profile.css';
import { request } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await request("/users/me");
                setUser(userData);
            } catch (error) {
                console.error("Nem sikerült betölteni a profilt", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 text-white">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Betöltés..</span>
            </div>
        </div>
    );

    if (!user) return (
        <div className="text-white text-center mt-5">
            <h3>Kérem lépjen be a profil megjelenítéséhez</h3>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>Login</button>
        </div>
    );

    return (
        <>
            <Navbar />

            <div className="profile-page-wrapper">
                {/* --- HEADER --- */}
                <div className="profile-header d-flex align-items-center justify-content-between px-5 py-4 text-white">
                    <div>
                        <h1 className="display-4 fw-bold mb-0">PROFILE</h1>
                        <p className="lead mb-0">ÜDVÖZÖLJÜK ÚJRA, {user.displayName || user.userName}!</p>
                    </div>

                    <div className="d-flex gap-3">
                        {/* SETTINGS GOMB - Átvisz a beállításokra */}
                        <button
                            className="btn btn-secondary px-4 py-2 fw-bold"
                            onClick={() => navigate('/settings')}
                        >
                            <i className="bi bi-gear-fill me-2"></i> BEÁLLÍTÁSOK
                        </button>

                        <button
                            className="btn btn-dark px-4 py-2 fw-bold border-white"
                            onClick={() => navigate(-1)}
                        >
                            VISSZA
                        </button>
                    </div>
                </div>

                {/* --- TARTALOM --- */}
                <div className="profile-body row mx-0">
                    <div className="col-lg-6 col-md-12 p-5 text-white">
                        <div className="stats-card p-4 rounded bg-dark bg-opacity-50">
                            <h3 className="mb-4 border-bottom pb-2">STATISZTIKÁIM</h3>
                            <div className="d-flex justify-content-between mb-3 fs-5">
                                <span className="opacity-75">MEGTETT ÚT:</span>
                                <span className="fw-bold text-success">{user.distance || 0} km</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 fs-5">
                                <span className="opacity-75">CO2 SPÓROLVA:</span>
                                <span className="fw-bold text-success">{user.co2 || 0} kg</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 fs-5">
                                <span className="opacity-75">REGISZTRÁCIÓ DÁTUMA:</span>
                                <span className="fw-bold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12 p-5 text-white">
                        <div className="history-card p-4 rounded bg-dark bg-opacity-50 h-100">
                            <h2 className="text-center mb-4 border-bottom pb-2">ELŐZMÉNYEK</h2>
                            <p className="text-center opacity-75 mt-5">Nincs feljegyzett előzmény.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}