import React, { useState, useEffect } from 'react';
import './vehicle.css';

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

        const formData = new FormData();
        formData.append('plate', vehicleData.plate);
        formData.append('seats', vehicleData.seats);
        formData.append('make', vehicleData.make);
        formData.append('model', vehicleData.model);
        formData.append('year', vehicleData.year);
        formData.append('colour', vehicleData.colour);
        formData.append('fuel', vehicleData.fuel);

        // FONTOS: Itt csatoljuk a bejelentkezéskor elmentett userId-t
        formData.append('ownerID', ownerID);

        if (vehicleData.picture) {
            formData.append('picture', vehicleData.picture);
        }

        try {
            // Cseréld le a URL-t a sajátodra
            const response = await fetch('http://localhost:5000/api/vehicles', {
                method: 'POST',
                headers: {
                    // A token itt kerül beillesztésre
                    'Authorization': `Bearer ${token}`
                },
                body: formData
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
    );
};

export default Vehicle;