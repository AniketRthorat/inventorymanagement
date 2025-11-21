// inventory-management/src/LabsRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Labs from './Labs';
import LabDetail from './LabDetail';

const LabsRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Labs />} />
            <Route path=":id" element={<LabDetail />} />
        </Routes>
    );
};

export default LabsRoutes;
