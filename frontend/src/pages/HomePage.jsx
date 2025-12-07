// frontend/src/pages/HomePage.jsx

import React from 'react';
import Navbar from '../components/Navbar.jsx'; // Győződj meg róla, hogy az útvonal helyes!

/**
 * HomePage Komponens:
 * Megjeleníti a Navigációs Sávot és az "Hello World!" üzenetet.
 */
export default function HomePage() {
    return (
        <div>
            {/* 1. A Navbar komponens beillesztése */}
            <Navbar />

            {/* 2. Az oldal fő tartalma */}
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Hello World!</h1>
                <p>Ez a projekt főoldala.</p>
            </div>
        </div>
    );
}