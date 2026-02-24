import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Users, Search, UserPlus, Filter,
    ClipboardList, Edit2, ArrowLeft, Camera, Upload, X,
    Phone, Mail, MapPin, Calendar
} from 'lucide-react';
import MedicalRecordModal from '../components/MedicalRecordModal';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

interface Patient {
    id: string;
    name: string;
    cpf: string;
    email: string;
    phone: string;
    gender: string;
    occupation: string;
    birthDate: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    photoUrl?: string;
    observations?: string;
    healthPlanId?: string;
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '', cpf: '', email: '', phone: '', birthDate: '',
        street: '', number: '', complement: '', neighborhood: '', city: '', state: 'PA',
        occupation: '', gender: 'MASCULINO', observations: '', photoUrl: ''
    });

    const handlePhotoUpload = () => {
        fileInputRef.current?.click();
        setShowPhotoOptions(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, photoUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR');
        } catch { return ''; }
    };

    const calculateAge = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const birth = new Date(dateStr);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
            return `${age} anos`;
        } catch { return ''; }
    };

    const openWhatsApp = (phone: string) => {
        const cleaned = phone?.replace(/\D/g, '') || '';
        if (cleaned) {
            window.open(`https://wa.me/55${cleaned}`, '_blank');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Combine address fields into single field for backend if needed
                address: [formData.street, formData.number, formData.complement, formData.neighborhood, formData.city, formData.state]
                    .filter(Boolean).join(', ')
            };
            if (selectedPatient) {
                await api.patch(`/patients/${selectedPatient.id}`, payload);
            } else {
                await api.post('/patients', { ...payload, clinicId: user?.clinicId });
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

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
        border: '1.5px solid #e2e8f0', outlineColor: '#0ea5e9',
        fontSize: '0.9rem', transition: 'border-color 0.2s'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.875rem', fontWeight: '700',
        color: '#374151', marginBottom: '0.5rem'
    };

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
                                {formData.photoUrl ? (
                                    <img src={formData.photoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <Camera size={28} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', marginTop: '0.25rem' }}>FOTO</span>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                            {showPhotoOptions && (
                                <div style={{ position: 'absolute', top: '110%', right: 0, backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', padding: '0.5rem', zIndex: 10, width: '180px' }}>
                                    <button onClick={handlePhotoUpload} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>
                                        <Camera size={18} /> Tirar Foto
                                    </button>
                                    <button onClick={handlePhotoUpload} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>
                                        <Upload size={18} /> Enviar Imagem
                                    </button>
                                    {formData.photoUrl && (
                                        <button onClick={() => { setFormData(prev => ({ ...prev, photoUrl: '' })); setShowPhotoOptions(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.875rem' }}>
                                            <X size={18} /> Remover Foto
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Section: Dados Pessoais */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={16} /> Dados Pessoais
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 8' }}>
                                    <label style={labelStyle}>Nome Completo</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder="Ex: João Silva" required />
                                </div>
                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={labelStyle}>Gênero</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={{ ...inputStyle, backgroundColor: 'white' }}>
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMININO">Feminino</option>
                                        <option value="OUTRO">Outro</option>
                                    </select>
                                </div>

                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={labelStyle}>CPF</label>
                                    <input type="text" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })} style={inputStyle} placeholder="000.000.000-00" maxLength={14} />
                                </div>
                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={labelStyle}>Data de Nascimento</label>
                                    <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={labelStyle}>Profissão / Ocupação</label>
                                    <input type="text" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} style={inputStyle} placeholder="Ex: Engenheiro" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Contato */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} /> Contato
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 6' }}>
                                    <label style={labelStyle}>Telefone / WhatsApp</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} style={inputStyle} placeholder="(00) 0 0000-0000" />
                                </div>
                                <div style={{ gridColumn: 'span 6' }}>
                                    <label style={labelStyle}>E-mail</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} placeholder="email@exemplo.com" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Endereço */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} /> Endereço
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 9' }}>
                                    <label style={labelStyle}>Endereço (Rua/Avenida)</label>
                                    <input type="text" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ gridColumn: 'span 3' }}>
                                    <label style={labelStyle}>Número</label>
                                    <input type="text" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} style={inputStyle} />
                                </div>

                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={labelStyle}>Bairro</label>
                                    <input type="text" value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={labelStyle}>Cidade</label>
                                    <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={labelStyle}>Estado (UF)</label>
                                    <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} style={{ ...inputStyle, backgroundColor: 'white' }}>
                                        <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option><option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option><option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option><option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option><option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option><option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option><option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
                                    </select>
                                </div>

                                <div style={{ gridColumn: 'span 12' }}>
                                    <label style={labelStyle}>Complemento</label>
                                    <input type="text" value={formData.complement} onChange={e => setFormData({ ...formData, complement: e.target.value })} style={inputStyle} placeholder="Apto, Bloco, etc." />
                                </div>
                            </div>
                        </div>

                        {/* Section: Observações */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ClipboardList size={16} /> Observações
                            </h3>
                            <textarea
                                value={formData.observations}
                                onChange={e => setFormData({ ...formData, observations: e.target.value })}
                                placeholder="Observações gerais sobre o paciente (alergias, condições especiais, etc.)..."
                                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.875rem 1.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', color: '#4b5563', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '0.875rem 2.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }}>
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
                <button onClick={() => { setFormData({ name: '', cpf: '', email: '', phone: '', birthDate: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: 'PA', occupation: '', gender: 'MASCULINO', observations: '' }); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', padding: '0.875rem 1.5rem', borderRadius: '1rem', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)' }}>
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
                                <th style={{ padding: '1.25rem 2rem' }}>Nascimento</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Cidade/Estado</th>
                                <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody style={{ color: '#1e293b', fontSize: '0.95rem' }}>
                            {filteredPatients.map(patient => (
                                <tr key={patient.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '1rem', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#64748b', fontSize: '1.1rem' }}>{patient.name[0]}</div>
                                            <div>
                                                <div style={{ fontWeight: '700' }}>{patient.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    {patient.occupation || 'Sem profissão'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: '500' }}>{patient.phone || 'N/A'}</span>
                                            {patient.phone && (
                                                <button
                                                    onClick={() => openWhatsApp(patient.phone)}
                                                    title="Abrir WhatsApp"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem', borderRadius: '0.25rem', transition: 'all 0.2s' }}
                                                >
                                                    <WhatsAppIcon size={18} />
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{patient.email || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem', color: '#64748b', fontWeight: '600' }}>{patient.cpf || 'N/A'}</td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ color: '#475569', fontWeight: '500' }}>{formatDate(patient.birthDate) || '-'}</div>
                                        {patient.birthDate && (
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{calculateAge(patient.birthDate)}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>{patient.city || '-'}/{patient.state || '-'}</td>
                                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <button onClick={() => { setSelectedRecordPatient(patient); setShowRecords(true); }} title="Prontuário" style={{ padding: '0.625rem', borderRadius: '0.75rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}><ClipboardList size={20} /></button>
                                            <button onClick={() => {
                                                setSelectedPatient(patient);
                                                setFormData({
                                                    name: patient.name || '',
                                                    cpf: patient.cpf || '',
                                                    email: patient.email || '',
                                                    phone: patient.phone || '',
                                                    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : '',
                                                    street: patient.street || '',
                                                    number: patient.number || '',
                                                    complement: patient.complement || '',
                                                    neighborhood: patient.neighborhood || '',
                                                    city: patient.city || '',
                                                    state: patient.state || 'PA',
                                                    occupation: patient.occupation || '',
                                                    gender: patient.gender || 'MASCULINO',
                                                    observations: patient.observations || ''
                                                });
                                                setShowForm(true);
                                            }} title="Editar" style={{ padding: '0.625rem', borderRadius: '0.75rem', background: '#f8fafc', color: '#64748b', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}><Edit2 size={20} /></button>
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
