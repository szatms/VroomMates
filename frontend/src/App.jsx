import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserRoute from "./components/Route";
import HomePage from "./pages/HomePage.jsx";
import Registration from './pages/Registration.jsx';
import Login from './pages/Login.jsx';
import Map from './pages/Map.jsx';
import Profile from "./pages/Profil.jsx";
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/user/profil" element={<Profile/>} />

                <Route path="/map" element={<Map />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Registration />} />

                <Route path="*" element={<HomePage />} />



            </Routes>
        </BrowserRouter>
    );
}
