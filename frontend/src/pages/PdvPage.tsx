import React, { useState } from 'react';
import { ShoppingCart, Settings, FileText, Printer, BarChart3, CreditCard } from 'lucide-react';

const PdvPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('relatorios');

    // Mocks for settings
    const [settings, setSettings] = useState({
        printerType: 'termica',
        maxInstallments: 12,
        autoPrint: true
    });

    const cardStyle = {
        backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9'
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.025em' }}>PDV Principal</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Gestão avançada do Ponto de Venda, Configurações e Relatórios Diários.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('relatorios')}
                    style={{ background: activeTab === 'relatorios' ? '#f0f9ff' : 'transparent', color: activeTab === 'relatorios' ? '#0ea5e9' : '#64748b', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <BarChart3 size={18} /> Resumo de Vendas
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    style={{ background: activeTab === 'config' ? '#f0f9ff' : 'transparent', color: activeTab === 'config' ? '#0ea5e9' : '#64748b', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Settings size={18} /> Configurações do PDV
                </button>
                <button
                    onClick={() => setActiveTab('produtos')}
                    style={{ background: activeTab === 'produtos' ? '#f0f9ff' : 'transparent', color: activeTab === 'produtos' ? '#0ea5e9' : '#64748b', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ShoppingCart size={18} /> Cadastro Rápido de Produtos
                </button>
            </div>

            {activeTab === 'relatorios' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={20} color="#0ea5e9" /> Vendas Hoje
                        </h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827' }}>R$ 1.450,00</div>
                        <p style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', marginTop: '0.5rem' }}>+12% em relação a ontem</p>
                    </div>
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CreditCard size={20} color="#8b5cf6" /> Por Forma de Pagamento
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: '2' }}>
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>PIX:</span> <strong>R$ 800,00</strong></li>
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cartão de Crédito:</span> <strong>R$ 450,00</strong></li>
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cartão de Débito:</span> <strong>R$ 150,00</strong></li>
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dinheiro:</span> <strong>R$ 50,00</strong></li>
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'config' && (
                <div style={{ ...cardStyle, maxWidth: '600px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Printer size={20} color="#f59e0b" /> Preferências do Caixa
                    </h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Impressora Padrão</label>
                        <select
                            value={settings.printerType}
                            onChange={(e) => setSettings({ ...settings, printerType: e.target.value })}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }}
                        >
                            <option value="termica">Térmica 80mm (Cupom Fiscal/Não Fiscal)</option>
                            <option value="a4">Comum A4 (Nota Fiscal)</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Limite de Parcelas (Crédito)</label>
                        <input
                            type="number" min="1" max="12"
                            value={settings.maxInstallments}
                            onChange={(e) => setSettings({ ...settings, maxInstallments: Number(e.target.value) })}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.autoPrint}
                                onChange={(e) => setSettings({ ...settings, autoPrint: e.target.checked })}
                                style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
                            />
                            Imprimir comprovante automaticamente ao finalizar venda
                        </label>
                    </div>
                    <button style={{ marginTop: '2rem', width: '100%', padding: '1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                        Salvar Configurações
                    </button>
                </div>
            )}

            {activeTab === 'produtos' && (
                <div style={cardStyle}>
                    <p style={{ color: '#64748b' }}>Funcionalidade para cadastro rápido de serviços e produtos avulsos que aparecem no Modal do Dashboard PDV.</p>
                </div>
            )}
        </div>
    );
};

export default PdvPage;
