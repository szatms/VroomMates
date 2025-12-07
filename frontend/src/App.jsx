import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserRoute from "./components/Route";
import HomePage from "./pages/HomePage.jsx";
import Registration from './pages/Registration.jsx';
import Login from './pages/Login.jsx';
export default function App() {
    return (
        <BrowserRouter>
            <Routes>



                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Registration />} />

                <Route path="*" element={<HomePage />} />



            </Routes>
        </BrowserRouter>
    );
}
