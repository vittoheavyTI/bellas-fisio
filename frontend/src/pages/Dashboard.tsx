import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Users, Calendar, TrendingUp, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        patients: 0,
        appointmentsToday: 0,
        revenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [patientsRes, appointmentsRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/appointments') // Adicionar filtro de data se necessário
                ]);

                // Simulação básica de estatísticas
                setStats({
                    patients: patientsRes.data.length,
                    appointmentsToday: appointmentsRes.data.filter((a: any) => new Date(a.startTime).toDateString() === new Date().toDateString()).length,
                    revenue: 1250.00 // Exemplo estático
                });
            } catch (err) {
                console.error('Erro ao buscar estatísticas', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '2rem' }}>Dashboard</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {/* Card 1 */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '0.75rem' }}>
                            <Users color="#0ea5e9" size={24} />
                        </div>
                    </div>
                    <h3 style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Total de Pacientes</h3>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginTop: '0.25rem' }}>{stats.patients}</p>
                </div>

                {/* Card 2 */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.75rem' }}>
                            <Calendar color="#10b981" size={24} />
                        </div>
                    </div>
                    <h3 style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Agendamentos Hoje</h3>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginTop: '0.25rem' }}>{stats.appointmentsToday}</p>
                </div>

                {/* Card 3 */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.75rem' }}>
                            <TrendingUp color="#f59e0b" size={24} />
                        </div>
                    </div>
                    <h3 style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Faturamento Mensal</h3>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginTop: '0.25rem' }}>R$ {stats.revenue.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
