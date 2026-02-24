import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar,
    MessageSquare,
    MessageCircle,
    DollarSign,
    FileText,
    Settings as SettingsIcon,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    LogOut,
    User as UserIcon,
    Shield,
    Database
} from 'lucide-react';

interface SubItem {
    name: string;
    path: string;
}

interface MenuItem {
    name: string;
    icon: React.ElementType;
    subItems?: SubItem[];
    defaultOpen?: boolean;
    color?: string;
}

const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState<string[]>(['AGENDAR']);

    const menuItems: MenuItem[] = [
        {
            name: 'AGENDAR',
            icon: Calendar,
            color: '#3B82F6',
            subItems: [
                { name: 'Cadastro Agendamentos', path: '/agenda' },
                { name: 'Status Agendamentos', path: '/agenda/status' },
                { name: 'Cancelamento', path: '/agenda/cancelamento' },
                { name: 'Lembretes', path: '/agenda/lembretes' },
            ]
        },
        {
            name: 'MENSAGENS SMS',
            icon: MessageSquare,
            color: '#64748B',
            subItems: [
                { name: 'Enviadas', path: '/mensagens/sms/enviadas' },
                { name: 'Recebidas', path: '/mensagens/sms/recebidas' },
                { name: 'Relacionário', path: '/mensagens/sms/relacionario' },
            ]
        },
        {
            name: 'MENSAGENS WhatsApp',
            icon: MessageCircle,
            color: '#64748B',
            subItems: [
                { name: 'Enviadas', path: '/mensagens/whatsapp/enviadas' },
                { name: 'Recebidas', path: '/mensagens/whatsapp/recebidas' },
                { name: 'Relacionário', path: '/mensagens/whatsapp/relacionario' },
            ]
        },
        {
            name: 'FINANCEIRO',
            icon: DollarSign,
            color: '#64748B',
            subItems: [
                { name: 'Pacotes', path: '/financeiro/pacotes' },
                { name: 'Resumo', path: '/financeiro/resumo' },
                { name: 'Movimentos', path: '/financeiro/movimentos' },
                { name: 'TISS', path: '/financeiro/tiss' },
                { name: 'Notas Fiscais', path: '/financeiro/notas-fiscais' },
            ]
        },
        {
            name: 'RELATÓRIOS',
            icon: FileText,
            color: '#64748B',
            subItems: [
                { name: 'Atendimentos', path: '/relatorios/atendimentos' },
                { name: 'Financeiros', path: '/relatorios/financeiros' },
            ]
        },
        {
            name: 'CONFIGURAÇÕES',
            icon: SettingsIcon,
            color: '#64748B',
            subItems: [
                { name: 'Meu Perfil', path: '/settings/profile' },
                { name: 'Usuários', path: '/settings/users' },
                { name: 'Backup', path: '/settings/backup' },
            ]
        },
    ];

    const toggleGroup = (name: string) => {
        setOpenGroups(prev =>
            prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
        );
    };

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 24px' }}>
            {/* Logo */}
            <div style={{ padding: '8px 0 32px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: '#3B82F6',
                    margin: 0
                }}>
                    Bellas Fisio
                </h1>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', margin: '0 -8px', padding: '0 8px' }}>
                {menuItems.map((item) => {
                    const isOpen = openGroups.includes(item.name);
                    const isActive = item.name === 'AGENDAR'; // For demonstration as per request

                    return (
                        <div key={item.name} style={{ marginBottom: '4px' }}>
                            <button
                                onClick={() => toggleGroup(item.name)}
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: isActive ? '#3B82F6' : '#475569',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <item.icon size={18} color={isActive ? '#3B82F6' : '#64748B'} />
                                    <span>{item.name}</span>
                                </div>
                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}

                                {isOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '20px',
                                        right: '20px',
                                        height: '2px',
                                        backgroundColor: '#3B82F6'
                                    }} />
                                )}
                            </button>

                            {isOpen && (
                                <div style={{ paddingLeft: '32px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {item.subItems?.map(sub => (
                                        <Link
                                            key={sub.path}
                                            to={sub.path}
                                            onClick={() => setIsMobileOpen(false)}
                                            style={{
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 12px',
                                                fontSize: '13px',
                                                color: '#64748B',
                                                textDecoration: 'none',
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 400,
                                                borderRadius: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ marginTop: 'auto', padding: '16px 0', borderTop: '1px solid #E2E8F0' }}>
                <button
                    onClick={logout}
                    style={{
                        width: '100%',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0 20px',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#EF4444',
                        backgroundColor: 'transparent',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    <LogOut size={18} /> Sair
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            {/* Desktop Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: '#F8FAFC',
                borderRight: '1px solid #E2E8F0',
                display: 'none',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50
            }} className="desktop-sidebar">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                backgroundColor: 'white',
                borderBottom: '1px solid #E2E8F0',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 40
            }} className="mobile-header">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                    <Menu size={24} />
                </button>
                <h1 style={{ fontWeight: 700, fontSize: '18px', color: '#3B82F6', margin: 0 }}>Bellas Fisio</h1>
                <div style={{ width: '24px' }}></div>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    zIndex: 100,
                    display: 'flex',
                    backdropFilter: 'blur(2px)'
                }} onClick={() => setIsMobileOpen(false)}>
                    <aside
                        style={{
                            width: '85%',
                            maxWidth: '320px',
                            backgroundColor: '#F8FAFC',
                            height: '100%',
                            position: 'relative',
                            boxShadow: '10px 0 15px -3px rgba(0,0,0,0.1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', zIndex: 101 }}
                        >
                            <X size={24} />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main style={{
                flex: 1,
                width: '100%',
                transition: 'margin-left 0.3s ease'
            }} className="main-content">
                {children}
            </main>

            <style>{`
                @media (min-width: 1024px) {
                    .desktop-sidebar { display: flex !important; }
                    .mobile-header { display: none !important; }
                    .main-content { margin-left: 260px; }
                }
                @media (max-width: 1023px) {
                    .desktop-sidebar { display: none !important; }
                    .mobile-header { display: flex !important; }
                    .main-content { margin-left: 0; padding-top: 56px; }
                }

                /* Custom Scrollbar */
                nav::-webkit-scrollbar { width: 4px; }
                nav::-webkit-scrollbar-track { background: transparent; }
                nav::-webkit-scrollbar-thumb { background: #E2E8F0; borderRadius: 10px; }
            `}</style>
        </div>
    );
};

export default Sidebar;
