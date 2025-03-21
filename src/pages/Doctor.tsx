import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DoctorLogin from '../components/DoctorLogin';
import DoctorDashboard from '../components/DoctorDashboard';

export default function Doctor() {
  return (
    <Routes>
      <Route path="/" element={<DoctorLogin />} />
      <Route path="/dashboard" element={<DoctorDashboard />} />
      <Route path="*" element={<Navigate to="/doctor" replace />} />
    </Routes>
  );
}