import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewTrip from './pages/NewTrip';
import Deliveries from './pages/Deliveries';
import Routes_ from './pages/Routes';
import History from './pages/History';
import StatusDisprol from './pages/StatusDisprol';
import { Toast } from './components/Toast';

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/"            element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/nova-viagem" element={<NewTrip />} />
          <Route path="/entregas"    element={<Deliveries />} />
          <Route path="/roteiro"     element={<Routes_ />} />
          <Route path="/historico"   element={<History />} />
          <Route path="/status"      element={<StatusDisprol />} />
        </Routes>
      </Layout>
      <Toast />
    </>
  );
}
