import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/login.css';
import { request } from '../utils/api';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            // backend UserLoginDTO email-t és jelszót vár
            const data = await request("/auth/login", "POST", {
                email: email,
                password: password
            });
            if (data && data.accessToken) {
                localStorage.setItem("token", data.accessToken);
                navigate("/user/profil");
            }
        } catch (error) {
            setMessage("Hibás e-mail cím vagy jelszó!");
        }
    };

    return (
        <>
            <Navbar />
            <div className="login-page-container d-flex flex-column align-items-center justify-content-center min-vh-100">
                <div className="login-box p-4">
                    <div className="text-center mb-5">
                        <div className="logo-container mx-auto mb-3">
                            <img src="/images/vroommates-logo.png" alt="VroomMates Logo" className="vroommates-logo"/>
                        </div>
                        <h1 className="app-title">VroomMates</h1>
                        <p className="sign-in-text">Sign into your account</p>
                        <p className="create-account-link">Or create a new one <a href="/register">here</a></p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <div className="input-group login-input-group">
                                <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="E-mail address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

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

                        <div className="text-end mb-4">
                            <a href="#" className="forgot-password-link">Forgot your password?</a>
                        </div>

                        <div className="text-center">
                            <button type="submit" className="btn login-btn">Login</button>
                        </div>
                    </form>

                    {message && <p className="mt-3 text-center text-danger fw-bold">{message}</p>}
                </div>
            </div>
        </>
    );
}