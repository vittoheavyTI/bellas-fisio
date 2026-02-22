import React, { useState } from 'react';
import {
    Settings, User, Printer, Shield, Bell,
    HelpCircle, ChevronRight, Save, Database,
    Printer as PrinterIcon, Receipt, FileText
} from 'lucide-react';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('printer');

    const menuItems = [
        { id: 'profile', name: 'Meu Perfil', icon: User },
        { id: 'users', name: 'Gestão de Usuários', icon: Shield },
        { id: 'printer', name: 'Impressoras', icon: Printer },
        { id: 'notifications', name: 'Notificações', icon: Bell },
        { id: 'system', name: 'Sistema e Backup', icon: Database },
    ];

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#111827' }}>Configurações</h1>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Personalize o sistema e configure periféricos</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                backgroundColor: activeTab === item.id ? '#f0f9ff' : 'transparent',
                                color: activeTab === item.id ? '#0ea5e9' : '#64748b',
                                fontWeight: activeTab === item.id ? '700' : '500',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <item.icon size={20} />
                                {item.name}
                            </div>
                            {activeTab === item.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </aside>

                <main style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
                    {activeTab === 'printer' && (
                        <div>
                            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Configuração de Impressoras</h2>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Configure o destino de impressão para fichas e cupons</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', border: '1.5px solid #f1f5f9', borderRadius: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#f0f9ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                                        <PrinterIcon size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>Impressora Comum (A4)</h3>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Utilizada para Fichas de Avaliação e Evolução</p>
                                        <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                                            <option>Microsoft Print to PDF</option>
                                            <option>HP LaserJet Professional</option>
                                            <option>Adicionar nova impressora...</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', border: '1.5px solid #f1f5f9', borderRadius: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                        <Receipt size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>Impressora de Cupom (Térmica)</h3>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Utilizada para recibos e comprovantes não-fiscais</p>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <select style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                                                <option>ELGIN i9</option>
                                                <option>Bematech MP-4200</option>
                                                <option>Nenhuma configurada</option>
                                            </select>
                                            <button style={{ padding: '0 1.5rem', borderRadius: '0.5rem', backgroundColor: '#10b981', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Testar PDV</button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', border: '1.5px solid #f1f5f9', borderRadius: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#fff7ed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                        <Shield size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>Certificado Digital (Fiscal)</h3>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Necessário para emissão de Notas Fiscais (NFS-e / NFC-e)</p>
                                        <button style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1.5px solid #f59e0b', color: '#f59e0b', backgroundColor: 'transparent', fontWeight: '600', cursor: 'pointer' }}>Carregar Certificado A1 (.pfx)</button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0ea5e9', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }}>
                                    <Save size={20} /> Salvar Configurações
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'printer' && (
                        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
                            <HelpCircle size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <h3 style={{ fontWeight: '700', color: '#64748b' }}>Em desenvolvimento</h3>
                            <p style={{ fontSize: '0.875rem' }}>Esta aba de configurações estará disponível em breve.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
