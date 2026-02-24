import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Users, Search, UserPlus, Filter,
    Edit2, ArrowLeft, Camera, Upload, X,
    Phone, Mail, MapPin, Shield, Key, Eye, EyeOff,
    Save, Trash2, Archive, Lock
} from 'lucide-react';
import Cropper from 'react-easy-crop';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    registration?: string;
    phone?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    photoUrl?: string;
    canEditPatients?: boolean;
}

const UsersPage: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Photo / Crop State
    const [preview, setPreview] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [showCropper, setShowCropper] = useState(false);

    // Webcam State
    const [showWebcam, setShowWebcam] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        registration: '', role: 'Secretária(o)', canEditPatients: true,
        phone: '', street: '', number: '', complement: '',
        neighborhood: '', city: '', state: 'PA',
        photoUrl: ''
    });

    const [formErrors, setFormErrors] = useState<any>({});

    const roleOptions = ['Administrador', 'Fisioterapeuta', 'Secretária(o)', 'Financeiro'];

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Erro ao buscar usuários', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const maskPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d)(\d{4})$/, '$1-$2')
            .substring(0, 15);
    };

    const validateForm = () => {
        const errors: any = {};
        if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
        if (!formData.email.trim()) errors.email = 'E-mail é obrigatório';
        if (!selectedUser && !formData.password) errors.password = 'Senha é obrigatória';
        if (formData.password && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'As senhas não conferem';
        }
        if (formData.password && formData.password.length < 6) {
            errors.password = 'Senha deve ter pelo menos 6 caracteres';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const roleMap: any = {
                'Administrador': 'OWNER',
                'Fisioterapeuta': 'PROFESSIONAL',
                'Secretária(o)': 'RECEPTIONIST',
                'Financeiro': 'MANAGER'
            };
            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: roleMap[formData.role] || 'RECEPTIONIST',
            };
            if (formData.password) payload.password = formData.password;

            if (selectedUser) {
                await api.patch(`/users/${selectedUser.id}`, payload);
            } else {
                await api.post('/users', { ...payload, clinicId: user?.clinicId });
            }
            setShowForm(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Erro ao salvar usuário', err);
            alert('Erro ao salvar usuário. Verifique os dados.');
        }
    };

    // ==== WEBCAM ====
    const openWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            streamRef.current = stream;
            setShowWebcam(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }, 100);
        } catch (err) {
            alert('Não foi possível acessar a câmera.');
        }
    };

    const closeWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowWebcam(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setPreview(dataUrl);
            setShowWebcam(false);
            closeWebcam();
            setShowPhotoOptions(false);
            setShowCropper(true);
        }
    };

    // ==== FILE UPLOAD ====
    const handlePhotoUpload = () => {
        fileInputRef.current?.click();
        setShowPhotoOptions(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setPreview(reader.result as string);
                setShowCropper(true);
            };
        }
    };

    // ==== CROP ====
    const onCropComplete = React.useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', error => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return '';
        canvas.width = 200;
        canvas.height = 200;

        ctx.drawImage(
            image,
            pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
            0, 0, 200, 200
        );

        return canvas.toDataURL('image/jpeg');
    };

    const saveCrop = async () => {
        if (preview && croppedAreaPixels) {
            const croppedImage = await getCroppedImg(preview, croppedAreaPixels);
            setFormData(prev => ({ ...prev, photoUrl: croppedImage }));
            setShowCropper(false);
            setPreview(null);
        }
    };

    const getRoleLabel = (role: string) => {
        const map: any = {
            'OWNER': 'Administrador', 'MANAGER': 'Financeiro',
            'PROFESSIONAL': 'Fisioterapeuta', 'RECEPTIONIST': 'Secretária(o)'
        };
        return map[role] || role;
    };

    const getRoleBadgeStyle = (role: string) => {
        const colors: any = {
            'OWNER': { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
            'MANAGER': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
            'PROFESSIONAL': { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
            'RECEPTIONIST': { bg: '#faf5ff', color: '#9333ea', border: '#e9d5ff' },
        };
        const c = colors[role] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
        return {
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.65rem', borderRadius: '2rem',
            fontSize: '0.75rem', fontWeight: '700' as const,
            backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`
        };
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

    const errorStyle: React.CSSProperties = {
        color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '600'
    };

    if (showForm) {
        return (
            <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                <button onClick={() => { setShowForm(false); setSelectedUser(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '500' }}>
                    <ArrowLeft size={20} /> Voltar para lista
                </button>
                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
                                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h2>
                            <p style={{ color: '#64748b' }}>Preencha os dados do usuário do sistema.</p>
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
                                    <button type="button" onClick={openWebcam} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#0ea5e9', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                        <Camera size={18} /> Tirar Foto
                                    </button>
                                    <button type="button" onClick={handlePhotoUpload} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>
                                        <Upload size={18} /> Enviar Imagem
                                    </button>
                                    {formData.photoUrl && (
                                        <button type="button" onClick={() => { setFormData(prev => ({ ...prev, photoUrl: '' })); setShowPhotoOptions(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.875rem' }}>
                                            <Trash2 size={18} /> Remover Foto
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Section: Dados de Acesso */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Key size={16} /> Dados de Acesso
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 6' }}>
                                    <label style={labelStyle}>Nome</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inputStyle, borderColor: formErrors.name ? '#ef4444' : '#e2e8f0' }} placeholder="Nome completo" required />
                                    {formErrors.name && <span style={errorStyle}>{formErrors.name}</span>}
                                </div>
                                <div style={{ gridColumn: 'span 6' }}>
                                    <label style={labelStyle}>Registro</label>
                                    <input type="text" value={formData.registration} onChange={e => setFormData({ ...formData, registration: e.target.value })} style={inputStyle} placeholder="Ex: 999999-F" />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                                        Informação do registro. Ex: Crefito: 999999-F
                                    </span>
                                </div>

                                <div style={{ gridColumn: 'span 12' }}>
                                    <label style={labelStyle}>E-mail</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ ...inputStyle, borderColor: formErrors.email ? '#ef4444' : '#e2e8f0' }} placeholder="email@exemplo.com" required />
                                    {formErrors.email && <span style={errorStyle}>{formErrors.email}</span>}
                                </div>

                                <div style={{ gridColumn: 'span 6' }}>
                                    <label style={labelStyle}>Senha {selectedUser && <span style={{ fontWeight: '400', color: '#94a3b8' }}>(deixe em branco para manter)</span>}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ ...inputStyle, paddingRight: '3rem', borderColor: formErrors.password ? '#ef4444' : '#e2e8f0' }} placeholder="Mínimo 6 caracteres" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {formErrors.password && <span style={errorStyle}>{formErrors.password}</span>}
                                </div>
                                <div style={{ gridColumn: 'span 6' }}>
                                    <label style={labelStyle}>Confirmar Senha</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} style={{ ...inputStyle, paddingRight: '3rem', borderColor: formErrors.confirmPassword ? '#ef4444' : '#e2e8f0' }} placeholder="Repita a senha" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {formErrors.confirmPassword && <span style={errorStyle}>{formErrors.confirmPassword}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Permissões */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={16} /> Personalize as permissões de acesso aos recursos
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 6' }}>
                                    <label style={labelStyle}>Função:</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}>
                                        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 6' }}>
                                    <label style={labelStyle}>Pode editar ou arquivar pacientes?</label>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${formData.canEditPatients ? '#0ea5e9' : '#e2e8f0'}`, backgroundColor: formData.canEditPatients ? '#f0f9ff' : 'white', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', color: formData.canEditPatients ? '#0ea5e9' : '#64748b', transition: 'all 0.2s' }}>
                                            <input type="radio" name="canEdit" checked={formData.canEditPatients} onChange={() => setFormData({ ...formData, canEditPatients: true })} style={{ accentColor: '#0ea5e9' }} />
                                            Sim
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${!formData.canEditPatients ? '#ef4444' : '#e2e8f0'}`, backgroundColor: !formData.canEditPatients ? '#fef2f2' : 'white', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', color: !formData.canEditPatients ? '#ef4444' : '#64748b', transition: 'all 0.2s' }}>
                                            <input type="radio" name="canEdit" checked={!formData.canEditPatients} onChange={() => setFormData({ ...formData, canEditPatients: false })} style={{ accentColor: '#ef4444' }} />
                                            Não
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Contato */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} /> Contato
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 12' }}>
                                    <label style={labelStyle}>Telefone / WhatsApp</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} style={inputStyle} placeholder="(00) 0 0000-0000" />
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

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.875rem 1.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', color: '#4b5563', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '0.875rem 2.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Save size={18} /> {selectedUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* WEBCAM MODAL */}
                {showWebcam && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, flexDirection: 'column' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', width: '100%', maxWidth: '500px' }}>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontWeight: '700' }}>Tirar Foto</h3>
                                <button onClick={closeWebcam} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ position: 'relative', width: '100%', height: '350px', backgroundColor: 'black' }}>
                                <video ref={videoRef} playsInline autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <button onClick={capturePhoto} style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '2rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Camera size={18} /> Capturar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CROP MODAL */}
                {showCropper && preview && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontWeight: '700' }}>Ajustar Foto (200x200)</h3>
                                <button onClick={() => { setShowCropper(false); setPreview(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#333' }}>
                                <Cropper
                                    image={preview}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="range" min={1} max={3} step={0.1} value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <button onClick={saveCrop} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.6rem', fontWeight: '700', cursor: 'pointer' }}>
                                    Recortar e Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.025em' }}>Usuários</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Gerencie os usuários e suas permissões no sistema.</p>
                </div>
                <button onClick={() => {
                    setFormData({ name: '', email: '', password: '', confirmPassword: '', registration: '', role: 'Secretária(o)', canEditPatients: true, phone: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: 'PA', photoUrl: '' });
                    setFormErrors({});
                    setSelectedUser(null);
                    setShowForm(true);
                }} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', padding: '0.875rem 1.5rem', borderRadius: '1rem', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)' }}>
                    <UserPlus size={22} /> Novo Usuário
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <div style={{ padding: '1.75rem', borderBottom: '1.5px solid #f8fafc', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '1rem 1.25rem 1rem 3.25rem', borderRadius: '1rem', border: '1.5px solid #f1f5f9', outlineColor: '#0ea5e9', fontSize: '0.95rem', backgroundColor: '#fdfdfd' }}
                        />
                    </div>
                    <button style={{ padding: '1rem', borderRadius: '1rem', border: '1.5px solid #f1f5f9', background: 'white', color: '#64748b', cursor: 'pointer' }}><Filter size={22} /></button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <tr>
                                <th style={{ padding: '1.25rem 2rem' }}>Usuário</th>
                                <th style={{ padding: '1.25rem 2rem' }}>E-mail</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Função</th>
                                <th style={{ padding: '1.25rem 2rem' }}>Registro</th>
                                <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody style={{ color: '#1e293b', fontSize: '0.95rem' }}>
                            {filteredUsers.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '1rem', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#64748b', fontSize: '1.1rem', overflow: 'hidden' }}>
                                                {u.photoUrl ? <img src={u.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name?.[0]}
                                            </div>
                                            <div style={{ fontWeight: '700' }}>{u.name}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem', color: '#64748b' }}>{u.email}</td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <span style={getRoleBadgeStyle(u.role)}>{getRoleLabel(u.role)}</span>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem', color: '#64748b', fontWeight: '600' }}>{u.registration || '-'}</td>
                                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <button onClick={() => {
                                                setSelectedUser(u);
                                                const reverseRoleMap: any = { 'OWNER': 'Administrador', 'MANAGER': 'Financeiro', 'PROFESSIONAL': 'Fisioterapeuta', 'RECEPTIONIST': 'Secretária(o)' };
                                                setFormData({
                                                    name: u.name || '', email: u.email || '', password: '', confirmPassword: '',
                                                    registration: u.registration || '', role: reverseRoleMap[u.role] || 'Secretária(o)',
                                                    canEditPatients: u.canEditPatients !== false, phone: u.phone || '',
                                                    street: u.street || '', number: u.number || '', complement: u.complement || '',
                                                    neighborhood: u.neighborhood || '', city: u.city || '', state: u.state || 'PA',
                                                    photoUrl: u.photoUrl || ''
                                                });
                                                setFormErrors({});
                                                setShowForm(true);
                                            }} title="Editar" style={{ padding: '0.625rem', borderRadius: '0.75rem', background: '#f0f9ff', color: '#0ea5e9', border: 'none', cursor: 'pointer' }}>
                                                <Edit2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
                            <Users size={64} style={{ marginBottom: '1.5rem', opacity: 0.15 }} />
                            <p style={{ fontWeight: '600' }}>Nenhum usuário encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
