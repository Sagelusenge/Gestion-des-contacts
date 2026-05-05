import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleProtectedRoute } from './utils/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pasteurs from './pages/Pasteurs';
import PasteurDetail from './pages/PasteurDetail';
import Mouvements from './pages/Mouvements';
import Communication from './pages/Communication';
import Audit from './pages/Audit';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pasteurs"
          element={
            <ProtectedRoute>
              <Pasteurs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pasteurs/:id"
          element={
            <ProtectedRoute>
              <PasteurDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mouvements"
          element={
            <ProtectedRoute>
              <Mouvements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/communication"
          element={
            <ProtectedRoute>
              <Communication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit"
          element={
            <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <Audit />
            </RoleProtectedRoute>
          }
        />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
