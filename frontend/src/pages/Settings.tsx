import React, { useState, useEffect } from 'react';
import {
    User, Printer, Shield, Bell,
    HelpCircle, ChevronRight, Save, Database,
    Printer as PrinterIcon, Receipt, Trash2, Edit3, Plus,
    Lock, Mail, Phone, Camera, Download, Clock, Check
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:3000';

const SettingsPage: React.FC = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // --- Tab States ---
    // Profile
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        photoUrl: user?.photoUrl || ''
    });

    // Users
    const [users, setUsers] = useState<any[]>([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'RECEPTIONIST',
        phone: ''
    });

    // Printers
    const [printers, setPrinters] = useState({
        a4: localStorage.getItem('printer_a4') || 'Microsoft Print to PDF',
        thermal: localStorage.getItem('printer_thermal') || 'Nenhuma configurada'
    });

    // Notifications
    const [notifications, setNotifications] = useState({
        smsEnabled: true,
        whatsappEnabled: true,
        emailEnabled: false,
        reminderTime: '24'
    });

    // --- Effects ---
    useEffect(() => {
        if (activeTab === 'users' && (user?.role === 'OWNER' || user?.role === 'MANAGER')) {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Erro ao buscar usuários', err);
        }
    };

    const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    // --- Actions ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToUpdate: any = { ...profileData };
            if (!dataToUpdate.password) delete dataToUpdate.password;

            await axios.patch(`${API_URL}/users/${user?.id}`, dataToUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showAlert('Perfil atualizado com sucesso!');
        } catch (err) {
            showAlert('Erro ao atualizar perfil.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axios.patch(`${API_URL}/users/${editingUser.id}`, userData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showAlert('Usuário atualizado!');
            } else {
                await axios.post(`${API_URL}/users`, userData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showAlert('Usuário criado!');
            }
            setShowUserModal(false);
            fetchUsers();
            setUserData({ name: '', email: '', password: '', role: 'RECEPTIONIST', phone: '' });
            setEditingUser(null);
        } catch (err) {
            showAlert('Erro ao salvar usuário.', 'error');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Excluir este usuário permanentemente?')) return;
        try {
            await axios.delete(`${API_URL}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showAlert('Usuário excluído!');
            fetchUsers();
        } catch (err) {
            showAlert('Erro ao excluir usuário.', 'error');
        }
    };

    const handleBackup = async () => {
        try {
            window.open(`${API_URL}/system/backup`, '_blank');
            showAlert('Download do backup iniciado!');
        } catch (err) {
            showAlert('Erro ao gerar backup.', 'error');
        }
    };

    const savePrinters = () => {
        localStorage.setItem('printer_a4', printers.a4);
        localStorage.setItem('printer_thermal', printers.thermal);
        showAlert('Configurações de impressora salvas!');
    };

    const menuItems = [
        { id: 'profile', name: 'Meu Perfil', icon: User },
        { id: 'users', name: 'Gestão de Usuários', icon: Shield, hidden: user?.role !== 'OWNER' && user?.role !== 'MANAGER' },
        { id: 'printer', name: 'Impressoras', icon: Printer },
        { id: 'notifications', name: 'Notificações', icon: Bell },
        { id: 'system', name: 'Sistema e Backup', icon: Database, hidden: user?.role !== 'OWNER' },
    ];

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.025em' }}>Configurações</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.25rem' }}>Gerencie sua conta e as preferências da clínica</p>
                </div>
                {message.text && (
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                        color: message.type === 'success' ? '#16a34a' : '#ef4444',
                        border: `1.5px solid ${message.type === 'success' ? '#dcfce7' : '#fee2e2'}`,
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        {message.type === 'success' ? <Check size={18} /> : <Trash2 size={18} />}
                        {message.text}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '2.5rem' }}>
                {/* Navigation Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.filter(i => !i.hidden).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.25rem',
                                borderRadius: '1rem',
                                border: 'none',
                                backgroundColor: activeTab === item.id ? '#0ea5e9' : 'transparent',
                                color: activeTab === item.id ? 'white' : '#64748b',
                                fontWeight: activeTab === item.id ? '700' : '600',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeTab === item.id ? '0 10px 15px -3px rgba(14, 165, 233, 0.3)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                                {item.name}
                            </div>
                            {activeTab === item.id && <ChevronRight size={18} />}
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <main style={{
                    backgroundColor: 'white',
                    borderRadius: '1.5rem',
                    border: '1.5px solid #f1f5f9',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    padding: '2.5rem',
                    minHeight: '600px'
                }}>

                    {/* 1. MEU PERFIL */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Informações Pessoais</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Atualize sua foto e dados de contato</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Profile Picture Row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: '100px', height: '100px', borderRadius: '2rem', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                                            {profileData.photoUrl ? (
                                                <img src={profileData.photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <UserIcon size={40} color="#94a3b8" />
                                            )}
                                        </div>
                                        <button type="button" style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'white', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                            <Camera size={18} color="#0ea5e9" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: '700', color: '#334155', fontSize: '1rem' }}>Foto de Perfil</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.825rem', marginTop: '0.25rem' }}>JPG ou PNG. Tamanho máximo 2MB.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Nome Completo</label>
                                        <div style={{ position: 'relative' }}>
                                            <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>E-mail corporativo</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Telefone / WhatsApp</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="text"
                                                value={profileData.phone}
                                                onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="(00) 00000-0000"
                                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Alterar Senha ( deixe em branco para manter )</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="password"
                                                value={profileData.password}
                                                onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', borderTop: '1.5px solid #f1f5f9', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    disabled={loading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#0ea5e9', color: 'white', padding: '1rem 2.5rem', borderRadius: '1rem', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.4)', transition: 'transform 0.2s' }}
                                >
                                    <Save size={20} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* 2. GESTÃO DE USUÁRIOS */}
                    {activeTab === 'users' && (
                        <div>
                            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Gestão de Acessos</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Adicione e gerencie permissões dos membros da equipe</p>
                                </div>
                                <button
                                    onClick={() => { setEditingUser(null); setUserData({ name: '', email: '', password: '', role: 'RECEPTIONIST', phone: '' }); setShowUserModal(true); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0ea5e9', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                                >
                                    <Plus size={20} /> Novo Usuário
                                </button>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Usuário</th>
                                            <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Papel</th>
                                            <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Criado em</th>
                                            <th style={{ padding: '0 1rem', textAlign: 'right' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} style={{ backgroundColor: '#f8fafc', borderRadius: '1rem' }}>
                                                <td style={{ padding: '1rem', borderRadius: '1rem 0 0 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#64748b' }}>{u.name[0]}</div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{u.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '2rem',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '800',
                                                        backgroundColor: u.role === 'OWNER' ? '#fee2e2' : u.role === 'MANAGER' ? '#fef3c7' : '#f0f9ff',
                                                        color: u.role === 'OWNER' ? '#ef4444' : u.role === 'MANAGER' ? '#d97706' : '#0ea5e9'
                                                    }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1rem', borderRadius: '0 1rem 1rem 0', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => { setEditingUser(u); setUserData({ ...u, password: '' }); setShowUserModal(true); }}
                                                            style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}
                                                        ><Edit3 size={16} /></button>
                                                        {u.id !== user?.id && (
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer' }}
                                                            ><Trash2 size={16} /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 3. IMPRESSORAS */}
                    {activeTab === 'printer' && (
                        <div>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Dispositivos de Impressão</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Configure os destinos padrão para relatórios e cupons</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', border: '1.5px solid #f1f5f9', borderRadius: '1.25rem', transition: 'all 0.2s', ':hover': { borderColor: '#0ea5e9' } } as any}>
                                    <div style={{ width: '56px', height: '56px', backgroundColor: '#f0f9ff', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                                        <PrinterIcon size={28} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '0.25rem' }}>Impressora de Documentos (A4)</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>Destino padrão para Evoluções, Avaliações e Relatórios Financeiros.</p>
                                        <select
                                            value={printers.a4}
                                            onChange={e => setPrinters({ ...printers, a4: e.target.value })}
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600', color: '#1e293b' }}
                                        >
                                            <option>Microsoft Print to PDF</option>
                                            <option>HP LaserJet 400</option>
                                            <option>Brother HL-L2360D</option>
                                            <option>Epson L3150 Series</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', border: '1.5px solid #f1f5f9', borderRadius: '1.25rem' }}>
                                    <div style={{ width: '56px', height: '56px', backgroundColor: '#f0fdf4', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                        <Receipt size={28} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '0.25rem' }}>Impressora de Cupom (Térmica)</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>Destino para Recibos, Comprovantes de Agendamento e Mini-Relatórios.</p>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <select
                                                value={printers.thermal}
                                                onChange={e => setPrinters({ ...printers, thermal: e.target.value })}
                                                style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600', color: '#1e293b' }}
                                            >
                                                <option>ELGIN i9</option>
                                                <option>Bematech MP-4200</option>
                                                <option>Nenhuma configurada</option>
                                            </select>
                                            <button style={{ padding: '0 1.5rem', borderRadius: '0.75rem', backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: '700', border: '1.5px solid #dcfce7', cursor: 'pointer' }}>Testar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={savePrinters} style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.875rem 2rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Salvar Configurações</button>
                            </div>
                        </div>
                    )}

                    {/* 4. NOTIFICAÇÕES */}
                    {activeTab === 'notifications' && (
                        <div>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Central de Mensagens</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Configure como o sistema deve lembrar os pacientes</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { id: 'whatsappEnabled', name: 'Lembrete via WhatsApp', icon: MessageCircle, color: '#25D366' },
                                    { id: 'smsEnabled', name: 'Lembrete via SMS', icon: MessageSquare, color: '#0ea5e9' },
                                    { id: 'emailEnabled', name: 'Lembrete via E-mail', icon: Mail, color: '#ef4444' },
                                ].map(notif => (
                                    <div key={notif.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1.5px solid #f1f5f9', borderRadius: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ color: notif.color }}><notif.icon size={22} /></div>
                                            <span style={{ fontWeight: '700', color: '#334155' }}>{notif.name}</span>
                                        </div>
                                        <div
                                            onClick={() => setNotifications({ ...notifications, [notif.id]: !(notifications as any)[notif.id] })}
                                            style={{
                                                width: '48px', height: '26px', borderRadius: '20px',
                                                backgroundColor: (notifications as any)[notif.id] ? notif.color : '#e2e8f0',
                                                padding: '3px', cursor: 'pointer', transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', transition: 'transform 0.2s', transform: (notifications as any)[notif.id] ? 'translateX(22px)' : 'translateX(0)' }}></div>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        <Clock size={20} color="#64748b" />
                                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.9rem' }}>Antecedência do Lembrete</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {[
                                            { val: '2', label: '2 Horas' },
                                            { val: '12', label: '12 Horas' },
                                            { val: '24', label: '24 Horas' },
                                            { val: '48', label: '48 Horas' },
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => setNotifications({ ...notifications, reminderTime: opt.val })}
                                                style={{
                                                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                                    border: notifications.reminderTime === opt.val ? '2px solid #0ea5e9' : '1.5px solid #e2e8f0',
                                                    backgroundColor: notifications.reminderTime === opt.val ? '#f0f9ff' : 'white',
                                                    color: notifications.reminderTime === opt.val ? '#0ea5e9' : '#64748b',
                                                    fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem'
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. SISTEMA E BACKUP */}
                    {activeTab === 'system' && (
                        <div>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Segurança do Sistema</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Gerencie a cópia de segurança dos seus dados</p>
                            </div>

                            <div style={{ backgroundColor: '#fff7ed', border: '1.5px solid #ffedd5', padding: '1.5rem', borderRadius: '1.25rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontWeight: '800', color: '#9a3412', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={20} /> Recomendações de Backup
                                </h3>
                                <p style={{ color: '#c2410c', fontSize: '0.875rem', lineHeight: '1.5' }}>
                                    Recomendamos realizar o backup do seu banco de dados diariamente no final do expediente.
                                    O arquivo gerado (`.db`) contém todos os pacientes, agendamentos e registros financeiros.
                                </p>
                            </div>

                            <div style={{ border: '1.5px solid #f1f5f9', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', backgroundColor: '#f0f9ff', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', margin: '0 auto 1.5rem' }}>
                                    <Database size={32} />
                                </div>
                                <h4 style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Backup do Banco de Dados</h4>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>Último backup realizado: <strong>Hoje às 18:00</strong></p>
                                <button
                                    onClick={handleBackup}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#0ea5e9', color: 'white', padding: '1rem 2.5rem', borderRadius: '1rem', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.4)' }}
                                >
                                    <Download size={20} /> Baixar Cópia Geral (.db)
                                </button>
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#334155', marginBottom: '1rem' }}>Histórico de Atividades</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}><Check size={16} color="#10b981" /></div>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Backup concluído com sucesso</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{i} dia(s) atrás</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* USER MODAL */}
            {showUserModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '450px', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <form onSubmit={handleSaveUser}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                                <h3 style={{ fontWeight: '800', color: '#111827' }}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                                <button type="button" onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={22} /></button>
                            </div>
                            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem' }}>Nome Completo</label>
                                    <input required type="text" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem' }}>E-mail</label>
                                    <input required type="email" value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem' }}>Senha</label>
                                    <input required={!editingUser} type="password" value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} placeholder={editingUser ? 'Deixe em branco p/ manter' : ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '0.5rem' }}>Papel / Acesso</label>
                                    <select value={userData.role} onChange={e => setUserData({ ...userData, role: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }}>
                                        <option value="OWNER">Dono (Controle Total)</option>
                                        <option value="MANAGER">Gerente</option>
                                        <option value="PROFESSIONAL">Profissional / Fisioterapeuta</option>
                                        <option value="RECEPTIONIST">Recepcionista</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem 2rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowUserModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', background: '#0ea5e9', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Salvar Usuário</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 900px) {
                    div { grid-template-columns: 1fr !important; }
                    aside { flex-direction: row !important; overflow-x: auto; padding-bottom: 1rem; }
                    button { white-space: nowrap; }
                }
            `}</style>
        </div>
    );
};

// Placeholder icons to avoid errors if not imported correctly
const UserIcon = ({ size, color, style }: any) => <User size={size} color={color} style={style} />;
const X = ({ size }: any) => <ChevronRight size={size} style={{ transform: 'rotate(180deg)' }} />;

export default SettingsPage;
