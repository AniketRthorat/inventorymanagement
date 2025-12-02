// inventory-management/src/LabsRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Labs from './Labs';
import LabDetail from './LabDetail';
import LabEdit from './LabEdit'; // Import the new LabEdit component

const LabsRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Labs />} />
            <Route path=":id" element={<LabDetail />} />
            <Route path=":id/edit" element={<LabEdit />} /> {/* New route for editing a lab */}
        </Routes>
    );
};

export default LabsRoutes;
