import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.access_token, response.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao realizar login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', width: '100%', maxWidth: '28rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    {/* Logo Placeholder - User can replace with <img src="/logo.png" /> */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#e0f2fe', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                            <LogIn size={40} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.025em' }}>Bellas Fisio</h2>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>Bem-vindo de volta! Entre na sua conta.</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', outline: 'none', transition: 'border-color 0.2s', fontSize: '1rem' }}
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Senha</label>
                            <button type="button" style={{ fontSize: '0.825rem', color: '#0ea5e9', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>
                                Esqueceu a senha?
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.875rem', paddingRight: '3rem', borderRadius: '0.75rem', border: '1.5px solid #e5e7eb', outline: 'none', transition: 'border-color 0.2s', fontSize: '1rem' }}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: '#0ea5e9',
                            color: 'white',
                            borderRadius: '0.75rem',
                            fontWeight: '700',
                            fontSize: '1rem',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Entrando...' : 'Acessar Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
