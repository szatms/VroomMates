// frontend/src/pages/Profile.jsx

import React from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/profile.css';

export default function Profile() {
    return (
        <>
            <Navbar />

            <div className="profile-page-wrapper">

                {/* --- FELSŐ SÁV (HEADER) --- */}
                <div className="profile-header d-flex align-items-center justify-content-between px-5 py-4">

                    {/* Bal oldal: Cím */}
                    <h1 className="profile-title display-4 fw-bold">PROFILE</h1>

                    {/* Közép: Képek és Adatok */}
                    <div className="d-flex align-items-center profile-identity-section">

                        {/* Képek (Avatar + Autó) */}
                        <div className="profile-images-container me-4">
                            {/* Profilkép */}
                            <img
                                src="/images/avatar-placeholder.png"
                                alt="User"
                                className="profile-main-img rounded-circle border border-dark"
                            />
                            {/* Autó képe (átfedésben) */}
                            <img
                                src="/images/car-placeholder.jpg"
                                alt="Car"
                                className="profile-car-img rounded-circle border border-dark"
                            />
                        </div>

                        {/* Szöveges adatok */}
                        <div className="profile-user-info">
                            <h5 className="fw-bold mb-1">John Doe [Gigachad], 66</h5>
                            <p className="mb-0 fw-bold">MALE</p>
                            <p className="mb-0 text-uppercase">Active Driver</p>
                        </div>
                    </div>

                    {/* Jobb oldal: Back gomb */}
                    <button className="btn btn-dark btn-back px-4 py-2" onClick={() => window.history.back()}>
                        BACK
                    </button>
                </div>

                {/* --- ALSÓ RÉSZ (TARTALOM) --- */}
                <div className="profile-body row mx-0">

                    {/* --- BAL OSZLOP: STATISZTIKÁK --- */}
                    <div className="col-lg-6 col-md-12 p-5 left-panel">

                        <div className="stats-list mb-5">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="stat-label">DRIVES</span>
                                <span className="stat-value">Honda Civic 2.0 Type R GT</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="stat-label">NUMBER OF TRIPS MADE</span>
                                <span className="stat-value">252</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="stat-label">NUMBER OF TRIPS TAKEN</span>
                                <span className="stat-value">28</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="stat-label">CO2 SAVINGS</span>
                                <span className="stat-value">2573147 Kg</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="stat-label">WORKS AT</span>
                                <span className="stat-value">4028 Debrecen, Kassai road 26.</span>
                            </div>
                        </div>

                        {/* Értékelések */}
                        <div className="ratings-section text-center mt-5">

                            <div className="mb-4">
                                <p className="rating-title mb-1">CHAUFFEUR RATING</p>
                                <div className="stars d-flex justify-content-center align-items-center gap-2">
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <span className="rating-number ms-2">5.0</span>
                                </div>
                            </div>

                            <div>
                                <p className="rating-title mb-1">PASSENGER RATING</p>
                                <div className="stars d-flex justify-content-center align-items-center gap-2">
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <i className="fas fa-star fa-2x text-warning"></i>
                                    <span className="rating-number ms-2">5.0</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* --- JOBB OSZLOP: ELŐZMÉNYEK (HISTORY) --- */}
                    <div className="col-lg-6 col-md-12 p-5 right-panel">
                        <h2 className="text-center mb-4 history-title">HISTORY</h2>

                        {/* Driver History */}
                        <h5 className="history-subtitle mb-3">DRIVER</h5>

                        {/* History Item 1 */}
                        <div className="history-item d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center">
                                <img src="/images/avatar-placeholder.png" alt="User" className="history-avatar rounded-circle me-3" />
                                <span>Simply perfect - Teddo</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-3">[9km]</span>
                                <div className="text-warning">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>

                        {/* History Item 2 */}
                        <div className="history-item d-flex align-items-center justify-content-between mb-5">
                            <div className="d-flex align-items-center">
                                <img src="/images/avatar-placeholder.png" alt="User" className="history-avatar rounded-circle me-3" />
                                <span>Just the way I like it - Harold</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-3">[7km]</span>
                                <div className="text-warning">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>


                        {/* Passenger History */}
                        <h5 className="history-subtitle mb-3">PASSENGER</h5>

                        {/* History Item 3 */}
                        <div className="history-item d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center">
                                <img src="/images/driver-placeholder-1.jpg" alt="User" className="history-avatar rounded-circle me-3" />
                                <span>One of the best driver ever</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-3">[10km]</span>
                                <div className="text-warning">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>

                        {/* History Item 4 */}
                        <div className="history-item d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <img src="/images/driver-placeholder-1.jpg" alt="User" className="history-avatar rounded-circle me-3" />
                                <span>Glad I picked this pool</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-3">[4km]</span>
                                <div className="text-warning">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </>
    );
}