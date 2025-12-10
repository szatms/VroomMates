import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Registration from './pages/Registration.jsx';
import Login from './pages/Login.jsx';
import Map from './pages/Map.jsx';
import Profile from "./pages/Profil.jsx";
import Vehicle from "./pages/Vehicle.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/user/vehicle" element={<Vehicle/>} />
                <Route path="/user/profile" element={<Profile/>} />
                <Route path="/map" element={<Map />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
                <Route path="*" element={<HomePage />} />
            </Routes>
        </BrowserRouter>
    );
}