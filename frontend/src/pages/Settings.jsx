import React, { useEffect, useState } from 'react';
import '../assets/style/settings.css'; // Fontos: ÚJ CSS fájl!
import { request } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Ezt másold be a Settings komponens belsejébe, a useEffect alá
     const handleDriverStatusChange = async (isDriverValue) => {

             // 1. Optimista UI frissítés (hogy a kapcsoló azonnal átbillenjen)
             setUser(prev => ({ ...prev, isDriver: isDriverValue }));

             try {
                 // 2. API hívás a backend felé ("/users/{id}")
                 // Feltételezzük, hogy a UserUpdateDTO-ban van "isDriver" mező
                 const updatedUser = await request(`/users/${localStorage.userId}`, "PUT", {
                     isDriver: isDriverValue
                 });

                 // 3. State frissítése a végleges szerver válasszal
                 setUser(updatedUser);

                 // 4. LocalStorage frissítése: Ha változott a ROLE, elmentjük
                 // (Pl. ha átváltottál DRIVER-re, és a backend visszaküldi, hogy mostantól "DRIVER" a role)
                 if (updatedUser.role) {
                     localStorage.setItem('role', updatedUser.role);
                     console.log("LocalStorage frissítve. Új role:", updatedUser.role);
                 }

             } catch (error) {
                 console.error("Hiba a státusz mentésekor:", error);
                 // Hiba esetén visszabillentjük a kapcsolót az eredetire
                 setUser(prev => ({ ...prev, isDriver: !isDriverValue }));
                 alert("Sikertelen mentés! Próbáld újra.");
             }
         };
    // Itt is le kell kérni az adatokat, hogy a bal oldalon megjelenjenek
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await request("/users/me");
                setUser(userData);
            } catch (error) {
                console.error("Hiba", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('role');
        navigate('/login');
    };

    if (loading) return <div className="settings-loading">Loading...</div>;

    // Placeholder adatok, ha az API-ból nem jönne minden
    const userData = user || {};

    return (
    <>
      <Navbar />
        <div className="settings-page">
            <div className="settings-container">
                {/* --- HEADER --- */}
                <header className="settings-header">
                    <div className="header-left">
                         {/* Ikon vagy Logo */}
                         <i className="bi bi-gear-fill" style={{fontSize: '3rem'}}></i>
                    </div>
                    <h1 className="header-title">SETTINGS</h1>
                    <div className="header-buttons">
                        <button className="btn-custom btn-logout" onClick={handleLogout}>LOG OUT</button>
                        <button className="btn-custom btn-back" onClick={() => navigate(-1)}>BACK</button>
                    </div>
                </header>

                <div className="settings-body">
                    {/* --- BAL OLDAL: PROFILE ADATOK --- */}
                    <div className="column profile-column">
                        <h2 className="section-title">PROFILE</h2>

                        <div className="info-grid">
                            <div className="info-row">
                                <span className="label">NAME</span>
                                <span className="value">{userData.displayName || "John Doe"}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">NICKNAME</span>
                                <span className="value">{userData.userName || "Gigachad"}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">DATE OF BIRTH</span>
                                <span className="value">{userData.birthDate || "1969.05.13."}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">CAR</span>
                                <span className="value">{userData.carType || "Honda Civic Type R"}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">PASSENGER SEATS</span>
                                     <span className="value text-end">{userData.seats || "4"}</span>
                                        </div>
                                         <div className="info-row">
                                          <span className="label">HOME ADDRESS</span>
                                              <span className="value text-end" style={{maxWidth: '60%'}}>{userData.homeAddress || "1234 Exa City, Example street 1/A"}</span>
                                                </div>
                                                 <div className="info-row">
                                                     <span className="label">WORKPLACE ADDRESS</span>
                                                         <span className="value text-end" style={{maxWidth: '60%'}}>{userData.workAddress || "4028 Debrecen, Kassai road 26."}</span>
                                                 </div>
                                                     <div className="info-row">
                                                        <span className="label">WORK SCHEDULE</span>
                                                         <span className="value text-end">{userData.schedule || "M - F, 9 - 5"}</span>
                                                       </div>

                               {/* Radio Buttons Szekció */}
                                                           <div className="radio-section mt-4 mb-4">
                                                               <div className="d-flex justify-content-between align-items-center mb-2">
                                                                   <span className="label">ACTIVE DRIVER</span>
                                                                   <div className="radio-options">
                                                                       {/* YES Gomb */}
                                                                       <label className="me-3" style={{cursor: 'pointer'}}>
                                                                           <input
                                                                               type="radio"
                                                                               name="activeDriver"
                                                                               checked={userData.isDriver === true}
                                                                               onChange={() => handleDriverStatusChange(true)}
                                                                               className="me-1"
                                                                           />
                                                                           YES
                                                                       </label>

                                                                       {/* NO Gomb */}
                                                                       <label style={{cursor: 'pointer'}}>
                                                                           <input
                                                                               type="radio"
                                                                               name="activeDriver"
                                                                               checked={userData.isDriver === false}
                                                                               onChange={() => handleDriverStatusChange(false)}
                                                                               className="me-1"
                                                                           />
                                                                           NO
                                                                       </label>
                                                                   </div>
                                                               </div>

                                                               {/* A GENDER marad readOnly, hacsak azt is nem akarod szerkeszteni */}
                                                               <div className="d-flex justify-content-between align-items-center">
                                                                   <span className="label">GENDER</span>
                                                                   <div className="radio-options">
                                                                       <label className="me-2"><input type="radio" checked={userData.gender === 'MALE'} readOnly /> MALE</label>
                                                                       <label className="me-2"><input type="radio" checked={userData.gender === 'FEMALE'} readOnly /> FEMALE</label>
                                                                       <label><input type="radio" checked={userData.gender === 'OTHER'} readOnly /> OTHER</label>
                                                                   </div>
                                                               </div>
                                                           </div>                           <div className="profile-images mt-5 text-center">
                                <img src={userData.pfp || "/images/avatar-placeholder.png"} className="circle-img me-3" alt="Pfp"/>
                                {userData.isDriver && <img src="/images/car-placeholder.jpg" className="circle-img" alt="Car"/>}
                            </div>
                        </div>
                    </div>

                    {/* --- JOBB OLDAL: BEÁLLÍTÁSOK --- */}
                    <div className="column other-column">
                        <h2 className="section-title">OTHER</h2>

                        <div className="settings-list">
                            <div className="setting-item">
                                <span className="label">NOTIFICATIONS</span>
                                <button className="btn-toggle on">ON</button>
                            </div>
                            <div className="setting-item">
                                <span className="label">CHANGE PASSWORD</span>
                                <button className="btn-action">CHANGE</button>
                            </div>
                            <div className="setting-item">
                                <span className="label">THEME</span>
                                <button className="btn-action">DARK</button>
                            </div>

                            {/* Verzió és törlés */}
                            <div className="mt-5 footer-area">
                                <div className="d-flex justify-content-between">
                                    <span>VERSION</span>
                                    <span>0.0.1</span>
                                </div>
                                <div className="d-flex justify-content-between mt-3 text-danger fw-bold">
                                    <span>DELETE ACCOUNT</span>
                                    <button className="btn btn-danger btn-sm">DELETE</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}