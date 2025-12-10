import React from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/homepage.css';

export default function HomePage() {
    return (
        <>
            <Navbar />

            <div className="home-page-content-container py-5">

                {/* --- 1. CÍMSOR --- */}
                <header className="header-section mb-5 px-3">
                    <h1>Spórolj az utazáson</h1>
                    <p>Utazz autóban spórolj és védd a környezetet</p>
                </header>

                {/* --- 2. FŐ SZEKCIÓ (Keresés + Sofőr Slide) --- */}
                <div className="row g-4 mb-5 mx-0 px-3">

                    {/* BAL OLDAL: KERESŐ */}
                    <div className="col-lg-6 col-md-12">
                        <div className="search-box p-4 shadow-lg h-100">
                            <form>
                                {/* Honnan */}
                                <div className="input-group mb-3 custom-input-group">
                                    <span className="input-label">Honnan?</span>
                                    <input type="text" className="form-control" placeholder="Indulás helye" />
                                    <button className="btn-clear" type="button">×</button>
                                </div>

                                {/* Hová */}
                                <div className="input-group mb-3 custom-input-group">
                                    <span className="input-label">Hová?</span>
                                    <input type="text" className="form-control" placeholder="Érkezés helye" />
                                    <button className="btn-clear" type="button">×</button>
                                </div>

                                {/* Dátum / Idő */}
                                <div className="row mb-4">
                                    <div className="col-6">
                                        <div className="custom-input-wrapper">
                                            <input type="date" className="form-control" defaultValue="2025-04-01" />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="custom-input-wrapper">
                                            <input type="time" className="form-control" defaultValue="09:41" />
                                        </div>
                                    </div>
                                </div>

                                {/* Gombok */}
                                <div className="d-flex align-items-center">
                                    <button type="submit" className="btn btn-black search-btn me-3">Keresés</button>
                                    <a href="#" className="history-link">Korábbi utazások</a>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* JOBB OLDAL: SOFŐR SLIDE (CAROUSEL) */}
                    <div className="col-lg-6 col-md-12">
                        <div id="driverCarousel" className="carousel slide driver-carousel-box shadow-lg" data-bs-ride="carousel">

                            {/* Navigációs nyilak */}
                            <button className="carousel-control-prev" type="button" data-bs-target="#driverCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#driverCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>

                            {/* Slide-ok */}
                            <div className="carousel-inner h-100">

                                {/* 1. Sofőr */}
                                <div className="carousel-item active h-100">
                                    <div className="driver-slide-content h-100 d-flex flex-column align-items-center justify-content-center">
                                        <div className="badge-driver mb-2">Sofőr profil</div>
                                        <img src="/images/driver-placeholder-1.jpg" className="driver-avatar rounded-circle mb-3" alt="Avatar" />
                                        <h3 className="driver-name">Nagy Sándor</h3>
                                        <p className="driver-route">Budapest - Debrecen</p>
                                        <div className="driver-rating text-warning">
                                            <i className="fas fa-star"></i> ⭐⭐⭐⭐ (120 út)
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Sofőr */}
                                <div className="carousel-item h-100">
                                    <div className="driver-slide-content h-100 d-flex flex-column align-items-center justify-content-center">
                                        <div className="badge-driver mb-2">Sofőr profil</div>
                                        <img src="/images/driver-placeholder-2.jpg" className="driver-avatar rounded-circle mb-3" alt="Avatar" />
                                        <h3 className="driver-name">Kovács Anna</h3>
                                        <p className="driver-route">Szeged - Pécs</p>
                                        <div className="driver-rating text-warning">
                                            <i className="fas fa-star"></i> ⭐⭐⭐⭐⭐ (55 út)
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Sofőr */}
                                <div className="carousel-item h-100">
                                    <div className="driver-slide-content h-100 d-flex flex-column align-items-center justify-content-center">
                                        <div className="badge-driver mb-2">Sofőr profil</div>
                                        <img src="/images/driver-placeholder-3.jpg" className="driver-avatar rounded-circle mb-3" alt="Avatar" />
                                        <h3 className="driver-name">Tóth Bence</h3>
                                        <p className="driver-route">Győr - Sopron</p>
                                        <div className="driver-rating text-warning">
                                            <i className="fas fa-star"></i> ⭐⭐⭐ (10 út)
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <h4 className="px-3 mb-3 text-white">Statisztika</h4>
                <div className="row g-4 px-3 mb-5">
                    <div className="col-md-4">
                        <div className="card-custom">
                            <img src="/images/car-ride-people.jpg" alt="Utasok" />
                            <div className="card-body-custom">
                                <p className="mb-0 text-muted">Utasok száma</p>
                                <h5>696969</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-custom">
                            <img src="/images/driving.jpg" alt="Sofőrök" />
                            <div className="card-body-custom">
                                <p className="mb-0 text-muted">Sofőrök száma</p>
                                <h5>4200</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-custom">
                            <img src="/images/available-driver.jpg" alt="Elérhető" />
                            <div className="card-body-custom">
                                <p className="mb-0 text-muted">Elérhető sofőrök</p>
                                <h5>780</h5>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. VÉLEMÉNYEK --- */}
                <h4 className="px-3 mb-3 text-white">Vélemények</h4>
                <div className="row g-4 px-3">
                    {/* Vélemény kártyák... (Ugyanaz a struktúra, mint a statisztika, csak kép nélkül vagy kisebb avatárral) */}
                    <div className="col-md-4">
                        <div className="card-review p-4">
                            <h5>Ez egyszerűen zseniális!</h5>
                            <div className="d-flex align-items-center mt-3">
                                <img src="/images/avatar-placeholder.png" className="rounded-circle me-2" width="30" alt="User" />
                                <small>Name</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-review p-4">
                            <h5>Nagyszerű megvalósítás!</h5>
                            <div className="d-flex align-items-center mt-3">
                                <img src="/images/avatar-placeholder.png" className="rounded-circle me-2" width="30" alt="User" />
                                <small>Name</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-review p-4">
                            <h5>Úr Isten! Very big!</h5>
                            <div className="d-flex align-items-center mt-3">
                                <img src="/images/avatar-placeholder.png" className="rounded-circle me-2" width="30" alt="User" />
                                <small>Name</small>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}