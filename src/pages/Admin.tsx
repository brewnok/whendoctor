import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

export default function Admin() {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}