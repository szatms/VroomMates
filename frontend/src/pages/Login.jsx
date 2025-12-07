// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/login.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Feltételezett API hívás a bejelentkezéshez
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            const token = await res.text();
            localStorage.setItem("token", token);
            navigate("/dashboard");
        } else {
            setMessage("Hibás felhasználónév vagy jelszó");
        }
    };

    return (
        <>
            <Navbar />

            {/* Fő konténer a középre igazításhoz */}
            <div className="login-page-container d-flex flex-column align-items-center justify-content-center min-vh-100">

                {/* Bejelentkezési doboz a CSS stílusokhoz */}
                <div className="login-box p-4">

                    {/* Logó és Cím szekció */}
                    <div className="text-center mb-5">
                        <div className="logo-container mx-auto mb-3">
                            {/* Feltételezzük, hogy a logó kép a public/images mappában van */}
                            <img src="/images/vroommates-logo.png" alt="VroomMates Logo" className="vroommates-logo"/>
                        </div>
                        <h1 className="app-title">VroomMates</h1>
                        <p className="sign-in-text">Sign into your account</p>
                        <p className="create-account-link">Or create a new one <a href="/register">here</a></p>
                    </div>

                    {/* Űrlap */}
                    <form onSubmit={handleSubmit}>

                        {/* Felhasználónév/E-mail mező */}
                        <div className="mb-3">
                            <div className="input-group login-input-group">
                                <span className="input-group-text"><i className="fas fa-user"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Jelszó mező */}
                        <div className="mb-3">
                            <div className="input-group login-input-group">
                                <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Elfelejtett jelszó link */}
                        <div className="text-end mb-4">
                            <a href="/forgot-password" className="forgot-password-link">Forgot your password?</a>
                        </div>


                        {/* Bejelentkezés gomb */}
                        <div className="text-center">
                            <button type="submit" className="btn login-btn">Login</button>
                        </div>
                    </form>

                    {message && <p className="mt-3 text-center">{message}</p>}
                </div>
            </div>

            {/* A Footer ide kerülne */}
        </>
    );
}