import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    DollarSign, TrendingUp, TrendingDown, Search, Plus, X,
    ArrowLeft, Filter, FileText, Truck, Calendar, Settings,
    CreditCard, Receipt, BarChart3, Save, Edit2, Trash2,
    ChevronRight, Clock, CheckCircle, AlertCircle, Download
} from 'lucide-react';

type SubPage = 'overview' | 'payable' | 'receivable' | 'suppliers' | 'billing';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: string;
    status?: string;
    category?: string;
    dueDate?: string;
    supplier?: string;
}

const FinancialPage: React.FC = () => {
    const { user } = useAuth();
    const [activeSub, setActiveSub] = useState<SubPage>('overview');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('month');
    const [showFinConfig, setShowFinConfig] = useState(false);
    const [revenueCategories, setRevenueCategories] = useState(['Consulta', 'Sessão', 'Pacote', 'Avaliação', 'Produto']);
    const [expenseCategories, setExpenseCategories] = useState(['Material', 'Aluguel', 'Salário', 'Manutenção', 'Marketing']);
    const [supplierTypes, setSupplierTypes] = useState(['Equipamentos', 'Materiais', 'Serviços', 'Informática']);
    const [newCat, setNewCat] = useState('');

    // Stats
    const [stats, setStats] = useState({
        totalReceivable: 0, totalPayable: 0, totalRevenue: 0,
        dailyRevenue: 0, weeklyRevenue: 0, monthlyRevenue: 0,
        suppliersCount: 0, pendingPayables: 0, pendingReceivables: 0,
        overduePayables: 0
    });

    const [formData, setFormData] = useState({
        description: '', amount: '', date: new Date().toISOString().split('T')[0],
        type: 'REVENUE', category: '', dueDate: '', supplier: '', status: 'PENDING',
        paymentMethod: '', installments: 1, notes: ''
    });

    const subPages = [
        { id: 'overview' as SubPage, name: 'Visão Geral', icon: BarChart3 },
        { id: 'receivable' as SubPage, name: 'Contas a Receber', icon: TrendingUp },
        { id: 'payable' as SubPage, name: 'Contas a Pagar', icon: TrendingDown },
        { id: 'suppliers' as SubPage, name: 'Fornecedores', icon: Truck },
        { id: 'billing' as SubPage, name: 'Faturamento', icon: Receipt },
    ];

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/financial/transactions').catch(() => ({ data: [] }));
            setTransactions(res.data);
            calculateStats(res.data);
        } catch (err) {
            console.error('Erro ao buscar transações', err);
            calculateStats([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Transaction[]) => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        const revenues = data.filter(t => t.type === 'REVENUE');
        const expenses = data.filter(t => t.type === 'EXPENSE');

        setStats({
            totalReceivable: revenues.reduce((s, t) => s + t.amount, 0),
            totalPayable: expenses.reduce((s, t) => s + t.amount, 0),
            totalRevenue: revenues.reduce((s, t) => s + t.amount, 0) - expenses.reduce((s, t) => s + t.amount, 0),
            dailyRevenue: revenues.filter(t => t.date?.startsWith(today)).reduce((s, t) => s + t.amount, 0),
            weeklyRevenue: revenues.filter(t => t.date >= weekAgo).reduce((s, t) => s + t.amount, 0),
            monthlyRevenue: revenues.filter(t => t.date >= monthStart).reduce((s, t) => s + t.amount, 0),
            suppliersCount: [...new Set(data.filter(t => t.supplier).map(t => t.supplier))].length,
            pendingPayables: expenses.filter(t => t.status === 'PENDING').length,
            pendingReceivables: revenues.filter(t => t.status === 'PENDING').length,
            overduePayables: expenses.filter(t => t.status === 'OVERDUE').length
        });
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/financial/transactions', {
                ...formData,
                amount: parseFloat(formData.amount),
                installments: parseInt(String(formData.installments))
            }).catch(() => {
                // Simulated local storage if API is not ready
                const newTx: Transaction = {
                    id: Date.now().toString(), description: formData.description,
                    amount: parseFloat(formData.amount), date: formData.date,
                    type: formData.type, status: formData.status,
                    category: formData.category, dueDate: formData.dueDate,
                    supplier: formData.supplier
                };
                setTransactions(prev => [...prev, newTx]);
                calculateStats([...transactions, newTx]);
            });
            setShowForm(false);
            setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'REVENUE', category: '', dueDate: '', supplier: '', status: 'PENDING', paymentMethod: '', installments: 1, notes: '' });
        } catch (err) {
            console.error('Erro ao salvar transação', err);
        }
    };

    const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
        border: '1.5px solid #e2e8f0', outlineColor: '#0ea5e9', fontSize: '0.9rem'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem'
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9'
    };

    const renderOverview = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ padding: '0.6rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem' }}><TrendingUp color="#10b981" size={22} /></div>
                    </div>
                    <h3 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>Total a Receber</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{formatCurrency(stats.totalReceivable)}</p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{stats.pendingReceivables} pendentes</span>
                </div>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ padding: '0.6rem', backgroundColor: '#fef2f2', borderRadius: '0.75rem' }}><TrendingDown color="#ef4444" size={22} /></div>
                    </div>
                    <h3 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>Total a Pagar</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(stats.totalPayable)}</p>
                    <span style={{ fontSize: '0.75rem', color: stats.overduePayables > 0 ? '#ef4444' : '#94a3b8' }}>{stats.overduePayables > 0 ? `${stats.overduePayables} vencidas!` : `${stats.pendingPayables} pendentes`}</span>
                </div>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ padding: '0.6rem', backgroundColor: '#f0f9ff', borderRadius: '0.75rem' }}><DollarSign color="#0ea5e9" size={22} /></div>
                    </div>
                    <h3 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>Saldo Líquido</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: stats.totalRevenue >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ padding: '0.6rem', backgroundColor: '#fff7ed', borderRadius: '0.75rem' }}><Truck color="#f59e0b" size={22} /></div>
                    </div>
                    <h3 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' }}>Fornecedores</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{stats.suppliersCount}</p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>cadastrados</span>
                </div>
            </div>

            {/* Billing Summary */}
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Receipt size={20} color="#0ea5e9" /> Faturamento
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    <div style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
                        <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Faturamento Diário</h4>
                        <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>{formatCurrency(stats.dailyRevenue)}</p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hoje</span>
                    </div>
                    <div style={{ ...cardStyle, borderLeft: '4px solid #0ea5e9' }}>
                        <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Faturamento Semanal</h4>
                        <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>{formatCurrency(stats.weeklyRevenue)}</p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Últimos 7 dias</span>
                    </div>
                    <div style={{ ...cardStyle, borderLeft: '4px solid #8b5cf6' }}>
                        <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Faturamento Mensal</h4>
                        <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>{formatCurrency(stats.monthlyRevenue)}</p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mês atual</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTransactionList = (type: 'REVENUE' | 'EXPENSE') => {
        const filtered = transactions
            .filter(t => t.type === type)
            .filter(t => t.description?.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px', minWidth: '200px' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input type="text" placeholder="Buscar transação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.75rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setShowFinConfig(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                            <Settings size={16} /> Config. Financeiras
                        </button>
                        <button onClick={() => { setFormData(prev => ({ ...prev, type })); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <Plus size={18} /> Nova {type === 'REVENUE' ? 'Receita' : 'Despesa'}
                        </button>
                    </div>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem' }}>Descrição</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Valor</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Data</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Vencimento</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.9rem' }}>
                            {filtered.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{t.description}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: type === 'REVENUE' ? '#10b981' : '#ef4444', fontWeight: '700' }}>{formatCurrency(t.amount)}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.65rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700',
                                            backgroundColor: t.status === 'PAID' ? '#f0fdf4' : t.status === 'OVERDUE' ? '#fef2f2' : '#fffbeb',
                                            color: t.status === 'PAID' ? '#16a34a' : t.status === 'OVERDUE' ? '#ef4444' : '#d97706'
                                        }}>
                                            {t.status === 'PAID' ? 'Pago' : t.status === 'OVERDUE' ? 'Vencido' : 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.15 }} />
                            <p style={{ fontWeight: '600' }}>Nenhuma transação encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSuppliers = () => {
        const suppliers = [...new Set(transactions.filter(t => t.supplier).map(t => t.supplier))];
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input type="text" placeholder="Buscar fornecedor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.75rem' }} />
                    </div>
                    <button onClick={() => { setFormData(prev => ({ ...prev, type: 'EXPENSE' })); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <Plus size={18} /> Novo Fornecedor
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {suppliers.map((s, i) => {
                        const supplierTxs = transactions.filter(t => t.supplier === s);
                        const totalAmount = supplierTxs.reduce((sum, t) => sum + t.amount, 0);
                        return (
                            <div key={i} style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Truck size={22} color="#64748b" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: '700', color: '#111827' }}>{s}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{supplierTxs.length} transações</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total:</span>
                                    <span style={{ fontWeight: '800', color: '#ef4444' }}>{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>
                        );
                    })}
                    {suppliers.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                            <Truck size={48} style={{ marginBottom: '1rem', opacity: 0.15 }} />
                            <p style={{ fontWeight: '600' }}>Nenhum fornecedor cadastrado.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderBilling = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['day', 'week', 'month'].map(p => (
                    <button key={p} onClick={() => setFilterPeriod(p)} style={{
                        padding: '0.6rem 1.25rem', borderRadius: '0.6rem', border: `1.5px solid ${filterPeriod === p ? '#0ea5e9' : '#e2e8f0'}`,
                        background: filterPeriod === p ? '#f0f9ff' : 'white', color: filterPeriod === p ? '#0ea5e9' : '#64748b',
                        fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem'
                    }}>
                        {p === 'day' ? 'Diário' : p === 'week' ? 'Semanal' : 'Mensal'}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                <div style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
                    <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Receitas</h4>
                    <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981' }}>
                        {formatCurrency(filterPeriod === 'day' ? stats.dailyRevenue : filterPeriod === 'week' ? stats.weeklyRevenue : stats.monthlyRevenue)}
                    </p>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444' }}>
                    <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Despesas</h4>
                    <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(stats.totalPayable)}</p>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #0ea5e9' }}>
                    <h4 style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Lucro Líquido</h4>
                    <p style={{ fontSize: '1.75rem', fontWeight: '800', color: stats.totalRevenue >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(stats.totalRevenue)}</p>
                </div>
            </div>

            {/* NFS-e / NFC-e info */}
            <div style={cardStyle}>
                <h4 style={{ fontWeight: '700', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} color="#0ea5e9" /> Documentos Fiscais
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={{ padding: '1.25rem', border: '1.5px solid #f1f5f9', borderRadius: '0.75rem' }}>
                        <h5 style={{ fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>NFS-e (Nota Fiscal de Serviço)</h5>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Emissão de notas fiscais de serviços prestados</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Emitidas este mês: <strong>0</strong></span>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <Plus size={14} /> Emitir NFS-e
                            </button>
                        </div>
                    </div>
                    <div style={{ padding: '1.25rem', border: '1.5px solid #f1f5f9', borderRadius: '0.75rem' }}>
                        <h5 style={{ fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>NFC-e (Nota Fiscal ao Consumidor)</h5>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Cupons fiscais eletrônicos</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Emitidas este mês: <strong>0</strong></span>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <Plus size={14} /> Emitir NFC-e
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Info Panel */}
            <div style={cardStyle}>
                <h4 style={{ fontWeight: '700', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Receipt size={18} color="#0ea5e9" /> Informações Fiscais
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>CNPJ</span>
                        <p style={{ fontWeight: '700', color: '#111827', marginTop: '0.25rem' }}>00.000.000/0001-00</p>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Regime Tributário</span>
                        <p style={{ fontWeight: '700', color: '#111827', marginTop: '0.25rem' }}>Simples Nacional</p>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Inscrição Municipal</span>
                        <p style={{ fontWeight: '700', color: '#111827', marginTop: '0.25rem' }}>Não configurada</p>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Alíquota ISS</span>
                        <p style={{ fontWeight: '700', color: '#111827', marginTop: '0.25rem' }}>5,00%</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.025em' }}>Financeiro</h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Controle de receitas, despesas, fornecedores e faturamento.</p>
            </div>

            {/* Sub-page Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0' }}>
                {subPages.map(sp => (
                    <button
                        key={sp.id}
                        onClick={() => { setActiveSub(sp.id); setSearchTerm(''); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.85rem 1.25rem', border: 'none', background: 'none',
                            color: activeSub === sp.id ? '#0ea5e9' : '#64748b',
                            fontWeight: activeSub === sp.id ? '700' : '500',
                            cursor: 'pointer', fontSize: '0.9rem', position: 'relative',
                            borderBottom: activeSub === sp.id ? '2px solid #0ea5e9' : '2px solid transparent',
                            marginBottom: '-2px', transition: 'all 0.2s'
                        }}
                    >
                        <sp.icon size={18} /> {sp.name}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeSub === 'overview' && renderOverview()}
            {activeSub === 'receivable' && renderTransactionList('REVENUE')}
            {activeSub === 'payable' && renderTransactionList('EXPENSE')}
            {activeSub === 'suppliers' && renderSuppliers()}
            {activeSub === 'billing' && renderBilling()}

            {/* Financial Config Modal */}
            {showFinConfig && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '2rem 1rem', overflowY: 'auto' }} onClick={e => { if (e.target === e.currentTarget) setShowFinConfig(false); }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '550px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={20} /> Configurações Financeiras</h2>
                            <button onClick={() => setShowFinConfig(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.5rem', padding: '0.35rem', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                            {/* Revenue Categories */}
                            <h4 style={{ fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>📗 Categorias de Receita</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                {revenueCategories.map((c, i) => (
                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '2rem', background: '#ecfdf5', color: '#10b981', fontWeight: '600', fontSize: '0.8rem' }}>
                                        {c} <button onClick={() => setRevenueCategories(revenueCategories.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
                                <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nova categoria..." style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }} />
                                <button onClick={() => { if (newCat.trim()) { setRevenueCategories([...revenueCategories, newCat.trim()]); setNewCat(''); } }} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: '#10b981', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}><Plus size={16} /></button>
                            </div>

                            {/* Expense Categories */}
                            <h4 style={{ fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>📕 Categorias de Despesa</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                {expenseCategories.map((c, i) => (
                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '2rem', background: '#fef2f2', color: '#ef4444', fontWeight: '600', fontSize: '0.8rem' }}>
                                        {c} <button onClick={() => setExpenseCategories(expenseCategories.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
                                <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nova categoria..." style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }} />
                                <button onClick={() => { if (newCat.trim()) { setExpenseCategories([...expenseCategories, newCat.trim()]); setNewCat(''); } }} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}><Plus size={16} /></button>
                            </div>

                            {/* Supplier Types */}
                            <h4 style={{ fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>📦 Tipos de Fornecedor</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                {supplierTypes.map((c, i) => (
                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '2rem', background: '#fff7ed', color: '#d97706', fontWeight: '600', fontSize: '0.8rem' }}>
                                        {c} <button onClick={() => setSupplierTypes(supplierTypes.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                                <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Novo tipo..." style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }} />
                                <button onClick={() => { if (newCat.trim()) { setSupplierTypes([...supplierTypes, newCat.trim()]); setNewCat(''); } }} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: '#d97706', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}><Plus size={16} /></button>
                            </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowFinConfig(false)} style={{ padding: '0.7rem 1.5rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Transaction Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '2rem 1rem', overflowY: 'auto' }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>
                                Nova {formData.type === 'REVENUE' ? 'Receita' : 'Despesa'}
                            </h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: '0.5rem', padding: '0.35rem' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Tipo:</label>
                                <select value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="REVENUE">Receita</option>
                                    <option value="EXPENSE">Despesa</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Descrição:</label>
                                <input type="text" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} style={inputStyle} placeholder="Ex: Consulta paciente" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Valor (R$):</label>
                                    <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))} style={inputStyle} placeholder="0,00" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Data:</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Vencimento:</label>
                                    <input type="date" value={formData.dueDate} onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Forma de Pagamento:</label>
                                    <select value={formData.paymentMethod} onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="">Selecione...</option>
                                        <option value="PIX">PIX</option>
                                        <option value="CREDIT_CARD">Cartão de Crédito</option>
                                        <option value="DEBIT_CARD">Cartão de Débito</option>
                                        <option value="CASH">Dinheiro</option>
                                        <option value="TRANSFER">Transferência</option>
                                        <option value="BOLETO">Boleto</option>
                                    </select>
                                </div>
                            </div>
                            {formData.type === 'EXPENSE' && (
                                <div>
                                    <label style={labelStyle}>Fornecedor:</label>
                                    <input type="text" value={formData.supplier} onChange={e => setFormData(prev => ({ ...prev, supplier: e.target.value }))} style={inputStyle} placeholder="Nome do fornecedor" />
                                </div>
                            )}
                            <div>
                                <label style={labelStyle}>Categoria:</label>
                                <select value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="">Selecione...</option>
                                    {(formData.type === 'REVENUE' ? revenueCategories : expenseCategories).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Observações:</label>
                                <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Anotações opcionais..." />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}>Cancelar</button>
                                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Save size={16} /> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialPage;
