import React, { useState } from 'react';
import {
    X, User, Calendar, Briefcase, FileText, CheckSquare,
    Bold, Italic, Underline, List, FileSpreadsheet, File as FilePdf
} from 'lucide-react';

const AppointmentCard: React.FC = () => {
    const [selectedPatient, setSelectedPatient] = useState('Selecione o paciente');
    const [period, setPeriod] = useState({ start: '2026-02-22', end: '2027-02-22' });
    const [selectedStatus, setSelectedStatus] = useState(['Agendado']);

    const displayOptions = [
        'Todos', 'Salas de atendimento', 'Status de agendamento', 'Procedimentos',
        'Profissionais', 'Horário final do agendamento', 'Convênios', 'Valores'
    ];

    return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '700px', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {/* Header (Matching Image 2 style - simple and clean) */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#334155' }}>Cartão de agendamento</h1>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Top Row: Patient and Period */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#475569' }}>Paciente:</label>
                            <div style={{ position: 'relative' }}>
                                <select style={{ width: '100%', padding: '0.625rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#1e293b', appearance: 'none' }}>
                                    <option>{selectedPatient}</option>
                                </select>
                                <X size={14} style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#475569' }}>Período:*</label>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.625rem' }}>
                                <Calendar size={16} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                                <span style={{ fontSize: '0.9rem', color: '#1e293b' }}>{new Date(period.start).toLocaleDateString('pt-BR')} - {new Date(period.end).toLocaleDateString('pt-BR')}</span>
                                <ChevronDown size={14} style={{ marginLeft: 'auto', color: '#94a3b8' }} />
                            </div>
                        </div>
                    </div>

                    {/* Second Row: Professional and Procedure */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#475569' }}>Profissional:</label>
                            <select style={{ width: '100%', padding: '0.625rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                                <option>Todos</option>
                            </select>
                            <p style={{ fontSize: '0.75rem', color: '#0ea5e9', marginTop: '0.4rem', fontWeight: '500' }}>Para gerar um cartão por profissional, não é necessário selecionar um paciente.</p>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: '700', fontSize: '0.9rem', color: '#475569' }}>Procedimento:</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.75rem', fontWeight: '600' }}>✓ Todos</button>
                                    <button style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.75rem', fontWeight: '600' }}>🖌 Limpar</button>
                                </div>
                            </div>
                            <div style={{ height: '38px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.25rem' }}></div>
                        </div>
                    </div>

                    {/* Status Chips */}
                    <div>
                        <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#475569' }}>Status:</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', minHeight: '42px' }}>
                            {selectedStatus.map(s => (
                                <div key={s} style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                                    <X size={14} /> {s}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Checkboxes */}
                    <div>
                        <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.75rem', color: '#475569' }}>Selecione as informações que deseja exibir:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            {displayOptions.map((opt, i) => (
                                <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" id={`opt-${i}`} defaultChecked={opt === 'Horário final do agendamento'} style={{ width: '16px', height: '16px' }} />
                                    <label htmlFor={`opt-${i}`} style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>{opt}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Observations with Toolbar */}
                    <div>
                        <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#475569' }}>Observações:</label>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '0.25rem', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <ToolbarButton icon={<Bold size={14} />} />
                                <ToolbarButton icon={<Italic size={14} />} />
                                <ToolbarButton icon={<Underline size={14} />} />
                                <ToolbarButton icon={<List size={14} />} />
                                <div style={{ borderLeft: '1px solid #cbd5e1', margin: '0 0.25rem' }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', backgroundColor: 'white', padding: '0.1rem 0.5rem', borderRadius: '0.2rem', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}>14 <ChevronDown size={10} /></div>
                                <div style={{ borderLeft: '1px solid #cbd5e1', margin: '0 0.25rem' }}></div>
                                <ToolbarButton icon={<List size={14} />} />
                                <ToolbarButton icon={<List size={14} />} />
                            </div>
                            <textarea
                                placeholder="Escreva as suas observações..."
                                style={{ width: '100%', border: 'none', padding: '1rem', minHeight: '150px', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button style={{ padding: '0.625rem 1.25rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>Fechar</button>
                    <button style={{ padding: '0.625rem 1.25rem', borderRadius: '0.25rem', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <FileSpreadsheet size={18} /> Gerar Excel
                    </button>
                    <button style={{ padding: '0.625rem 1.25rem', borderRadius: '0.25rem', border: 'none', backgroundColor: '#0ea5e9', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <FilePdf size={18} /> Gerar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

const ToolbarButton: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
    <button style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '0.2rem', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
    </button>
);

const ChevronDown: React.FC<{ size?: number, style?: any }> = ({ size = 20, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="m6 9 6 6 6-6" /></svg>
);

export default AppointmentCard;
