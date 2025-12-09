import React, { useState, useEffect } from 'react';
import './Vehicle.css'; // A stílus importálása

const Vehicle = () => {
    // State az űrlap adatoknak
    const [vehicleData, setVehicleData] = useState({
        plate: '',
        seats: '',
        make: '',
        model: '',
        year: '',
        colour: '',
        fuel: 'Benzin', // Alapértelmezett érték
        picture: null
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Kezeljük a beviteli mezők változását
    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicleData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Kezeljük a fájl feltöltést
    const handleFileChange = (e) => {
        setVehicleData(prev => ({
            ...prev,
            picture: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Token és UserID lekérése a localStorage-ból
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId'); // Feltételezzük, hogy login-kor elmentetted az ID-t

        if (!token || !userId) {
            setMessage({ type: 'error', text: 'Nem vagy bejelentkezve!' });
            setLoading(false);
            return;
        }

        // FormData létrehozása a képküldés miatt
        const formData = new FormData();
        formData.append('plate', vehicleData.plate);
        formData.append('seats', vehicleData.seats);
        formData.append('make', vehicleData.make);
        formData.append('model', vehicleData.model);
        formData.append('year', vehicleData.year);
        formData.append('colour', vehicleData.colour);
        formData.append('fuel', vehicleData.fuel);

        // A kért ownerID hozzáadása
        formData.append('ownerID', userId);

        if (vehicleData.picture) {
            formData.append('picture', vehicleData.picture);
        }

        try {
            // API hívás (cseréld le a URL-t a saját backend végpontodra)
            const response = await fetch('http://localhost:5000/api/vehicles', {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data', // FONTOS: Fetchnél ne állítsd be manuálisan, ha FormData-t használsz!
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Jármű sikeresen rögzítve!' });
                // Form ürítése
                setVehicleData({
                    plate: '', seats: '', make: '', model: '', year: '', colour: '', fuel: 'Benzin', picture: null
                });
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.message || 'Hiba történt a mentés során.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Nem sikerült csatlakozni a szerverhez.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vehicle-container">
            <div className="vehicle-card">
                <h2 className="text-center mb-4">Jármű Regisztráció</h2>

                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {/* Rendszám */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Rendszám</label>
                            <input type="text" className="form-control" name="plate" value={vehicleData.plate} onChange={handleChange} required placeholder="AAA-000" />
                        </div>

                        {/* Férőhelyek */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Férőhelyek száma</label>
                            <input type="number" className="form-control" name="seats" value={vehicleData.seats} onChange={handleChange} required min="1" placeholder="4" />
                        </div>
                    </div>

                    <div className="row">
                        {/* Márka */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Márka (Make)</label>
                            <input type="text" className="form-control" name="make" value={vehicleData.make} onChange={handleChange} required placeholder="pl. Toyota" />
                        </div>

                        {/* Modell */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Modell</label>
                            <input type="text" className="form-control" name="model" value={vehicleData.model} onChange={handleChange} required placeholder="pl. Corolla" />
                        </div>
                    </div>

                    <div className="row">
                        {/* Évjárat */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Évjárat</label>
                            <input type="number" className="form-control" name="year" value={vehicleData.year} onChange={handleChange} required min="1900" max={new Date().getFullYear() + 1} />
                        </div>

                        {/* Szín */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Szín</label>
                            <input type="text" className="form-control" name="colour" value={vehicleData.colour} onChange={handleChange} required placeholder="pl. Ezüst" />
                        </div>
                    </div>

                    {/* Üzemanyag */}
                    <div className="mb-3">
                        <label className="form-label">Üzemanyag</label>
                        <select className="form-select" name="fuel" value={vehicleData.fuel} onChange={handleChange}>
                            <option value="Benzin">Benzin</option>
                            <option value="Dízel">Dízel</option>
                            <option value="Elektromos">Elektromos</option>
                            <option value="Hibrid">Hibrid</option>
                            <option value="LPG">LPG</option>
                        </select>
                    </div>

                    {/* Kép feltöltés */}
                    <div className="mb-4">
                        <label className="form-label">Jármű képe</label>
                        <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                        {loading ? 'Mentés folyamatban...' : 'Jármű Hozzáadása'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Vehicle;