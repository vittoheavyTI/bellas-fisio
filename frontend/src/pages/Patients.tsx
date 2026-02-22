import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Users, Search, UserPlus, Filter,
    ClipboardList, Edit2, ArrowLeft, Camera, Upload, X
} from 'lucide-react';
import MedicalRecordModal from '../components/MedicalRecordModal';

interface Patient {
    id: string;
    name: string;
    cpf: string;
    email: string;
    phone: string;
    gender: string;
    occupation: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    photoUrl?: string;
}

const Patients: React.FC = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showRecords, setShowRecords] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedRecordPatient, setSelectedRecordPatient] = useState<Patient | null>(null);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);

    const [formData, setFormData] = useState({
        name: '', cpf: '', email: '', phone: '', birthDate: '',
        street: '', number: '', complement: '', neighborhood: '', city: '', state: 'PA',
        occupation: '', gender: 'MASCULINO'
    });

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patients', { params: { clinicId: user?.clinicId } });
            setPatients(res.data);
        } catch (err) {
            console.error('Erro ao buscar pacientes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [user?.clinicId]);

    const maskCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d)(\d{4})$/, '$1-$2')
            .substring(0, 15);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedPatient) {
                await api.patch(`/patients/${selectedPatient.id}`, formData);
            } else {
                await api.post('/patients', { ...formData, clinicId: user?.clinicId });
            }
            setShowForm(false);
            setSelectedPatient(null);
            fetchPatients();
        } catch (err) {
            console.error('Erro ao salvar paciente', err);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cpf?.includes(searchTerm)
    );

    if (showForm) {
        return (
            <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                <button onClick={() => { setShowForm(false); setSelectedPatient(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '500' }}>
                    <ArrowLeft size={20} /> Voltar para lista
                </button>
                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
                                {selectedPatient ? 'Editar Paciente' : 'Novo Paciente'}
                            </h2>
                            <p style={{ color: '#64748b' }}>Preencha os dados cadastrais do paciente abaixo.</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                                style={{ width: '100px', height: '100px', borderRadius: '1.25rem', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '2.5px dashed #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', overflow: 'hidden' }}
                            >
                                <Camera size={28} />
                                <span style={{ fontSize: '0.7rem', fontWeight: '700', marginTop: '0.25rem' }}>FOTO</span>
                            </div>
                            {showPhotoOptions && (
                                <div style={{ position: 'absolute', top: '110%', right: 0, backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', padding: '0.5rem', zIndex: 10, width: '180px' }}>
                                    <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>
                                        <Camera size={18} /> Tirar Foto
                                    </button>
                                    <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>
                                        <Upload size={18} /> Enviar Imagem
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 8' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Nome Completo</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', outlineColor: '#0ea5e9' }} placeholder="Ex: João Silva" required />
                            </div>
                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Gênero</label>
                                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', backgroundColor: 'white' }}>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMININO">Feminino</option>
                                    <option value="OUTRO">Outro</option>
                                </select>
                            </div>

                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>CPF</label>
                                <input type="text" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} placeholder="000.000.000-00" maxLength={14} />
                            </div>
                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Telefone</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} placeholder="(00) 0 0000-0000" />
                            </div>
                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>E-mail</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} placeholder="email@exemplo.com" />
                            </div>

                            <div style={{ gridColumn: 'span 9' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Endereço (Rua/Avenida)</label>
                                <input type="text" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} />
                            </div>
                            <div style={{ gridColumn: 'span 3' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Número</label>
                                <input type="text" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} />
                            </div>

                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Bairro</label>
                                <input type="text" value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} />
                            </div>
                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Cidade</label>
                                <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} />
                            </div>
                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Estado (UF)</label>
                                <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', backgroundColor: 'white' }}>
                                    <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option><option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option><option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option><option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option><option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option><option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option><option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
                                </select>
                            </div>

                            <div style={{ gridColumn: 'span 12' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Complemento</label>
                                <input type="text" value={formData.complement} onChange={e => setFormData({ ...formData, complement: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} placeholder="Apto, Bloco, etc." />
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.875rem 1.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', color: '#4b5563', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '0.875rem 2.5rem', borderRadius: '0.75rem', background: '#0ea5e9', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }}>
                                {selectedPatient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.025em' }}>Pacientes</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Gerencie o histórico e cadastros com eficiência.</p>
                </div>
                <button onClick={() => { setFormData({ name: '', cpf: '', email: '', phone: '', birthDate: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: 'PA', occupation: '', gender: 'MASCULINO' }); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', backgroundColor: '#0ea5e9', color: 'white', padding: '0.875rem 1.5rem', borderRadius: '1rem', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)' }}>
                    <UserPlus size={22} /> Novo Paciente
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <div style={{ padding: '1.75rem', borderBottom: '1.5px solid #f8fafc', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou CPF..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '1rem 1.25rem 1rem 3.25rem', borderRadius: '1rem', border: '1.5px solid #f1f5f9', outlineColor: '#0ea5e9', fontSize: '0.95rem', backgroundColor: '#fdfdfd' }}
                        />
                    </div>
                    <button style={{ padding: '1rem', borderRadius: '1rem', border: '1.5px solid #f1f5f9', background: 'white', color: '#64748b' }}><Filter size={22} /></button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <tr>
                                <th style={{ padding: '1.25rem 2rem' }}>Paciente</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Contato</th>
                                <th style={{ padding: '1.25rem 2rem' }}>CPF</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Cidade/Estado</th>
                                <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody style={{ color: '#1e293b', fontSize: '0.95rem' }}>
                            {filteredPatients.map(patient => (
                                <tr key={patient.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '1rem', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#94a3b8', fontSize: '1.1rem' }}>{patient.name[0]}</div>
                                            <div>
                                                <div style={{ fontWeight: '700' }}>{patient.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {patient.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ fontWeight: '500' }}>{patient.phone || 'N/A'}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{patient.email || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem', color: '#64748b', fontWeight: '600' }}>{patient.cpf || 'N/A'}</td>
                                    <td style={{ padding: '1.25rem 2rem' }}>{patient.city || '-'}/{patient.state || '-'}</td>
                                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <button onClick={() => { setSelectedRecordPatient(patient); setShowRecords(true); }} title="Prontuário" style={{ padding: '0.625rem', borderRadius: '0.75rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', cursor: 'pointer' }}><ClipboardList size={20} /></button>
                                            <button onClick={() => { setSelectedPatient(patient); setFormData({ ...patient } as any); setShowForm(true); }} title="Editar" style={{ padding: '0.625rem', borderRadius: '0.75rem', background: '#f8fafc', color: '#64748b', border: 'none', cursor: 'pointer' }}><Edit2 size={20} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredPatients.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
                            <Users size={64} style={{ marginBottom: '1.5rem', opacity: 0.15 }} />
                            <p style={{ fontWeight: '600' }}>Nenhum paciente encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {showRecords && selectedRecordPatient && (
                <MedicalRecordModal
                    patient={selectedRecordPatient}
                    onClose={() => { setShowRecords(false); setSelectedRecordPatient(null); }}
                />
            )}
        </div>
    );
};

export default Patients;
