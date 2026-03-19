import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import NewTrip from './pages/NewTrip';
import Deliveries from './pages/Deliveries';
import Routes_ from './pages/Routes';
import History from './pages/History';
import StatusDisprol from './pages/StatusDisprol';
import Login from './pages/Login';
import Users from './pages/Users';
import { Toast } from './components/Toast';

export default function App() {
  return (
    <>
      <Routes>
        {/* Todas as rotas dentro do Layout (menu sempre visível) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/status"     element={<StatusDisprol />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/nova-viagem" element={<ProtectedRoute><NewTrip /></ProtectedRoute>} />
          <Route path="/entregas"    element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
          <Route path="/roteiro"     element={<ProtectedRoute><Routes_ /></ProtectedRoute>} />
          <Route path="/historico"   element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/usuarios"    element={<ProtectedRoute><Users /></ProtectedRoute>} />
        </Route>
      </Routes>
      <Toast />
    </>
  );
}
