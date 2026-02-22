import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Agenda from './pages/Agenda';
import AppointmentCard from './pages/AppointmentCard';
import SettingsPage from './pages/Settings';
import Sidebar from './components/Sidebar';
import GenericPage from './pages/GenericPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Sidebar>{children}</Sidebar> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Main Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Core App Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
          <Route path="/appointment-card" element={<ProtectedRoute><AppointmentCard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Agenda Group Routes */}
          <Route path="/agenda/cadastro" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/agenda/status" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/agenda/cancelamento" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/agenda/lembretes" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />

          {/* SMS Group Routes */}
          <Route path="/mensagens/sms/enviadas" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/mensagens/sms/recebidas" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/mensagens/sms/relacionario" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />

          {/* WhatsApp Group Routes */}
          <Route path="/mensagens/whatsapp/enviadas" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/mensagens/whatsapp/recebidas" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/mensagens/whatsapp/relacionario" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />

          {/* Financial Group Routes */}
          <Route path="/financeiro/pacotes" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/financeiro/resumo" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/financeiro/movimentos" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/financeiro/tiss" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/financeiro/notas-fiscais" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />

          {/* Reports Group Routes */}
          <Route path="/relatorios/atendimentos" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/relatorios/financeiros" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />

          {/* Settings Group Routes */}
          <Route path="/settings/profile" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/users" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/settings/printers" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/settings/backup" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />
          <Route path="/settings/equipment" element={<ProtectedRoute><GenericPage /></ProtectedRoute>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
