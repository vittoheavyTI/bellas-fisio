import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../services/api';
import { FileText, ClipboardList, Printer, X, Plus, Save, Clock } from 'lucide-react';

interface MedicalRecord {
    id: string;
    type: string;
    content: string;
    createdAt: string;
}

const MedicalRecordModal: React.FC<{ patient: any, onClose: () => void }> = ({ patient, onClose }) => {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newRecord, setNewRecord] = useState({ type: 'EVOLUTION', content: '' });
    const printRef = useRef<HTMLDivElement>(null);

    const fetchRecords = async () => {
        try {
            const res = await api.get(`/medical-records`, { params: { patientId: patient.id } });
            setRecords(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [patient.id]);

    const handleSave = async () => {
        try {
            await api.post('/medical-records', { ...newRecord, patientId: patient.id });
            setShowNewForm(false);
            setNewRecord({ type: 'EVOLUTION', content: '' });
            fetchRecords();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '900px', height: '90vh', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>Prontuário de {patient.name}</h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>CPF: {patient.cpf || 'Não informado'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => setShowNewForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0ea5e9', color: 'white', padding: '0.625rem 1rem', borderRadius: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                            <Plus size={18} /> Novo Registro
                        </button>
                        <button onClick={() => handlePrint()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: '#374151', padding: '0.625rem 1rem', borderRadius: '0.75rem', fontWeight: '600', border: '1.5px solid #e5e7eb', cursor: 'pointer' }}>
                            <Printer size={18} /> Imprimir Tudo
                        </button>
                        <button onClick={onClose} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', backgroundColor: '#f8fafc' }}>
                    {showNewForm && (
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1.5px solid #0ea5e9', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Tipo do Registro</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => setNewRecord({ ...newRecord, type: 'EVALUATION' })} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid', borderColor: newRecord.type === 'EVALUATION' ? '#0ea5e9' : '#e2e8f0', backgroundColor: newRecord.type === 'EVALUATION' ? '#f0f9ff' : 'white', color: newRecord.type === 'EVALUATION' ? '#0ea5e9' : '#64748b', fontWeight: '600', cursor: 'pointer' }}>Avaliação</button>
                                    <button onClick={() => setNewRecord({ ...newRecord, type: 'EVOLUTION' })} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid', borderColor: newRecord.type === 'EVOLUTION' ? '#0ea5e9' : '#e2e8f0', backgroundColor: newRecord.type === 'EVOLUTION' ? '#f0f9ff' : 'white', color: newRecord.type === 'EVOLUTION' ? '#0ea5e9' : '#64748b', fontWeight: '600', cursor: 'pointer' }}>Evolução</button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Descrição Clínica</label>
                                <textarea value={newRecord.content} onChange={e => setNewRecord({ ...newRecord, content: e.target.value })} style={{ width: '100%', height: '150px', padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="Descreva os detalhes da sessão..." />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowNewForm(false)} style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                                <button onClick={handleSave} style={{ padding: '0.625rem 1.5rem', borderRadius: '0.75rem', background: '#0ea5e9', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Salvar Registro</button>
                            </div>
                        </div>
                    )}

                    <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="print-header" style={{ display: 'none' }}>
                            <h1 style={{ textAlign: 'center' }}>Prontuário do Paciente</h1>
                            <p>Paciente: {patient.name}</p>
                            <p>CPF: {patient.cpf}</p>
                            <hr />
                        </div>

                        {records.map(record => (
                            <div key={record.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: record.type === 'EVALUATION' ? '#10b981' : '#0ea5e9' }}>
                                        {record.type === 'EVALUATION' ? <ClipboardList size={20} /> : <Clock size={20} />}
                                        <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>{record.type === 'EVALUATION' ? 'Avaliação' : 'Evolução'}</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{new Date(record.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div style={{ color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{record.content}</div>
                            </div>
                        ))}

                        {records.length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                                <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p>Nenhum registro clínico encontrado para este paciente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-header { display: block !important; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
        </div>
    );
};

export default MedicalRecordModal;
