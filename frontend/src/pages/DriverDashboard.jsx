import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { request } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function DriverDashboard() {
    const [trips, setTrips] = useState([]);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/login');
                return;
            }

            try {
                const vehicleData = await request(`/vehicles/owner/${userId}`);
                setVehicle(vehicleData);

                const tripsData = await request(`/trips/driver/${userId}`);
                setTrips(tripsData || []);

            } catch (error) {
                console.error("Hiba az adatok betöltésekor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) return <div className="text-white text-center mt-5">Betöltés...</div>;

    return (
        <>
            <Navbar />
            <div className="container mt-5 text-white">
                <h1 className="mb-4 fw-bold">Sofőr Pult</h1>

                {/* --- 1. JÁRMŰ SZEKCIÓ --- */}
                <div className="card bg-dark text-white border-secondary mb-5 shadow">
                    <div className="card-header bg-success fw-bold text-uppercase">
                        Aktuális Járműved
                    </div>
                    <div className="card-body">
                        {vehicle ? (
                            <div className="row align-items-center">
                                <div className="col-md-4 text-center">
                                    <img
                                        src={vehicle.picture ? vehicle.picture : "/images/car-placeholder.jpg"}
                                        alt="Car"
                                        className="img-fluid rounded-circle border border-3 border-success"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <h3 className="card-title fw-bold text-warning">{vehicle.plate}</h3>
                                    <p className="card-text fs-5">
                                        {vehicle.make} {vehicle.model} ({vehicle.year})
                                    </p>
                                    <ul className="list-inline">
                                        <li className="list-inline-item badge bg-secondary">{vehicle.colour}</li>
                                        <li className="list-inline-item badge bg-primary">{vehicle.fuel}</li>
                                        <li className="list-inline-item badge bg-info text-dark">{vehicle.seats} ülés</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-3">
                                <p className="mb-3">Még nincs regisztrált autód.</p>
                                <a href="/user/vehicle" className="btn btn-outline-warning">Autó hozzáadása</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 2. UTAK SZEKCIÓ --- */}
                <h3 className="mb-3 border-bottom pb-2">Tervezett / Aktív Útjaid</h3>

                {trips.length === 0 ? (
                    <div className="alert alert-info">Jelenleg nincs aktív vagy jövőbeli utad meghirdetve.</div>
                ) : (
                    <div className="row">
                        {trips.map(trip => (
                            <div key={trip.tripID} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 bg-secondary text-white border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge bg-warning text-dark">
                                                {new Date(trip.departureTime).toLocaleDateString()}
                                            </span>
                                            <span className="badge bg-dark">
                                                {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>

                                        <h5 className="card-title mb-3">
                                            Indulás: <br/>
                                            <span className="text-warning fs-6">
                                                {trip.startLocation || `(${trip.startLat.toFixed(3)}, ${trip.startLon.toFixed(3)})`}
                                            </span>
                                        </h5>
                                        <h5 className="card-title mb-4">
                                            Érkezés: <br/>
                                            <span className="text-warning fs-6">
                                                {trip.endLocation || `(${trip.endLat.toFixed(3)}, ${trip.endLon.toFixed(3)})`}
                                            </span>
                                        </h5>

                                        <div className="d-flex justify-content-between border-top pt-3 border-dark">
                                            <span>Utasok: {trip.passengerCount - 1}</span>
                                            <span>Szabad: {trip.remainingSeats}</span>
                                        </div>

                                        {trip.tripMessage && (
                                            <div className="mt-3 fst-italic text-light small">
                                                "{trip.tripMessage}"
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-footer bg-dark border-0">
                                        <button className="btn btn-danger w-100 btn-sm">
                                            Út Lezárása (Később)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}