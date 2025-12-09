import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/registration.css';
import { request } from '../utils/api';

export default function Registration() {
    // State kibővítve a username mezővel
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        displayName: "",
        password: "",
        role: "passenger",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const payload = {
            email: formData.email,
            username: formData.username, // Hozzáadva a payloadhoz
            displayName: formData.displayName,
            password: formData.password,
            driver: formData.role === "driver",
            admin: false
        };

        try {
            await request("/auth/register", "POST", payload);
            setMessage("Sikeres regisztráció! Átirányítás...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setMessage("Hiba: " + error.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="registration-page-container d-flex flex-column align-items-center justify-content-center min-vh-100">
                <div className="registration-box p-4">
                    {/* --- FEJLÉC --- */}
                    <div className="text-center mb-5">
                        <div className="logo-container mx-auto mb-3">
                            <img src="/images/vroommates-logo.png" alt="VroomMates Logo" className="vroommates-logo"/>
                        </div>
                        <h1 className="app-title">VroomMates</h1>
                        <p className="create-account-text">Create your account</p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* 1. SOR: Email és Username */}
                        <div className="row mb-3">
                            {/* Email */}
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="E-mail address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            {/* Username (VISSZAKERÜLT) */}
                            <div className="col-md-6">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-user"></i></span>
                                    <input
                                        type="text"
                                        name="username"
                                        className="form-control"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. SOR: Display Name és Role */}
                        <div className="row mb-3">
                            {/* Display Name */}
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-id-card"></i></span>
                                    <input
                                        type="text"
                                        name="displayName"
                                        className="form-control"
                                        placeholder="Display Name"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            {/* Role */}
                            <div className="col-md-6">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-car-side"></i></span>
                                    <select
                                        name="role"
                                        className="form-select"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="passenger">Passenger</option>
                                        <option value="driver">Driver</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. SOR: Jelszó (Teljes szélességben) */}
                        <div className="row mb-5">
                            <div className="col-12">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* GOMB */}
                        <div className="text-center">
                            <button type="submit" className="btn register-btn">Register</button>
                        </div>
                    </form>

                    {message && <p className="mt-3 text-center fw-bold text-white">{message}</p>}
                </div>
            </div>
        </>
    );
}