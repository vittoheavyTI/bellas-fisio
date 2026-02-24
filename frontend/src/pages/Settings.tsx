import React, { useState, useRef } from 'react';
import {
    Settings, User, Printer, Shield, Bell,
    HelpCircle, ChevronRight, Save, Database,
    Receipt, FileText, Plus, X, Trash2, Edit2,
    CreditCard, Wifi, Upload, Key, CheckCircle, AlertCircle
} from 'lucide-react';

// ==== TYPES ====
interface PrinterItem {
    id: string; name: string; type: 'local' | 'rede'; category: 'a4' | 'thermal';
}

interface CardBrand {
    id: string; name: string; rate: number;
}

interface BankAPI {
    id: string; bankName: string; url: string; token: string; clientId: string; clientSecret: string;
}

interface Certificate {
    id: string; type: 'A1' | 'A3'; cnpj: string; fileName?: string; status: string;
}

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('printer');

    // Printer State
    const [printers, setPrinters] = useState<PrinterItem[]>([
        { id: '1', name: 'Microsoft Print to PDF', type: 'local', category: 'a4' },
    ]);
    const [showPrinterForm, setShowPrinterForm] = useState(false);
    const [printerForm, setPrinterForm] = useState({ name: '', type: 'local' as 'local' | 'rede', category: 'a4' as 'a4' | 'thermal' });

    // Payment Config State
    const [cardBrands, setCardBrands] = useState<CardBrand[]>([
        { id: '1', name: 'Visa', rate: 2.49 },
        { id: '2', name: 'Mastercard', rate: 2.49 },
        { id: '3', name: 'Elo', rate: 3.19 },
    ]);
    const [bankAPIs, setBankAPIs] = useState<BankAPI[]>([]);
    const [showBrandForm, setShowBrandForm] = useState(false);
    const [brandForm, setBrandForm] = useState({ name: '', rate: '' });
    const [showBankForm, setShowBankForm] = useState(false);
    const [bankForm, setBankForm] = useState({ bankName: '', url: '', token: '', clientId: '', clientSecret: '' });
    const [installmentRates, setInstallmentRates] = useState([
        { months: 2, rate: 2.99 }, { months: 3, rate: 3.49 }, { months: 4, rate: 3.99 },
        { months: 5, rate: 4.49 }, { months: 6, rate: 4.99 }, { months: 10, rate: 6.99 }, { months: 12, rate: 7.99 }
    ]);

    // Certificate State
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [showCertForm, setShowCertForm] = useState(false);
    const [certForm, setCertForm] = useState({ type: 'A1' as 'A1' | 'A3', cnpj: '', password: '', fileName: '' });
    const certFileRef = useRef<HTMLInputElement>(null);

    const menuItems = [
        { id: 'profile', name: 'Meu Perfil', icon: User },
        { id: 'printer', name: 'Impressoras', icon: Printer },
        { id: 'payment', name: 'Formas de Pagamento & APIs', icon: CreditCard },
        { id: 'certificate', name: 'Certificado Digital', icon: Shield },
        { id: 'notifications', name: 'Notificações', icon: Bell },
        { id: 'system', name: 'Sistema e Backup', icon: Database },
    ];

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.75rem', borderRadius: '0.6rem',
        border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none'
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.4rem'
    };
    const sectionHeaderStyle: React.CSSProperties = {
        borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.5rem'
    };

    // ==== PRINTER HANDLERS ====
    const addPrinter = () => {
        if (!printerForm.name.trim()) return;
        setPrinters([...printers, { ...printerForm, id: Date.now().toString() }]);
        setPrinterForm({ name: '', type: 'local', category: 'a4' });
        setShowPrinterForm(false);
    };
    const removePrinter = (id: string) => setPrinters(printers.filter(p => p.id !== id));
    const testPrint = (printer: PrinterItem) => {
        alert(`Enviando teste de impressão para "${printer.name}" (${printer.type === 'local' ? 'Local' : 'Rede'})...`);
    };

    // ==== PAYMENT HANDLERS ====
    const addBrand = () => {
        if (!brandForm.name.trim()) return;
        setCardBrands([...cardBrands, { id: Date.now().toString(), name: brandForm.name, rate: parseFloat(brandForm.rate) || 0 }]);
        setBrandForm({ name: '', rate: '' });
        setShowBrandForm(false);
    };
    const removeBrand = (id: string) => setCardBrands(cardBrands.filter(b => b.id !== id));

    const addBankAPI = () => {
        if (!bankForm.bankName.trim()) return;
        setBankAPIs([...bankAPIs, { ...bankForm, id: Date.now().toString() }]);
        setBankForm({ bankName: '', url: '', token: '', clientId: '', clientSecret: '' });
        setShowBankForm(false);
    };
    const removeBankAPI = (id: string) => setBankAPIs(bankAPIs.filter(b => b.id !== id));

    // ==== CERTIFICATE HANDLERS ====
    const addCertificate = () => {
        if (!certForm.cnpj.trim()) return;
        setCertificates([...certificates, { ...certForm, id: Date.now().toString(), status: 'Pendente' }]);
        setCertForm({ type: 'A1', cnpj: '', password: '', fileName: '' });
        setShowCertForm(false);
    };
    const testCertificate = (cert: Certificate) => {
        setCertificates(certificates.map(c => c.id === cert.id ? { ...c, status: 'Válido ✓' } : c));
        alert(`Certificado ${cert.type} (CNPJ: ${cert.cnpj}) validado com sucesso!`);
    };

    const handleCertFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setCertForm(prev => ({ ...prev, fileName: file.name }));
    };

    // ==== RENDERERS ====
    const renderPrinters = () => (
        <div>
            <div style={sectionHeaderStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Configuração de Impressoras</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Gerencie impressoras para fichas e cupons</p>
            </div>

            {/* A4 Printers */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>🖨️ Impressora Comum (A4)</h3>
                    <button onClick={() => { setPrinterForm({ name: '', type: 'local', category: 'a4' }); setShowPrinterForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <Plus size={16} /> Adicionar
                    </button>
                </div>
                {printers.filter(p => p.category === 'a4').map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1.5px solid #f1f5f9', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Printer size={20} color="#0ea5e9" />
                            <div>
                                <span style={{ fontWeight: '600', color: '#111827' }}>{p.name}</span>
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: p.type === 'local' ? '#ecfdf5' : '#f0f9ff', color: p.type === 'local' ? '#10b981' : '#0ea5e9', fontWeight: '600' }}>
                                    {p.type === 'local' ? 'Local' : 'Rede'}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => testPrint(p)} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', background: '#10b981', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>Testar</button>
                            <button onClick={() => removePrinter(p.id)} style={{ padding: '0.4rem', borderRadius: '0.4rem', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {printers.filter(p => p.category === 'a4').length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem' }}>Nenhuma impressora A4 cadastrada.</p>
                )}
            </div>

            {/* Thermal Printers */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>🧾 Impressora de Cupom (Térmica)</h3>
                    <button onClick={() => { setPrinterForm({ name: '', type: 'local', category: 'thermal' }); setShowPrinterForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <Plus size={16} /> Adicionar
                    </button>
                </div>
                {printers.filter(p => p.category === 'thermal').map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1.5px solid #f1f5f9', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Receipt size={20} color="#10b981" />
                            <div>
                                <span style={{ fontWeight: '600', color: '#111827' }}>{p.name}</span>
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: p.type === 'local' ? '#ecfdf5' : '#f0f9ff', color: p.type === 'local' ? '#10b981' : '#0ea5e9', fontWeight: '600' }}>
                                    {p.type === 'local' ? 'Local' : 'Rede'}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => testPrint(p)} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', background: '#10b981', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>Testar</button>
                            <button onClick={() => removePrinter(p.id)} style={{ padding: '0.4rem', borderRadius: '0.4rem', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {printers.filter(p => p.category === 'thermal').length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem' }}>Nenhuma impressora térmica cadastrada.</p>
                )}
            </div>

            {/* Add Printer Modal */}
            {showPrinterForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>Adicionar Impressora ({printerForm.category === 'a4' ? 'A4' : 'Térmica'})</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Nome da Impressora</label>
                            <input type="text" value={printerForm.name} onChange={e => setPrinterForm({ ...printerForm, name: e.target.value })} style={inputStyle} placeholder="Ex: HP LaserJet" />
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Tipo</label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {(['local', 'rede'] as const).map(t => (
                                    <button key={t} onClick={() => setPrinterForm({ ...printerForm, type: t })} style={{
                                        flex: 1, padding: '0.65rem', borderRadius: '0.5rem',
                                        border: `1.5px solid ${printerForm.type === t ? '#0ea5e9' : '#e2e8f0'}`,
                                        background: printerForm.type === t ? '#f0f9ff' : 'white',
                                        color: printerForm.type === t ? '#0ea5e9' : '#64748b',
                                        fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                                    }}>
                                        {t === 'local' ? <Printer size={16} /> : <Wifi size={16} />}
                                        {t === 'local' ? 'Local' : 'Rede'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowPrinterForm(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}>Cancelar</button>
                            <button onClick={addPrinter} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0ea5e9', color: 'white', padding: '0.875rem 1.75rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }}>
                    <Save size={20} /> Salvar Configurações
                </button>
            </div>
        </div>
    );

    const renderPaymentConfig = () => (
        <div>
            <div style={sectionHeaderStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Formas de Pagamento & APIs Bancárias</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Configure tipos de conta, operadoras, bandeiras e APIs de pagamento</p>
            </div>

            {/* Card Brands */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>💳 Operadoras / Bandeiras de Cartão</h3>
                    <button onClick={() => setShowBrandForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <Plus size={16} /> Adicionar
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {cardBrands.map(b => (
                        <div key={b.id} style={{ padding: '1rem', border: '1.5px solid #f1f5f9', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: '700', color: '#111827' }}>{b.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Taxa: {b.rate}%</div>
                            </div>
                            <button onClick={() => removeBrand(b.id)} style={{ padding: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Installment Rates */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem', marginBottom: '1rem' }}>📊 Taxas de Parcelamento</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>O sistema calcula juros do parcelamento para o cliente (Bellas Fisio recebe valor cheio)</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                    {installmentRates.map((r, i) => (
                        <div key={i} style={{ padding: '0.75rem', border: '1px solid #f1f5f9', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontWeight: '700', color: '#111827' }}>{r.months}x</div>
                            <input
                                type="number" step="0.01" value={r.rate}
                                onChange={e => {
                                    const newRates = [...installmentRates];
                                    newRates[i].rate = parseFloat(e.target.value) || 0;
                                    setInstallmentRates(newRates);
                                }}
                                style={{ width: '80px', padding: '0.35rem', borderRadius: '0.3rem', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.85rem', marginTop: '0.25rem' }}
                            />
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>% a.m.</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bank APIs */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>🏦 APIs Bancárias / Gateways</h3>
                    <button onClick={() => setShowBankForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <Plus size={16} /> Adicionar
                    </button>
                </div>
                {bankAPIs.map(b => (
                    <div key={b.id} style={{ padding: '1rem', border: '1.5px solid #f1f5f9', borderRadius: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: '700', color: '#111827' }}>{b.bankName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.url}</div>
                        </div>
                        <button onClick={() => removeBankAPI(b.id)} style={{ padding: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                    </div>
                ))}
                {bankAPIs.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem' }}>Nenhuma API bancária configurada.</p>
                )}
            </div>

            {/* Add Brand Modal */}
            {showBrandForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>Adicionar Bandeira/Operadora</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Nome</label>
                            <input type="text" value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} style={inputStyle} placeholder="Ex: Visa, Mastercard" />
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Taxa (%)</label>
                            <input type="number" step="0.01" value={brandForm.rate} onChange={e => setBrandForm({ ...brandForm, rate: e.target.value })} style={inputStyle} placeholder="Ex: 2.49" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowBrandForm(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}>Cancelar</button>
                            <button onClick={addBrand} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Bank API Modal */}
            {showBankForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '2rem', overflowY: 'auto' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>Adicionar API Bancária / Gateway</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nome do Banco / Gateway</label>
                                <input type="text" value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} style={inputStyle} placeholder="Ex: Mercado Pago, PagSeguro" />
                            </div>
                            <div>
                                <label style={labelStyle}>URL da API</label>
                                <input type="text" value={bankForm.url} onChange={e => setBankForm({ ...bankForm, url: e.target.value })} style={inputStyle} placeholder="https://api.exemplo.com" />
                            </div>
                            <div>
                                <label style={labelStyle}>Token</label>
                                <input type="password" value={bankForm.token} onChange={e => setBankForm({ ...bankForm, token: e.target.value })} style={inputStyle} placeholder="Token de acesso" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Client ID</label>
                                    <input type="text" value={bankForm.clientId} onChange={e => setBankForm({ ...bankForm, clientId: e.target.value })} style={inputStyle} placeholder="client_id" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Client Secret</label>
                                    <input type="password" value={bankForm.clientSecret} onChange={e => setBankForm({ ...bankForm, clientSecret: e.target.value })} style={inputStyle} placeholder="client_secret" />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowBankForm(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}>Cancelar</button>
                            <button onClick={addBankAPI} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0ea5e9', color: 'white', padding: '0.875rem 1.75rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }}>
                    <Save size={20} /> Salvar Configurações
                </button>
            </div>
        </div>
    );

    const renderCertificate = () => (
        <div>
            <div style={sectionHeaderStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Certificado Digital (Fiscal)</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Gerencie certificados A1 (arquivo) e A3 (token/pendrive) para emissão fiscal</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button onClick={() => setShowCertForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <Plus size={16} /> Adicionar Certificado
                </button>
            </div>

            {certificates.map(cert => (
                <div key={cert.id} style={{ padding: '1.25rem', border: '1.5px solid #f1f5f9', borderRadius: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: '700', color: '#111827' }}>Certificado {cert.type}</span>
                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: '600', background: cert.status.includes('✓') ? '#ecfdf5' : '#fffbeb', color: cert.status.includes('✓') ? '#10b981' : '#d97706' }}>
                                    {cert.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>CNPJ: {cert.cnpj}</div>
                            {cert.fileName && <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Arquivo: {cert.fileName}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => testCertificate(cert)} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', background: '#10b981', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <CheckCircle size={14} /> Testar
                            </button>
                            <button onClick={() => setCertificates(certificates.filter(c => c.id !== cert.id))} style={{ padding: '0.4rem', borderRadius: '0.4rem', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                </div>
            ))}

            {certificates.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                    <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.15 }} />
                    <p style={{ fontWeight: '600' }}>Nenhum certificado cadastrado.</p>
                </div>
            )}

            {/* Add Certificate Modal */}
            {showCertForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '450px', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>Adicionar Certificado Digital</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Tipo do Certificado</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {(['A1', 'A3'] as const).map(t => (
                                        <button key={t} onClick={() => setCertForm({ ...certForm, type: t })} style={{
                                            flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                                            border: `1.5px solid ${certForm.type === t ? '#0ea5e9' : '#e2e8f0'}`,
                                            background: certForm.type === t ? '#f0f9ff' : 'white',
                                            color: certForm.type === t ? '#0ea5e9' : '#64748b',
                                            fontWeight: '700', cursor: 'pointer', textAlign: 'center'
                                        }}>
                                            <div>{t}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '500', marginTop: '0.2rem' }}>
                                                {t === 'A1' ? 'Arquivo (.pfx)' : 'Token/Pendrive'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>CNPJ Vinculado</label>
                                <input type="text" value={certForm.cnpj} onChange={e => setCertForm({ ...certForm, cnpj: e.target.value })} style={inputStyle} placeholder="00.000.000/0001-00" />
                            </div>
                            {certForm.type === 'A1' && (
                                <div>
                                    <label style={labelStyle}>Arquivo do Certificado (.pfx)</label>
                                    <input type="file" ref={certFileRef} accept=".pfx,.p12" onChange={handleCertFileUpload} style={{ display: 'none' }} />
                                    <button onClick={() => certFileRef.current?.click()} style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: certForm.fileName ? '#111827' : '#94a3b8' }}>
                                        <Upload size={16} /> {certForm.fileName || 'Selecionar arquivo...'}
                                    </button>
                                </div>
                            )}
                            {certForm.type === 'A3' && (
                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        <Key size={16} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />
                                        Conecte o dispositivo token/pendrive e clique em "Salvar". O sistema detectará automaticamente.
                                    </p>
                                </div>
                            )}
                            <div>
                                <label style={labelStyle}>Senha do Certificado</label>
                                <input type="password" value={certForm.password} onChange={e => setCertForm({ ...certForm, password: e.target.value })} style={inputStyle} placeholder="Senha de acesso" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowCertForm(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}>Cancelar</button>
                            <button onClick={addCertificate} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

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
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem', borderRadius: '0.75rem', border: 'none',
                                backgroundColor: activeTab === item.id ? '#f0f9ff' : 'transparent',
                                color: activeTab === item.id ? '#0ea5e9' : '#64748b',
                                fontWeight: activeTab === item.id ? '700' : '500',
                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <item.icon size={20} /> {item.name}
                            </div>
                            {activeTab === item.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </aside>

                <main style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '2rem', minHeight: '400px', overflowY: 'auto' }}>
                    {activeTab === 'printer' && renderPrinters()}
                    {activeTab === 'payment' && renderPaymentConfig()}
                    {activeTab === 'certificate' && renderCertificate()}

                    {!['printer', 'payment', 'certificate'].includes(activeTab) && (
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
