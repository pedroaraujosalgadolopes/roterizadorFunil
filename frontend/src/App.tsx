import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/status" element={<StatusDisprol />} />

        {/* Rotas protegidas com sidebar */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/nova-viagem" element={<NewTrip />} />
          <Route path="/entregas"    element={<Deliveries />} />
          <Route path="/roteiro"     element={<Routes_ />} />
          <Route path="/historico"   element={<History />} />
          <Route path="/usuarios"    element={<Users />} />
        </Route>
      </Routes>
      <Toast />
    </>
  );
}
