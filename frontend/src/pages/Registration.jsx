// frontend/src/pages/Registration.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/registration.css';

export default function Registration() {
    // Űrlap állapotok
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        dateOfBirth: "",
        gender: "",
        role: "", // Sofőr / Utas
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Ide jöhetne az API hívás (pl. /api/auth/register)
        setMessage("Regisztráció elküldve. Az API hívás nem aktív.");
        // Példa: setTimeout(() => navigate("/login"), 3000);
    };

    return (
        <>
            <Navbar />

            {/* Fő konténer a középre igazításhoz */}
            <div className="registration-page-container d-flex flex-column align-items-center justify-content-center min-vh-100">

                {/* Regisztrációs kártya/doboz a CSS stílusokhoz */}
                <div className="registration-box p-4">

                    {/* Logó és Cím szekció */}
                    <div className="text-center mb-5">
                        <div className="logo-container mx-auto mb-3">
                            {/* Feltételezzük, hogy a logó kép a public/images mappában van */}
                            <img src="/images/vroommates-logo.png" alt="VroomMates Logo" className="vroommates-logo"/>
                        </div>
                        <h1 className="app-title">VroomMates</h1>
                        <p className="create-account-text">Create your account</p>
                    </div>

                    {/* Űrlap */}
                    <form onSubmit={handleSubmit}>
                        {/* Űrlap sor 1: E-mail és Születési dátum */}
                        <div className="row mb-3">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                                    <input type="email" name="email" className="form-control" placeholder="E-mail address"
                                           value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-calendar-alt"></i></span>
                                    <input type="date" name="dateOfBirth" className="form-control" placeholder="Date of Birth"
                                           value={formData.dateOfBirth} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* Űrlap sor 2: Felhasználónév és Nem */}
                        <div className="row mb-3">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-user"></i></span>
                                    <input type="text" name="username" className="form-control" placeholder="Username"
                                           value={formData.username} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-venus-mars"></i></span>
                                    <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                                        <option value="" disabled>Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Űrlap sor 3: Jelszó és Sofőr/Utas */}
                        <div className="row mb-5">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                    <input type="password" name="password" className="form-control" placeholder="Password"
                                           value={formData.password} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-car-side"></i></span>
                                    <select name="role" className="form-select" value={formData.role} onChange={handleChange} required>
                                        <option value="" disabled>Driver / Passenger</option>
                                        <option value="driver">Driver</option>
                                        <option value="passenger">Passenger</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Regisztrációs gomb */}
                        <div className="text-center">
                            <button type="submit" className="btn register-btn">Register</button>
                        </div>
                    </form>

                    {message && <p className="mt-3 text-center">{message}</p>}
                </div>
            </div>

            {/* A Footer ide kerülne, ha lenne, de a kérésben nem szerepel a kódja */}
        </>
    );
}