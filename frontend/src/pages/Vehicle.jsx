import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import '../assets/style/vehicle.css';

const Vehicle = () => {
    const [vehicleData, setVehicleData] = useState({
        plate: '',
        seats: '',
        make: '',
        model: '',
        year: '',
        colour: '',
        fuel: 'Benzin',
        picture: null
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [ownerID, setOwnerID] = useState(null);

    useEffect(() => {
        // Kiolvassuk az elmentett adatokat
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token'); // Ez tartalmazza majd az "accessToken"-t

        // Ellenőrzés
        if (!token || !storedUserId) {
            setMessage({
                type: 'error',
                text: 'Hiba: Nem vagy bejelentkezve. Kérlek, jelentkezz be újra!'
            });
        } else {
            setOwnerID(storedUserId);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicleData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setVehicleData(prev => ({ ...prev, picture: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const token = localStorage.getItem('token');

        if (!ownerID || !token) {
            setMessage({ type: 'error', text: 'Hiányzó bejelentkezési adatok.' });
            setLoading(false);
            return;
        }

        const jsonData = {
            plate: vehicleData.plate,
            seats: Number(vehicleData.seats),
            make: vehicleData.make,
            model: vehicleData.model,
            year: Number(vehicleData.year),
            colour: vehicleData.colour,
            fuel: vehicleData.fuel,
            ownerID: Number(ownerID),
            picture: null // jelenleg nem kezeljük a backendben
        };

        try {
            const response = await fetch('/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(jsonData)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Jármű sikeresen rögzítve!' });
                setVehicleData({
                    plate: '', seats: '', make: '', model: '', year: '', colour: '', fuel: 'Benzin', picture: null
                });
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.message || 'Hiba történt a mentés során.' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Nem sikerült csatlakozni a szerverhez.' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
        <Navbar />
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
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Rendszám</label>
                            <input type="text" className="form-control" name="plate" value={vehicleData.plate} onChange={handleChange} required placeholder="AAA-000" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Férőhelyek száma</label>
                            <input type="number" className="form-control" name="seats" value={vehicleData.seats} onChange={handleChange} required min="1" placeholder="4" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Márka</label>
                            <input type="text" className="form-control" name="make" value={vehicleData.make} onChange={handleChange} required placeholder="pl. Toyota" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Modell</label>
                            <input type="text" className="form-control" name="model" value={vehicleData.model} onChange={handleChange} required placeholder="pl. Corolla" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Évjárat</label>
                            <input type="number" className="form-control" name="year" value={vehicleData.year} onChange={handleChange} required min="1900" max={new Date().getFullYear() + 1} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Szín</label>
                            <input type="text" className="form-control" name="colour" value={vehicleData.colour} onChange={handleChange} required placeholder="pl. Ezüst" />
                        </div>
                    </div>

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

                    <div className="mb-4">
                        <label className="form-label">Jármű képe</label>
                        <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading || !ownerID}>
                        {loading ? 'Mentés folyamatban...' : 'Jármű Hozzáadása'}
                    </button>
                </form>
            </div>
        </div>
        </>
    );
};

export default Vehicle;