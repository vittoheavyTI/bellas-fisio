import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Agenda from './pages/Agenda';
import AppointmentCard from './pages/AppointmentCard';
import SettingsPage from './pages/Settings';
import UsersPage from './pages/UsersPage';
import FinancialPage from './pages/FinancialPage';
import ProfilePage from './pages/ProfilePage';
import PdvPage from './pages/PdvPage';
import {
  LayoutDashboard, Users, Calendar, Settings as SettingsIcon,
  LogOut, FileText, UserCog, DollarSign, ChevronDown, User
} from 'lucide-react';

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Agenda', icon: Calendar, path: '/agenda' },
    { name: 'Pacientes', icon: Users, path: '/patients' },
    { name: 'Usuários', icon: UserCog, path: '/users' },
    { name: 'Financeiro', icon: DollarSign, path: '/financial' },
    { name: 'Relatórios', icon: FileText, path: '/appointment-card' },
    { name: 'Configurações', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', backgroundColor: 'white', borderRight: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50 }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#0ea5e9', borderRadius: '8px' }}></div>
          <h1 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#111827', letterSpacing: '-0.025em' }}>Bellas Fisio</h1>
        </div>

        <nav style={{ flex: 1, padding: '0 1rem', overflowY: 'auto' }}>
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
                color: location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)) ? '#0ea5e9' : '#64748b',
                backgroundColor: location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)) ? '#f0f9ff' : 'transparent',
                fontWeight: location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)) ? '700' : '500',
                marginBottom: '0.5rem',
                transition: 'all 0.2s',
                fontSize: '0.95rem'
              }}
            >
              <item.icon size={20} /> {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Header Bar with User Profile */}
        <header style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          padding: '0.75rem 2rem', backgroundColor: 'white',
          borderBottom: '1.5px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 40
        }}>
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0.75rem', borderRadius: '0.75rem',
                border: 'none', background: 'transparent',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '36px', height: '36px', backgroundColor: '#f1f5f9',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 'bold', color: '#64748b',
                fontSize: '0.9rem', overflow: 'hidden'
              }}>
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : user?.name?.[0]}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', lineHeight: '1.2' }}>{user?.name}</p>
                <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: '1.2' }}>{user?.role}</p>
              </div>
              <ChevronDown size={16} color="#94a3b8" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                backgroundColor: 'white', borderRadius: '0.75rem',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                border: '1px solid #f1f5f9', padding: '0.5rem',
                width: '200px', zIndex: 100
              }}>
                <Link
                  to="/users/me"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: '0.5rem',
                    textDecoration: 'none', color: '#374151',
                    fontSize: '0.875rem', fontWeight: '500',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <User size={18} /> Meu Perfil
                </Link>

                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.25rem 0' }} />
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: '0.5rem',
                    border: 'none', background: 'none',
                    color: '#ef4444', fontSize: '0.875rem', fontWeight: '600',
                    cursor: 'pointer', transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={18} /> Sair
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
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
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/users/me" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/financial" element={<ProtectedRoute><FinancialPage /></ProtectedRoute>} />
          <Route path="/pdv-principal" element={<ProtectedRoute><PdvPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
