import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/registration.css';
import { request } from '../utils/api';

export default function Registration() {
    // JAVÍTÁS 1: A state kulcsai legyenek összhangban az input "name" attribútumaival
    const [formData, setFormData] = useState({
        email: "",
        username: "", // "userName" helyett "username", hogy passzoljon az input name-hez
        displayName: "",
        password: "",
        role: "passenger",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // JAVÍTÁS 2: Ha a regisztrációs oldalra lépsz, töröljük a beragadt tokent!
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const payload = {
            email: formData.email,
            userName: formData.username, // A backend "userName"-t vár, a state-ben most már "username" van
            displayName: formData.displayName,
            password: formData.password,
            driver: formData.role === "driver",
            admin: false
        };

        try {
            // Itt már nem lesz token a fejlécben, mert a useEffect törölte
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
                    <div className="text-center mb-5">
                        <div className="logo-container mx-auto mb-3">
                            <img src="/images/logo.jpeg" alt="VroomMates Logo" className="vroommates-logo"/>
                        </div>
                        <h1 className="app-title">VroomMates</h1>
                        <p className="create-account-text">Create your account</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* 1. SOR: Email és Username */}
                        <div className="row mb-3">
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
                            <div className="col-md-6">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-user"></i></span>
                                    {/* JAVÍTÁS: name="username" egyezzen a state kulcsával */}
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

                        {/* 3. SOR: Jelszó */}
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

                        <div className="text-center">
                            <button type="submit" className="btn register-btn">Register</button>
                        </div>
                    </form>

                    {message && <p className="mt-3 text-center fw-bold text-black">{message}</p>}
                </div>
            </div>
        </>
    );
}