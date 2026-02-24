import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
    Users, Calendar, TrendingUp, TrendingDown, DollarSign,
    Clock, CheckCircle, AlertCircle, CreditCard, Receipt,
    Truck, FileText, BarChart3, ShoppingCart, X, Plus,
    Minus, Search, Printer, QrCode, Download, Filter, UserPlus
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// ==== TYPES ====
interface Product {
    id: string; name: string; price: number; category?: string;
}

interface CartItem {
    product: Product; quantity: number; unitPrice: number;
}

interface PaymentRecord {
    type: string; amount: number; date: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    // Stats
    const [stats, setStats] = useState({
        patients: 0, appointmentsToday: 0, appointmentsWeek: 0,
        completedToday: 0, cancelledToday: 0, revenue: 0,
        totalReceivable: 0, totalPayable: 0,
        dailyRevenue: 0, weeklyRevenue: 0, monthlyRevenue: 0,
        pendingPayables: 0, overduePayables: 0, suppliersCount: 0,
        paymentsByType: { pix: 0, cash: 0, debit: 0, credit: 0 } as Record<string, number>
    });

    // PDV State
    const [showPDV, setShowPDV] = useState(false);
    const [pdvSearch, setPdvSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [pdvStep, setPdvStep] = useState<'products' | 'payment' | 'receipt'>('products');
    const [selectedPayMethod, setSelectedPayMethod] = useState('');
    const [installments, setInstallments] = useState(1);
    const [cashAmount, setCashAmount] = useState('');
    const [selectedPrinter, setSelectedPrinter] = useState('Cupom Não Fiscal');
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    // Patient Search in PDV
    const [patientsList, setPatientsList] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');

    // Finalization Flags
    const [sendWhats, setSendWhats] = useState(true);
    const [sendEmail, setSendEmail] = useState(false);
    const [sendSms, setSendSms] = useState(false);

    // Mock products
    const [products] = useState<Product[]>([
        { id: '1', name: 'Consulta Fisioterapia', price: 120.00, category: 'Serviço' },
        { id: '2', name: 'Sessão Pilates', price: 80.00, category: 'Serviço' },
        { id: '3', name: 'Avaliação Postural', price: 150.00, category: 'Serviço' },
        { id: '4', name: 'Acupuntura', price: 100.00, category: 'Serviço' },
        { id: '5', name: 'RPG - Sessão', price: 90.00, category: 'Serviço' },
        { id: '6', name: 'Pacote 10 Sessões Fisio', price: 1000.00, category: 'Pacote' },
        { id: '7', name: 'Faixa Elástica', price: 25.00, category: 'Produto' },
        { id: '8', name: 'Bola Suíça', price: 45.00, category: 'Produto' },
    ]);

    // Reports State
    const [showReports, setShowReports] = useState(false);
    const [reportPeriod, setReportPeriod] = useState<'day' | 'week' | 'month'>('day');

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [patientsRes, appointmentsRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/appointments')
                ]);
                setPatientsList(patientsRes.data || []);
                const today = new Date().toDateString();
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 86400000);
                const todayApps = appointmentsRes.data.filter((a: any) => new Date(a.startTime).toDateString() === today);
                const weekApps = appointmentsRes.data.filter((a: any) => new Date(a.startTime) >= weekAgo);

                let financialData: any[] = [];
                try { const r = await api.get('/financial/transactions'); financialData = r.data; } catch { }

                const revenues = financialData.filter(t => t.type === 'REVENUE');
                const expenses = financialData.filter(t => t.type === 'EXPENSE');
                const todayStr = now.toISOString().split('T')[0];
                const weekAgoStr = weekAgo.toISOString().split('T')[0];
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

                const countByPayMethod = (data: any[], method: string) => data.filter(t => t.paymentMethod === method).length;

                setStats({
                    patients: patientsRes.data.length,
                    appointmentsToday: todayApps.length,
                    appointmentsWeek: weekApps.length,
                    completedToday: todayApps.filter((a: any) => a.status === 'COMPLETED').length,
                    cancelledToday: todayApps.filter((a: any) => a.status === 'CANCELLED').length,
                    revenue: revenues.reduce((s: number, t: any) => s + t.amount, 0),
                    totalReceivable: revenues.reduce((s: number, t: any) => s + t.amount, 0),
                    totalPayable: expenses.reduce((s: number, t: any) => s + t.amount, 0),
                    dailyRevenue: revenues.filter((t: any) => t.date?.startsWith(todayStr)).reduce((s: number, t: any) => s + t.amount, 0),
                    weeklyRevenue: revenues.filter((t: any) => t.date >= weekAgoStr).reduce((s: number, t: any) => s + t.amount, 0),
                    monthlyRevenue: revenues.filter((t: any) => t.date >= monthStart).reduce((s: number, t: any) => s + t.amount, 0),
                    pendingPayables: expenses.filter((t: any) => t.status === 'PENDING').length,
                    overduePayables: expenses.filter((t: any) => t.status === 'OVERDUE').length,
                    suppliersCount: [...new Set(financialData.filter(t => t.supplier).map(t => t.supplier))].length,
                    paymentsByType: {
                        pix: countByPayMethod(revenues, 'PIX'),
                        cash: countByPayMethod(revenues, 'CASH'),
                        debit: countByPayMethod(revenues, 'DEBIT_CARD'),
                        credit: countByPayMethod(revenues, 'CREDIT_CARD'),
                    }
                });
            } catch (err) {
                console.error('Erro ao buscar estatísticas', err);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // ==== PDV FUNCTIONS ====
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(pdvSearch.toLowerCase()));
    const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

    const addToCart = (product: Product) => {
        const existing = cart.find(c => c.product.id === product.id);
        if (existing) {
            setCart(cart.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { product, quantity: 1, unitPrice: product.price }]);
        }
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(c => {
            if (c.product.id === productId) {
                const newQty = Math.max(1, c.quantity + delta);
                return { ...c, quantity: newQty };
            }
            return c;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(c => c.product.id !== productId));
    };

    const handleLaunchPayment = () => {
        if (cart.length === 0) return;
        setPdvStep('payment');
    };

    const handleConfirmPayment = () => {
        setIsAuthorizing(true);
        // Simulate authorization delay
        setTimeout(() => {
            setIsAuthorizing(false);
            setPdvStep('receipt');
        }, 3000);
    };

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/patients', { ...newPatientData, email: newPatientData.cpf + '@mock.com', birthDate: '1990-01-01' });
            alert('Paciente criado com sucesso!');
            setPatientsList([...patientsList, res.data]);
            setSelectedPatientId(res.data.id);
            setShowNewPatient(false);
            setNewPatientData({ name: '', phone: '', cpf: '' });
        } catch (err) {
            console.error(err);
            alert('Erro ao criar paciente.');
        }
    };

    const handleSendReceipt = (method: 'whatsapp' | 'email' | 'sms') => {
        alert(`Preparando envio via ${method.toUpperCase()} para o cliente... Enviado com sucesso!`);
    };

    const closePDV = () => {
        setShowPDV(false); setPdvStep('products'); setCart([]); setPdvSearch('');
        setSelectedPayMethod(''); setInstallments(1); setCashAmount('');
        setIsAuthorizing(false); setSelectedPatientId('');
    };

    const getInstallmentValue = (total: number, months: number) => {
        // Interest rate 2.99% per month for credit card
        if (months <= 1) return total;
        const rate = 0.0299;
        return total * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1) * months;
    };

    // ==== STYLES ====
    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9'
    };
    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '0.8rem', fontWeight: '800', color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem'
    };
    const modalOverlay: React.CSSProperties = {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 1000, padding: '2rem', overflowY: 'auto'
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.7rem', borderRadius: '0.6rem',
        border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none'
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>Dashboard</h2>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Visão geral do sistema Bellas Fisio</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowPDV(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 6px -1px rgba(14,165,233,0.3)' }}>
                        <ShoppingCart size={18} /> Pagamentos
                    </button>
                    <button onClick={() => setShowReports(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#475569', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700', border: '1.5px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <BarChart3 size={18} /> Relatórios Rápidos
                    </button>
                </div>
            </div>

            {/* ===== SEÇÃO: AGENDA ===== */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={sectionTitleStyle}><Calendar size={18} color="#0ea5e9" /> Agenda</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    {[
                        { label: 'Total de Pacientes', value: stats.patients, icon: Users, iconColor: '#0ea5e9', iconBg: '#f0f9ff' },
                        { label: 'Agendamentos Hoje', value: stats.appointmentsToday, icon: Calendar, iconColor: '#10b981', iconBg: '#ecfdf5' },
                        { label: 'Agendamentos Semana', value: stats.appointmentsWeek, icon: Clock, iconColor: '#0ea5e9', iconBg: '#f0f9ff' },
                        { label: 'Atendidos Hoje', value: stats.completedToday, icon: CheckCircle, iconColor: '#10b981', iconBg: '#ecfdf5', valColor: '#10b981' },
                        { label: 'Cancelados Hoje', value: stats.cancelledToday, icon: AlertCircle, iconColor: '#ef4444', iconBg: '#fef2f2', valColor: '#ef4444' },
                    ].map((c, i) => (
                        <div key={i} style={cardStyle}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ padding: '0.6rem', backgroundColor: c.iconBg, borderRadius: '0.75rem', display: 'inline-flex' }}>
                                    <c.icon color={c.iconColor} size={22} />
                                </div>
                            </div>
                            <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>{c.label}</h4>
                            <p style={{ fontSize: '1.75rem', fontWeight: '800', color: c.valColor || '#111827', marginTop: '0.25rem' }}>{c.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== SEÇÃO: FINANCEIRO ===== */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={sectionTitleStyle}><DollarSign size={18} color="#10b981" /> Financeiro</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    {[
                        { label: 'Total a Receber', value: formatCurrency(stats.totalReceivable), icon: TrendingUp, iconColor: '#10b981', iconBg: '#ecfdf5', valColor: '#10b981' },
                        { label: 'Total a Pagar', value: formatCurrency(stats.totalPayable), icon: TrendingDown, iconColor: '#ef4444', iconBg: '#fef2f2', valColor: '#ef4444', extra: stats.overduePayables > 0 ? `${stats.overduePayables} vencidas!` : '' },
                        { label: 'Faturamento Diário', value: formatCurrency(stats.dailyRevenue), icon: Receipt, iconColor: '#16a34a', iconBg: '#f0fdf4', sub: 'Hoje' },
                        { label: 'Faturamento Semanal', value: formatCurrency(stats.weeklyRevenue), icon: BarChart3, iconColor: '#0ea5e9', iconBg: '#f0f9ff', sub: 'Últimos 7 dias' },
                        { label: 'Faturamento Mensal', value: formatCurrency(stats.monthlyRevenue), icon: CreditCard, iconColor: '#8b5cf6', iconBg: '#faf5ff', sub: 'Mês atual' },
                        { label: 'Fornecedores', value: stats.suppliersCount, icon: Truck, iconColor: '#f59e0b', iconBg: '#fff7ed', sub: 'cadastrados' },
                        { label: 'Contas Pendentes', value: stats.pendingPayables, icon: FileText, iconColor: '#d97706', iconBg: '#fffbeb', sub: 'a pagar', valColor: '#d97706' },
                    ].map((c: any, i: number) => (
                        <div key={i} style={cardStyle}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ padding: '0.6rem', backgroundColor: c.iconBg, borderRadius: '0.75rem', display: 'inline-flex' }}>
                                    <c.icon color={c.iconColor} size={22} />
                                </div>
                            </div>
                            <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>{c.label}</h4>
                            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: c.valColor || '#111827', marginTop: '0.25rem' }}>{c.value}</p>
                            {c.sub && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.sub}</span>}
                            {c.extra && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', display: 'block' }}>{c.extra}</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== SEÇÃO: RECEBIMENTOS POR TIPO ===== */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={sectionTitleStyle}><CreditCard size={18} color="#8b5cf6" /> Recebimentos por Tipo</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    {[
                        { label: 'PIX', value: stats.paymentsByType.pix, color: '#00b8a9', bg: '#e6f9f7' },
                        { label: 'Dinheiro', value: stats.paymentsByType.cash, color: '#10b981', bg: '#ecfdf5' },
                        { label: 'Cartão Débito', value: stats.paymentsByType.debit, color: '#0ea5e9', bg: '#f0f9ff' },
                        { label: 'Cartão Crédito', value: stats.paymentsByType.credit, color: '#8b5cf6', bg: '#faf5ff' },
                    ].map((c, i) => (
                        <div key={i} style={cardStyle}>
                            <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>{c.label}</h4>
                            <p style={{ fontSize: '1.75rem', fontWeight: '800', color: c.color }}>{c.value}</p>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>pagamentos</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* =============== PDV MODAL =============== */}
            {showPDV && (
                <div style={modalOverlay} onClick={e => { if (e.target === e.currentTarget) closePDV(); }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '800px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShoppingCart size={20} /> PDV - Pagamentos
                            </h2>
                            <button onClick={closePDV} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.5rem', padding: '0.35rem', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            {pdvStep === 'products' && (
                                <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
                                    {/* Left Side: Products Search */}
                                    <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column' }}>
                                        {/* Search */}
                                        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                                            <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                                            <input type="text" placeholder="Buscar produto ou serviço..." value={pdvSearch} onChange={e => setPdvSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.5rem' }} />
                                        </div>

                                        {/* Products Grid (Max 4 by default or filtered) */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', flex: 1, alignContent: 'flex-start' }}>
                                            {(pdvSearch ? filteredProducts : products.slice(0, 4)).map(p => (
                                                <button key={p.id} onClick={() => addToCart(p)} style={{ textAlign: 'left', padding: '0.85rem', borderRadius: '0.75rem', border: '1.5px solid #f1f5f9', background: 'white', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#111827', marginBottom: '0.2rem', lineHeight: '1.2' }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.category}</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0ea5e9', marginTop: '0.5rem' }}>{formatCurrency(p.price)}</div>
                                                </button>
                                            ))}
                                            {!pdvSearch && products.length > 4 && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', border: '1.5px dashed #cbd5e1', borderRadius: '0.75rem' }}>
                                                    Busque para ver mais itens...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Cart ALWAYS VISIBLE */}
                                    <div style={{ flex: 1, border: '1.5px solid #f1f5f9', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: '300px' }}>
                                        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', fontWeight: '800', fontSize: '0.85rem', color: '#334155', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
                                            Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
                                        </div>
                                        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
                                            {cart.length === 0 ? (
                                                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Nenhum item adicionado.<br />Selecione produtos ao lado.</div>
                                            ) : (
                                                cart.map(item => (
                                                    <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid #f8fafc' }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatCurrency(item.unitPrice)}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <button onClick={() => updateQuantity(item.product.id, -1)} style={{ width: '22px', height: '22px', borderRadius: '0.3rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                                                            <span style={{ fontWeight: '700', fontSize: '0.8rem', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.product.id, 1)} style={{ width: '22px', height: '22px', borderRadius: '0.3rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                                                        </div>
                                                        <div style={{ fontWeight: '800', color: '#111827', fontSize: '0.85rem', minWidth: '60px', textAlign: 'right' }}>{formatCurrency(item.unitPrice * item.quantity)}</div>
                                                        <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}><X size={14} /></button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {pdvStep === 'payment' && (
                                <div>
                                    <h3 style={{ fontWeight: '700', marginBottom: '1.25rem', color: '#111827' }}>Forma de Pagamento — Total: <span style={{ color: '#0ea5e9' }}>{formatCurrency(cartTotal)}</span></h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        {[
                                            { id: 'PIX', label: 'PIX', icon: '⚡', color: '#00b8a9' },
                                            { id: 'CASH', label: 'Dinheiro', icon: '💵', color: '#10b981' },
                                            { id: 'DEBIT', label: 'Cartão Débito', icon: '💳', color: '#0ea5e9' },
                                            { id: 'CREDIT', label: 'Cartão Crédito', icon: '💳', color: '#8b5cf6' },
                                        ].map(m => (
                                            <button key={m.id} onClick={() => { setSelectedPayMethod(m.id); setInstallments(1); }}
                                                style={{
                                                    padding: '1.25rem', borderRadius: '0.75rem',
                                                    border: `2px solid ${selectedPayMethod === m.id ? m.color : '#e2e8f0'}`,
                                                    background: selectedPayMethod === m.id ? `${m.color}10` : 'white',
                                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                                                }}>
                                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{m.icon}</div>
                                                <div style={{ fontWeight: '700', color: selectedPayMethod === m.id ? m.color : '#475569' }}>{m.label}</div>
                                            </button>
                                        ))}
                                    </div>

                                    {selectedPayMethod === 'CASH' && (
                                        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem' }}>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>Valor Recebido (Troco):</label>
                                            <input type="number" placeholder={cartTotal.toString()} value={cashAmount} onChange={e => setCashAmount(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '1.1rem', marginBottom: '0.75rem' }} />
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Troco: <span style={{ fontWeight: '800', color: '#111827' }}>{formatCurrency(Math.max(0, Number(cashAmount) - cartTotal))}</span></p>
                                            <button onClick={handleConfirmPayment} disabled={isAuthorizing} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isAuthorizing ? 0.5 : 1 }}>
                                                {isAuthorizing ? 'Autorizando...' : 'Confirmar em Dinheiro'} <CheckCircle size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {selectedPayMethod === 'PIX' && (
                                        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                            <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '1rem', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <QRCodeSVG value={`pix://test?value=${cartTotal}`} size={160} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                <input type="text" readOnly value={`00020101021126580014br.gov.bcb.pix0136${cartTotal}`} style={{ width: '250px', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem', textAlign: 'center', color: '#94a3b8' }} />
                                                <button style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>Copiar</button>
                                            </div>
                                            <button onClick={handleConfirmPayment} disabled={isAuthorizing} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isAuthorizing ? 0.5 : 1 }}>
                                                {isAuthorizing ? 'Autorizando...' : 'Verificar Pagamento do PIX'} <QrCode size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {selectedPayMethod === 'DEBIT' && (
                                        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                            <CreditCard size={48} color="#0ea5e9" style={{ margin: '0 auto 1rem' }} />
                                            <h4 style={{ fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Insira ou Aproxime o Cartão no Maquineta</h4>
                                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Aguardando interação com o leitor...</p>
                                            <button onClick={handleConfirmPayment} disabled={isAuthorizing} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isAuthorizing ? 0.5 : 1 }}>
                                                {isAuthorizing ? 'Autorizando...' : 'Confirmar Débito'} <CreditCard size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {selectedPayMethod === 'CREDIT' && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>Parcelas (Selecione primeiro, depois confirme):</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                                                {[1, 2, 3, 4, 5, 6, 10, 12].map(n => {
                                                    const totalWithInterest = getInstallmentValue(cartTotal, n);
                                                    const perMonth = totalWithInterest / n;
                                                    return (
                                                        <button key={n} onClick={() => setInstallments(n)} style={{
                                                            padding: '0.75rem', borderRadius: '0.5rem',
                                                            border: `1.5px solid ${installments === n ? '#8b5cf6' : '#e2e8f0'}`,
                                                            background: installments === n ? '#faf5ff' : 'white',
                                                            cursor: 'pointer', textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontWeight: '700', color: installments === n ? '#8b5cf6' : '#475569' }}>{n}x</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatCurrency(perMonth)}</div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {installments > 0 && (
                                                <button onClick={handleConfirmPayment} disabled={isAuthorizing} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isAuthorizing ? 0.5 : 1 }}>
                                                    {isAuthorizing ? 'Autorizando...' : `Confirmar Crédito (${installments}x de ${formatCurrency(getInstallmentValue(cartTotal, installments) / installments)})`} <CheckCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {pdvStep === 'receipt' && (
                                <div style={{ padding: '1rem 0' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                        <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                                        <h2 style={{ fontWeight: '900', color: '#10b981', marginBottom: '0.5rem', fontSize: '2.25rem' }}>Pagamento Confirmado ✓</h2>
                                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Forma: {selectedPayMethod === 'PIX' ? 'PIX' : selectedPayMethod === 'CASH' ? 'Dinheiro' : selectedPayMethod === 'DEBIT' ? 'Cartão Débito' : `Cartão Crédito ${installments}x`}</p>
                                        <p style={{ fontWeight: '900', color: '#111827', fontSize: '2.5rem', marginTop: '1rem' }}>
                                            {formatCurrency(selectedPayMethod === 'CREDIT' ? getInstallmentValue(cartTotal, installments) : cartTotal)}
                                        </p>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                        <h4 style={{ fontWeight: '800', color: '#111827', marginBottom: '1rem', fontSize: '1.1rem' }}>Emissão de Comprovantes</h4>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                            {['Cupom Não Fiscal', 'Cupom Fiscal', 'Nota Fiscal'].map(p => (
                                                <button key={p} onClick={() => setSelectedPrinter(p)} style={{
                                                    padding: '0.85rem 1.25rem', borderRadius: '0.6rem',
                                                    border: `1.5px solid ${selectedPrinter === p ? '#0ea5e9' : '#e2e8f0'}`,
                                                    background: selectedPrinter === p ? '#f0f9ff' : 'white',
                                                    color: selectedPrinter === p ? '#0ea5e9' : '#475569',
                                                    fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                }}>
                                                    <Printer size={16} /> {p}
                                                </button>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={sendWhats} onChange={e => setSendWhats(e.target.checked)} style={{ accentColor: '#25D366', width: '18px', height: '18px' }} /> Enviar por WhatsApp
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} style={{ accentColor: '#0ea5e9', width: '18px', height: '18px' }} /> Enviar por Email
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} style={{ accentColor: '#8b5cf6', width: '18px', height: '18px' }} /> Enviar SMS
                                            </label>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <button onClick={() => alert('Imprimindo 2ª via (Cliente)...')} style={{ padding: '0.75rem 1.25rem', borderRadius: '0.6rem', background: '#e2e8f0', color: '#374151', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Imprimir 2ª Via Cliente</button>
                                            <button onClick={() => alert('Imprimindo 2ª via (Empresa)...')} style={{ padding: '0.75rem 1.25rem', borderRadius: '0.6rem', background: '#e2e8f0', color: '#374151', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Imprimir 2ª Via Empresa</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.1rem' }}>
                                CARRINHO ({cart.length} ITENS) | <span style={{ color: '#0ea5e9' }}>{formatCurrency(cartTotal)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {pdvStep === 'products' && (
                                    <>
                                        <button onClick={closePDV} style={{ padding: '0.8rem 1.5rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}>Cancelar</button>
                                        <button onClick={handleLaunchPayment} disabled={cart.length === 0} style={{ padding: '0.8rem 2rem', borderRadius: '0.6rem', background: cart.length > 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#e2e8f0', color: cart.length > 0 ? 'white' : '#94a3b8', fontWeight: '800', border: 'none', cursor: cart.length > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <ShoppingCart size={18} /> Continuar Pagamento
                                        </button>
                                    </>
                                )}
                                {pdvStep === 'payment' && (
                                    <>
                                        <button onClick={() => setPdvStep('products')} disabled={isAuthorizing} style={{ padding: '0.8rem 1.5rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#64748b', opacity: isAuthorizing ? 0.5 : 1 }}>Voltar</button>
                                        <button onClick={handleConfirmPayment} disabled={!selectedPayMethod || isAuthorizing} style={{ padding: '0.8rem 2rem', borderRadius: '0.6rem', background: selectedPayMethod ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0', color: selectedPayMethod ? 'white' : '#94a3b8', fontWeight: '800', border: 'none', cursor: selectedPayMethod ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isAuthorizing ? 0.5 : 1 }}>
                                            {isAuthorizing ? 'Autorizando...' : selectedPayMethod === 'CASH' ? 'Confirmar Dinheiro' : 'Autorizar'} <CheckCircle size={18} />
                                        </button>
                                    </>
                                )}
                                {pdvStep === 'receipt' && (
                                    <button onClick={() => {
                                        if (sendWhats) alert('Comprovante enviado com sucesso pelo WhatsApp!');
                                        closePDV();
                                    }} style={{ padding: '0.8rem 2rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>FINALIZAR VENDA</button>
                                )}
                            </div>
                        </div>

                        {/* Modal Novo Paciente Rápido */}
                        {showNewPatient && (
                            <div style={{ ...modalOverlay, zIndex: 1100, alignItems: 'center' }}>
                                <form onSubmit={handleCreatePatient} style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: '#111827' }}>Novo Paciente (Rápido)</h3>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Nome Completo</label>
                                        <input type="text" value={newPatientData.name} onChange={e => setNewPatientData({ ...newPatientData, name: e.target.value })} style={inputStyle} required />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Telefone</label>
                                        <input type="text" value={newPatientData.phone} onChange={e => setNewPatientData({ ...newPatientData, phone: e.target.value })} style={inputStyle} required />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>CPF</label>
                                        <input type="text" value={newPatientData.cpf} onChange={e => setNewPatientData({ ...newPatientData, cpf: e.target.value })} style={inputStyle} required />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setShowNewPatient(false)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', borderRadius: '0.5rem', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Calcelar</button>
                                        <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#0ea5e9', color: 'white', borderRadius: '0.5rem', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Salvar & Selecionar</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* =============== RELATÓRIOS RÁPIDOS MODAL =============== */}
            {showReports && (
                <div style={modalOverlay} onClick={e => { if (e.target === e.currentTarget) setShowReports(false); }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '750px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BarChart3 size={20} /> Relatórios Rápidos
                            </h2>
                            <button onClick={() => setShowReports(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.5rem', padding: '0.35rem', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {/* Period Filter */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {[
                                    { id: 'day' as const, label: 'Diário' },
                                    { id: 'week' as const, label: 'Semanal' },
                                    { id: 'month' as const, label: 'Mensal' },
                                ].map(p => (
                                    <button key={p.id} onClick={() => setReportPeriod(p.id)} style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '0.6rem',
                                        border: `1.5px solid ${reportPeriod === p.id ? '#0ea5e9' : '#e2e8f0'}`,
                                        background: reportPeriod === p.id ? '#f0f9ff' : 'white',
                                        color: reportPeriod === p.id ? '#0ea5e9' : '#64748b',
                                        fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem'
                                    }}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1.5px solid #ecfdf5', background: '#f0fdf4' }}>
                                    <h4 style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>ENTRADAS</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>
                                        {formatCurrency(reportPeriod === 'day' ? stats.dailyRevenue : reportPeriod === 'week' ? stats.weeklyRevenue : stats.monthlyRevenue)}
                                    </p>
                                </div>
                                <div style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1.5px solid #fef2f2', background: '#fef2f2' }}>
                                    <h4 style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>SAÍDAS</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(stats.totalPayable)}</p>
                                </div>
                            </div>

                            {/* Breakdown by Type */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontWeight: '700', color: '#111827', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Entradas por Tipo</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { label: 'PIX', value: stats.paymentsByType.pix, color: '#00b8a9' },
                                        { label: 'Dinheiro', value: stats.paymentsByType.cash, color: '#10b981' },
                                        { label: 'Cartão Débito', value: stats.paymentsByType.debit, color: '#0ea5e9' },
                                        { label: 'Cartão Crédito', value: stats.paymentsByType.credit, color: '#8b5cf6' },
                                    ].map((t, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                            <span style={{ color: '#475569', fontSize: '0.85rem' }}>{t.label}</span>
                                            <span style={{ fontWeight: '700', color: t.color }}>{t.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontWeight: '700', color: '#111827', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Saídas por Tipo</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { label: 'Profissionais', value: 0 },
                                        { label: 'Fornecedores', value: stats.suppliersCount },
                                        { label: 'Sangria', value: 0 },
                                        { label: 'Outros', value: stats.pendingPayables },
                                    ].map((t, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                            <span style={{ color: '#475569', fontSize: '0.85rem' }}>{t.label}</span>
                                            <span style={{ fontWeight: '700', color: '#ef4444' }}>{t.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Download/Print Buttons */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Excel', 'Word', 'PDF'].map(fmt => (
                                    <button key={fmt} onClick={() => alert(`Exportando ${fmt}...`)} style={{
                                        padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0',
                                        background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer',
                                        fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem'
                                    }}>
                                        <Download size={14} /> {fmt}
                                    </button>
                                ))}
                                <button onClick={() => window.print()} style={{
                                    padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0',
                                    background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer',
                                    fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem'
                                }}>
                                    <Printer size={14} /> Imprimir
                                </button>
                            </div>
                            <button onClick={() => setShowReports(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', background: '#f1f5f9', color: '#64748b', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
