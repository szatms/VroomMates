import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Registration from './pages/Registration.jsx';
import Login from './pages/Login.jsx';
import Map from './pages/Map.jsx';
import Profile from "./pages/Profil.jsx";
import RateDriver from "./pages/RateDriver.jsx";
import PassengerRating from "./pages/RatePassenger.jsx";
import Vehicle from "./pages/Vehicle.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";
import Settings from './pages/Settings';
import PasserBooking from './pages/PassengerBooking.jsx';
import DriverBooking from './pages/DriverBooking.jsx';


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/driverbooking" element={<DriverBooking />} />
                <Route path="/passengerbooking" element={<PasserBooking />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ratedriver" element={<RateDriver />} />
                <Route path="/ratepassenger" element={<PassengerRating />} />
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