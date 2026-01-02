import React from 'react';
import { Route, Routes, Navigate, Link, useNavigate } from 'react-router-dom';
import LoginPage from '../screens/LoginPage';
import PatientsPage from '../screens/PatientsPage';
import PatientDashboard from '../screens/PatientDashboard';
import { clearToken, getToken } from '../lib/api';

function Layout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const token = getToken();
  return (
    <div className="container">
      <div className="topbar">
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <Link to="/" style={{textDecoration:'none'}}><b>Familia Meds</b></Link>
          <span className="muted">• control familiar</span>
        </div>
        <div style={{display:'flex', gap:10}}>
          {token && (
            <>
              <Link className="btn small" to="/patients">Pacientes</Link>
              <button className="btn small" onClick={() => { clearToken(); nav('/login'); }}>
                Salir
              </button>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/patients" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <PatientsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patients/:patientId"
          element={
            <PrivateRoute>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/patients" replace />} />
      </Routes>
    </Layout>
  );
}
