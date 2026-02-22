import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings as SettingsIcon,
    LogOut,
    FileText,
    MessageSquare,
    MessageCircle,
    DollarSign,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    Printer,
    Bell,
    Database,
    Cpu,
    User as UserIcon,
    UserCheck
} from 'lucide-react';

interface SubItem {
    name: string;
    path: string;
}

interface MenuItem {
    name: string;
    icon: React.ElementType;
    path?: string;
    subItems?: SubItem[];
    defaultOpen?: boolean;
}

const Sidebar = ({ children }: { children: React.ReactNode }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState<string[]>(['AGENDA']);

    const menuItems: MenuItem[] = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        {
            name: 'AGENDA',
            icon: Calendar,
            defaultOpen: true,
            subItems: [
                { name: 'Cadastro Agendamentos', path: '/agenda/cadastro' },
                { name: 'Status Agendamentos', path: '/agenda/status' },
                { name: 'Cancelamento Atendimentos', path: '/agenda/cancelamento' },
                { name: 'Lembretes Atendimentos', path: '/agenda/lembretes' },
            ]
        },
        {
            name: 'MENSAGENS (SMS)',
            icon: MessageSquare,
            subItems: [
                { name: 'Enviadas', path: '/mensagens/sms/enviadas' },
                { name: 'Recebidas', path: '/mensagens/sms/recebidas' },
                { name: 'Relacionário', path: '/mensagens/sms/relacionario' },
            ]
        },
        {
            name: 'MENSAGENS (WhatsApp)',
            icon: MessageCircle,
            subItems: [
                { name: 'Enviadas', path: '/mensagens/whatsapp/enviadas' },
                { name: 'Recebidas', path: '/mensagens/whatsapp/recebidas' },
                { name: 'Relacionário', path: '/mensagens/whatsapp/relacionario' },
            ]
        },
        {
            name: 'FINANCEIRO',
            icon: DollarSign,
            subItems: [
                { name: 'Pacotes Atendimentos', path: '/financeiro/pacotes' },
                { name: 'Resumo', path: '/financeiro/resumo' },
                { name: 'Movimentos', path: '/financeiro/movimentos' },
                { name: 'TISS', path: '/financeiro/tiss' },
                { name: 'Notas Fiscais (NFSe)', path: '/financeiro/notas-fiscais' },
            ]
        },
        {
            name: 'RELATÓRIOS',
            icon: FileText,
            subItems: [
                { name: 'Atendimentos', path: '/relatorios/atendimentos' },
                { name: 'Financeiros', path: '/relatorios/financeiros' },
            ]
        },
        { name: 'Pacientes', icon: Users, path: '/patients' },
        {
            name: 'CONFIGURAÇÕES',
            icon: SettingsIcon,
            subItems: [
                { name: 'Meu Perfil', path: '/settings/profile' },
                { name: 'Gestão Usuários', path: '/settings/users' },
                { name: 'Impressoras', path: '/settings/printers' },
                { name: 'Notificações', path: '/settings/notifications' },
                { name: 'Backup', path: '/settings/backup' },
                { name: 'Equipamentos Gerais', path: '/settings/equipment' },
            ]
        },
    ];

    const toggleGroup = (name: string) => {
        setOpenGroups(prev =>
            prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
        );
    };

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '0.75rem' }}>
                <div style={{ minWidth: '32px', height: '32px', backgroundColor: '#0ea5e9', borderRadius: '8px' }}></div>
                {!isCollapsed && <h1 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#111827', letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>Bellas Fisio</h1>}
            </div>

            <nav style={{ flex: 1, padding: '0 1rem', overflowY: 'auto' }}>
                {menuItems.map((item) => {
                    const isOpen = openGroups.includes(item.name);
                    const hasActiveChild = item.subItems?.some(sub => location.pathname === sub.path);
                    const isActive = location.pathname === item.path || hasActiveChild;

                    return (
                        <div key={item.name} style={{ marginBottom: '0.25rem' }}>
                            {item.subItems ? (
                                <>
                                    <button
                                        onClick={() => toggleGroup(item.name)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: isCollapsed ? 'center' : 'space-between',
                                            gap: '0.75rem',
                                            padding: '0.875rem 1rem',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                                            color: isActive ? '#0ea5e9' : '#64748b',
                                            fontWeight: isActive ? '700' : '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <item.icon size={20} />
                                            {!isCollapsed && <span style={{ fontSize: '0.875rem' }}>{item.name}</span>}
                                        </div>
                                        {!isCollapsed && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}

                                        {/* 3px blue line for open groups */}
                                        {isOpen && !isCollapsed && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: '1rem',
                                                right: '1rem',
                                                height: '3px',
                                                backgroundColor: '#0ea5e9',
                                                borderRadius: '3px 3px 0 0'
                                            }} />
                                        )}
                                    </button>

                                    {!isCollapsed && isOpen && (
                                        <div style={{ paddingLeft: '2.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {item.subItems.map(sub => (
                                                <Link
                                                    key={sub.path}
                                                    to={sub.path}
                                                    onClick={() => setIsMobileOpen(false)}
                                                    style={{
                                                        padding: '0.5rem 0.5rem',
                                                        fontSize: '0.825rem',
                                                        color: location.pathname === sub.path ? '#0ea5e9' : '#64748b',
                                                        textDecoration: 'none',
                                                        fontWeight: location.pathname === sub.path ? '700' : '500',
                                                        transition: 'color 0.2s'
                                                    }}
                                                >
                                                    • {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={item.path!}
                                    onClick={() => setIsMobileOpen(false)}
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
                                        transition: 'all 0.2s',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start'
                                    }}
                                >
                                    <item.icon size={20} />
                                    {!isCollapsed && <span style={{ fontSize: '0.875rem' }}>{item.name}</span>}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div style={{ padding: '1.5rem', borderTop: '1.5px solid #f1f5f9' }}>
                {!isCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{user?.name?.[0]}</div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.role}</p>
                        </div>
                    </div>
                )}
                <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #fee2e2', color: '#ef4444', backgroundColor: 'transparent', fontWeight: '600', cursor: 'pointer' }}>
                    <LogOut size={18} /> {!isCollapsed && 'Sair'}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Desktop Sidebar */}
            <aside style={{
                width: isCollapsed ? '80px' : '280px',
                backgroundColor: 'white',
                borderRight: '1.5px solid #f1f5f9',
                display: 'none', // Overwritten by media query in useEffect or style block
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                transition: 'width 0.3s ease',
                zIndex: 50,
                '@media (min-width: 1024px)': {
                    display: 'flex'
                }
            } as any}>
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                borderBottom: '1.5px solid #f1f5f9',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 40,
                '@media (min-width: 1024px)': {
                    display: 'none'
                }
            } as any}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#0ea5e9', borderRadius: '6px' }}></div>
                    <h1 style={{ fontWeight: '800', fontSize: '1rem', color: '#111827' }}>Bellas Fisio</h1>
                </div>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 100,
                    display: 'flex'
                }}>
                    <aside style={{ width: '280px', backgroundColor: 'white', height: '100%', position: 'relative' }}>
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', zIndex: 101 }}
                        >
                            <X size={24} />
                        </button>
                        <SidebarContent />
                    </aside>
                    <div style={{ flex: 1 }} onClick={() => setIsMobileOpen(false)}></div>
                </div>
            )}

            {/* Main Content */}
            <main style={{
                marginLeft: '0',
                flex: 1,
                paddingTop: '60px', // Header height on mobile
                '@media (min-width: 1024px)': {
                    marginLeft: isCollapsed ? '80px' : '280px',
                    paddingTop: 0
                }
            } as any}>
                {children}
            </main>

            <style>{`
        @media (max-width: 1023px) {
          aside { display: none !important; }
          main { margin-left: 0 !important; padding-top: 60px !important; }
        }
        @media (min-width: 1024px) {
          .mobile-header { display: none !important; }
          aside { display: flex !important; }
          main { padding-top: 0 !important; transition: margin-left 0.3s ease; }
        }
      `}</style>
        </div>
    );
};

export default Sidebar;
