import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Agenda from './pages/Agenda';
import AppointmentCard from './pages/AppointmentCard';
import SettingsPage from './pages/Settings';
import { LayoutDashboard, Users, Calendar, Settings as SettingsIcon, LogOut, FileText } from 'lucide-react';

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Agenda', icon: Calendar, path: '/agenda' },
    { name: 'Relatórios', icon: FileText, path: '/appointment-card' },
    { name: 'Pacientes', icon: Users, path: '/patients' },
    { name: 'Sistemas', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ width: '280px', backgroundColor: 'white', borderRight: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#0ea5e9', borderRadius: '8px' }}></div>
          <h1 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#111827', letterSpacing: '-0.025em' }}>Bellas Fisio</h1>
        </div>

        <nav style={{ flex: 1, padding: '0 1rem' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: location.pathname === item.path ? '#0ea5e9' : '#64748b',
                backgroundColor: location.pathname === item.path ? '#f0f9ff' : 'transparent',
                fontWeight: location.pathname === item.path ? '700' : '500',
                marginBottom: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <item.icon size={20} /> {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1.5px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{user?.name?.[0]}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #fee2e2', color: '#ef4444', backgroundColor: 'transparent', fontWeight: '600', cursor: 'pointer' }}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: '280px', flex: 1 }}>
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Sidebar>{children}</Sidebar> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
          <Route path="/appointment-card" element={<ProtectedRoute><AppointmentCard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
