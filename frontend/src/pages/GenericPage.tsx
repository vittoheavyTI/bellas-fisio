import React from 'react';
import { useLocation } from 'react-router-dom';

const GenericPage: React.FC = () => {
    const location = useLocation();
    const pathParts = location.pathname.split('/').filter(Boolean);
    const title = pathParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' > ');

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.025em' }}>
                    {title || 'Página'}
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Esta página está sob desenvolvimento. Explore os menus para ver a nova estrutura.
                </p>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '3rem',
                border: '1.5px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#f0f9ff',
                    color: '#0ea5e9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0z" />
                        <path d="m20 10 2 2" />
                        <path d="m14 4 2 2" />
                        <path d="m11.5 8 1.5 1.5" />
                        <path d="M19 14.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3h1.5" />
                        <path d="m12 18 2 2" />
                        <path d="M3 10h2" />
                        <path d="M3 13h2" />
                    </svg>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>Em Construção</h2>
                <p style={{ color: '#64748b', maxWidth: '400px', marginTop: '0.75rem' }}>
                    O conteúdo de <strong>{location.pathname}</strong> será implementado em breve seguindo a nova hierarquia de funcionalidades.
                </p>
            </div>
        </div>
    );
};

export default GenericPage;
