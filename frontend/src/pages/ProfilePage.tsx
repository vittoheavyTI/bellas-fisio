import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Camera, Upload, Save, X, Edit2, User, Key, Mail, Phone, Lock } from 'lucide-react';
import Cropper from 'react-easy-crop';

const ProfilePage: React.FC = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: ''
    });

    // Photo / Crop State
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [showCropper, setShowCropper] = useState(false);

    // Webcam State
    const [showWebcam, setShowWebcam] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name, email: user.email, phone: user.phone || '' }));
            setPhotoUrl(user.photoUrl || null);
        }
    }, [user]);

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
            setShowCropper(true);
        }
    };

    // ==== FILE UPLOAD ====
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
    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
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
            setPhotoUrl(croppedImage);
            setShowCropper(false);
            setPreview(null);
        }
    };

    // ==== SUBMIT ====
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const dataToUpdate: any = {
                name: formData.name, email: formData.email, phone: formData.phone, photoUrl
            };
            if (formData.password) dataToUpdate.password = formData.password;

            const res = await api.put('/users/me', dataToUpdate);
            alert('Perfil atualizado com sucesso!');
            // Preserve real token and update user data
            const currentToken = localStorage.getItem('access_token') || 'mock_token';
            const updatedUser = { ...user, ...res.data };
            login(currentToken, updatedUser);
        } catch (error) {
            console.error('Erro ao salvar perfil', error);
            alert('Erro ao atualizar o perfil.');
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.875rem 1rem 0.875rem 2.5rem', borderRadius: '0.75rem',
        border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', backgroundColor: '#f8fafc'
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#111827' }}>Meu Perfil</h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Gerencie suas informações pessoais e foto de perfil.</p>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '2rem' }}>
                <form onSubmit={handleSubmit}>

                    {/* Header: Photo and Basic Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f1f5f9', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={48} color="#94a3b8" />
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                                <button type="button" onClick={openWebcam} style={{ background: '#0ea5e9', color: 'white', padding: '0.4rem', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(14,165,233,0.3)' }} title="Tirar Foto">
                                    <Camera size={16} />
                                </button>
                                <label style={{ background: '#10b981', color: 'white', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Fazer Upload">
                                    <Upload size={16} />
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>{user?.name || 'Carregando...'}</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user?.role === 'PROFESSIONAL' ? 'Profissional' : user?.role === 'RECEPTIONIST' ? 'Recepcionista' : 'Administrador'}</p>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#f0fdf4', color: '#16a34a', borderRadius: '1rem', fontWeight: '700' }}>Conta Ativa</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Nome Completo</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} required />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} required />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Celular</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', marginBottom: '1.25rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>Alterar Senha</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Deixe em branco se não quiser alterar a senha atual.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div>
                            <label style={labelStyle}>Nova Senha</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Mínimo 6 caracteres" minLength={6} style={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Confirmar Nova Senha</label>
                            <div style={{ position: 'relative' }}>
                                <Key size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Repita a nova senha" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', padding: '0.875rem 2rem', borderRadius: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(14,165,233,0.3)' }}>
                            <Save size={18} /> Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>

            {/* WEBCAM MODAL */}
            {showWebcam && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, flexDirection: 'column' }}>
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
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
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
};

export default ProfilePage;
