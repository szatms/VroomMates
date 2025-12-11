import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/registration.css';
import { request } from '../utils/api';

export default function Registration() {
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        displayName: "",
        password: "",
        role: "passenger",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.clear();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const payload = {
            email: formData.email,
            userName: formData.username,
            displayName: formData.displayName,
            password: formData.password,
            driver: formData.role === "driver",
            admin: false
        };

        try {
            // 🔥 MÓDOSÍTÁS: Elmentjük a választ, mert ebben benne van a token!
            const data = await request("/auth/register", "POST", payload);

            // Automatikus bejelentkeztetés
            if (data && data.accessToken) {
                localStorage.setItem("token", data.accessToken);
                localStorage.setItem("userId", data.user.userId);
                localStorage.setItem("userName", data.user.userName);
                localStorage.setItem("role", data.user.role);

                // Profilkép mentése (backend már beállítja az alapértelmezettet)
                if (data.user.pfp) {
                    localStorage.setItem("userPfp", data.user.pfp);
                }
            }

            setMessage("Sikeres regisztráció! Belépés...");

            // 🔥 MÓDOSÍTÁS: Gyors átirányítás a Home-ra (0.8 mp)
            setTimeout(() => {
                navigate("/");
            }, 800);

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
                        <p className="create-account-text">Hozd létre a fiókodat</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                                    <input type="email" name="email" className="form-control" placeholder="E-mail cím" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-user"></i></span>
                                    <input type="text" name="username" className="form-control" placeholder="Felhasználónév" value={formData.username} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-id-card"></i></span>
                                    <input type="text" name="displayName" className="form-control" placeholder="Megjelenítendő név" value={formData.displayName} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-car-side"></i></span>
                                    <select name="role" className="form-select" value={formData.role} onChange={handleChange} required>
                                        <option value="passenger">Utas</option>
                                        <option value="driver">Sofőr</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-5">
                            <div className="col-12">
                                <div className="input-group registration-input-group">
                                    <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                    <input type="password" name="password" className="form-control" placeholder="Jelszó" value={formData.password} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <button type="submit" className="btn register-btn">Regisztráció</button>
                        </div>
                    </form>

                    {message && <p className="mt-3 text-center fw-bold text-black">{message}</p>}
                </div>
            </div>
        </>
    );
}