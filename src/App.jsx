import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Programs from './pages/Programs';
import Registrations from './pages/Registrations';
import Details from './pages/Details';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminSupervisors from './pages/admin/AdminSupervisors';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes - Students & Admins */}
        <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/programs" element={session ? <Programs /> : <Navigate to="/login" />} />
        <Route path="/registrations" element={session ? <Registrations /> : <Navigate to="/login" />} />
        <Route path="/details" element={session ? <Details /> : <Navigate to="/login" />} />
        
        {/* Admin Routes */}
        <Route path="/admin/programs" element={session ? <AdminPrograms /> : <Navigate to="/login" />} />
        <Route path="/admin/registrations" element={session ? <AdminRegistrations /> : <Navigate to="/login" />} />
        <Route path="/admin/supervisors" element={session ? <AdminSupervisors /> : <Navigate to="/login" />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}