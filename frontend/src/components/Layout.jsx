// frontend/src/components/Layout.jsx

import React from 'react';
import Navbar from './Navbar.jsx'; // Importáld a Navbar-t

// Ez a komponens adja az egységes elrendezést
const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main>
                {children} {/* Itt jelenik meg az oldal tartalma (pl. Dashboard) */}
            </main>
        </>
    );
};

export default Layout;