import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/profile.css';
import { request } from '../utils/api';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="text-white text-center mt-5">Loading...</div>;
    if (!user) return <div className="text-white text-center mt-5">Please log in to view profile.</div>;

    return (
        <>
            <Navbar />

            <div className="profile-page-wrapper">
                {/* --- HEADER --- */}
                <div className="profile-header d-flex align-items-center justify-content-between px-5 py-4">
                    <h1 className="profile-title display-4 fw-bold">PROFILE</h1>

                    <div className="d-flex align-items-center profile-identity-section">
                        <div className="profile-images-container me-4">
                            <img
                                src={user.pfp || "/images/avatar-placeholder.png"}
                                alt="User"
                                className="profile-main-img rounded-circle border border-dark"
                            />
                            {/* Csak akkor mutasd az autót, ha sofőr */}
                            {user.isDriver && (
                                <img
                                    src="/images/car-placeholder.jpg"
                                    alt="Car"
                                    className="profile-car-img rounded-circle border border-dark"
                                />
                            )}
                        </div>

                        <div className="profile-user-info">
                            <h5 className="fw-bold mb-1">{user.displayName}</h5>
                            <p className="mb-0">@{user.userName}</p>
                            <p className="mb-0 fw-bold">{user.email}</p>
                            <span className="badge bg-dark mt-1">{user.role}</span>
                        </div>
                    </div>

                    <button className="btn btn-dark btn-back px-4 py-2" onClick={() => window.history.back()}>
                        BACK
                    </button>
                </div>

                <div className="profile-body row mx-0">
                    <div className="col-lg-6 col-md-12 p-5 left-panel">
                        <div className="stats-list mb-5">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="stat-label">DISTANCE TRAVELED</span>
                                <span className="stat-value">{user.distance || 0} km</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="stat-label">CO2 SAVINGS</span>
                                <span className="stat-value">{user.co2 || 0} kg</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="stat-label">REGISTERED AT</span>
                                <span className="stat-value">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12 p-5 right-panel">
                        <h2 className="text-center mb-4 history-title">HISTORY</h2>
                        <p className="text-center">No recent history available.</p>
                    </div>
                </div>
            </div>
        </>
    );
}