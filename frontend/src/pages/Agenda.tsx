import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus, Search, Filter, ChevronLeft, ChevronRight,
    Calendar as CalendarIcon, MapPin, User, ChevronDown, List, X,
    Clock, CheckCircle, AlertCircle, Trash2, Calendar
} from 'lucide-react';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

const Agenda: React.FC = () => {
    const { user } = useAuth();
    const calendarRef = useRef<FullCalendar>(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // States for filters
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);

    // Modals
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    const statusOptions = [
        'Todos', 'Todos exceto os atendidos', 'Agendado', 'Atendido',
        'Cancelado', 'Faltou', 'Faltou com aviso prévio',
        'Presença confirmada', 'Remarcar'
    ];

    const fetchProfessionals = async () => {
        try {
            const res = await api.get('/professionals', { params: { clinicId: user?.clinicId } });
            setProfessionals(res.data);
            // Default to the first professional or empty
            if (res.data.length > 0) {
                // setSelectedProfessionals([res.data[0].name]);
            }
        } catch (err) {
            console.error('Erro ao buscar profissionais', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/appointments', { params: { clinicId: user?.clinicId } });
            const mappedEvents = res.data.map((app: any) => ({
                id: app.id,
                title: `${app.patient.name}`,
                start: app.startTime,
                end: app.endTime,
                backgroundColor: getStatusColor(app.status),
                borderColor: 'transparent',
                extendedProps: { ...app }
            }));

            // Client-side filtering logic
            let filtered = mappedEvents;
            if (selectedStatus !== 'Todos') {
                const statusMap: any = {
                    'Agendado': 'SCHEDULED',
                    'Atendido': 'COMPLETED',
                    'Cancelado': 'CANCELLED',
                    'Faltou': 'NO_SHOW',
                    'Presença confirmada': 'CONFIRMED'
                };
                const mappedStatus = statusMap[selectedStatus];
                if (mappedStatus) filtered = filtered.filter((ev: any) => ev.extendedProps.status === mappedStatus);
                else if (selectedStatus === 'Todos exceto os atendidos') {
                    filtered = filtered.filter((ev: any) => ev.extendedProps.status !== 'COMPLETED');
                }
            }
            if (patientSearch) {
                filtered = filtered.filter((ev: any) => ev.title.toLowerCase().includes(patientSearch.toLowerCase()));
            }
            if (selectedProfessionals.length > 0) {
                filtered = filtered.filter((ev: any) => selectedProfessionals.includes(ev.extendedProps.professional?.name));
            }

            setEvents(filtered);
        } catch (err) {
            console.error('Erro ao buscar agendamentos', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return '#10b981';
            case 'CANCELLED': return '#ef4444';
            case 'NO_SHOW': return '#f59e0b';
            case 'CONFIRMED': return '#0ea5e9';
            default: return '#cbd5e1';
        }
    };

    useEffect(() => {
        if (user?.clinicId) {
            fetchProfessionals();
        }
    }, [user?.clinicId]);

    useEffect(() => {
        fetchAppointments();
    }, [user?.clinicId, selectedStatus, patientSearch, selectedProfessionals]);

    const changeView = (view: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) calendarApi.changeView(view);
    };

    // Modal Form States
    const [modalDate, setModalDate] = useState('');
    const [modalTime, setModalTime] = useState('');
    const [modalStatus, setModalStatus] = useState('');

    const handleUpdate = async () => {
        if (!selectedEvent) return;
        try {
            const startTime = new Date(`${modalDate}T${modalTime}`);
            const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 mins default

            await api.patch(`/appointments/${selectedEvent.id}`, {
                startTime,
                endTime,
                status: modalStatus
            });

            setShowAppointmentModal(false);
            fetchAppointments();
        } catch (err) {
            console.error('Erro ao atualizar agendamento', err);
        }
    };

    const handleCancel = async () => {
        if (!selectedEvent) return;
        if (window.confirm('Deseja realmente cancelar este agendamento?')) {
            try {
                await api.patch(`/appointments/${selectedEvent.id}`, { status: 'CANCELLED' });
                setShowAppointmentModal(false);
                fetchAppointments();
            } catch (err) {
                console.error('Erro ao cancelar agendamento', err);
            }
        }
    };

    useEffect(() => {
        if (selectedEvent) {
            const dateStr = new Date(selectedEvent.start).toISOString().split('T')[0];
            const timeStr = new Date(selectedEvent.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            setModalDate(dateStr);
            setModalTime(timeStr);
            setModalStatus(selectedEvent.extendedProps.status);
        }
    }, [selectedEvent]);

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Agenda</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => { setModalMode('create'); setShowAppointmentModal(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0ea5e9', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        <Plus size={18} /> Novo agendamento
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: '#475569', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <Search size={18} /> Buscar horários
                    </button>
                </div>
            </div>

            {/* Advanced Filter Bar */}
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #f1f5f9', marginBottom: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status:</label>
                        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', outlineColor: '#0ea5e9', fontSize: '0.85rem' }}>
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div style={{ gridColumn: 'span 4' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Paciente:</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Filtrar por paciente"
                                value={patientSearch}
                                onChange={e => setPatientSearch(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', outlineColor: '#0ea5e9', fontSize: '0.85rem' }}
                            />
                            {patientSearch && <X size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }} onClick={() => setPatientSearch('')} />}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Sala/Convênio/Área:</label>
                            <button onClick={() => setSelectedArea('')} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>Limpar</button>
                        </div>
                        <input type="text" placeholder="Geral" value={selectedArea} onChange={e => setSelectedArea(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', outlineColor: '#0ea5e9', fontSize: '0.85rem' }} />
                        {!selectedArea && <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>Nenhum filtro selecionado</span>}
                    </div>

                    <div style={{ gridColumn: 'span 3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Profissionais:</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSelectedProfessionals(professionals.map(p => p.name))}
                                    style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Selecionar todos
                                </button>
                                <button onClick={() => setSelectedProfessionals([])} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>Limpar</button>
                            </div>
                        </div>
                        <select
                            onChange={e => {
                                if (e.target.value && !selectedProfessionals.includes(e.target.value)) {
                                    setSelectedProfessionals(prev => [...prev, e.target.value]);
                                }
                            }}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
                        >
                            <option value="">{selectedProfessionals.length} profissional selecionado</option>
                            {professionals.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {selectedProfessionals.map(p => (
                                <div key={p} style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {p} <X size={12} cursor="pointer" onClick={() => setSelectedProfessionals(prev => prev.filter(item => item !== p))} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Calendar View Toggle and Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <button onClick={() => changeView('dayGridMonth')} style={{ padding: '0.5rem 1rem', border: 'none', background: 'white', color: '#475569', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }}>Mês</button>
                    <button onClick={() => changeView('timeGridDay')} style={{ padding: '0.5rem 1rem', border: 'none', background: 'white', color: '#475569', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }}>Dia</button>
                    <button onClick={() => changeView('timeGridWeek')} style={{ padding: '0.5rem 1rem', border: 'none', background: '#f1f5f9', color: '#0ea5e9', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }}>Semana</button>
                    <button onClick={() => changeView('listDay')} style={{ padding: '0.5rem 1rem', border: 'none', background: 'white', color: '#475569', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }}>Lista do dia</button>
                    <button onClick={() => changeView('listWeek')} style={{ padding: '0.5rem 1rem', border: 'none', background: 'white', color: '#475569', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }}>Lista da semana</button>
                    <button style={{ padding: '0.5rem 1rem', border: 'none', background: 'white', color: '#475569', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>Profissionais</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        onClick={() => calendarRef.current?.getApi().prev()}
                        style={{ width: '32px', height: '32px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Selecionar data</button>
                    <button
                        onClick={() => calendarRef.current?.getApi().today()}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => calendarRef.current?.getApi().next()}
                        style={{ width: '32px', height: '32px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Calendar Section */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={false} // Custom toolbar implemented above
                    locales={[ptBrLocale]}
                    locale="pt-br"
                    allDaySlot={false}
                    slotMinTime="07:00:00"
                    slotMaxTime="21:00:00"
                    events={events}
                    height="auto"
                    eventClick={(info) => {
                        setSelectedEvent(info.event);
                        setModalMode('edit');
                        setShowAppointmentModal(true);
                    }}
                    selectable={true}
                    nowIndicator={true}
                    slotLabelFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridian: false }}
                />
            </div>

            {/* Detailed Appointment Modal */}
            {showAppointmentModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
                                {modalMode === 'edit' ? 'Detalhes do Agendamento' : 'Novo Agendamento'}
                            </h2>
                            <button onClick={() => setShowAppointmentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={22} /></button>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            {modalMode === 'edit' && selectedEvent ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Patient Info Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '1rem', backgroundColor: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900' }}>
                                            {selectedEvent.title[0]}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>{selectedEvent.title}</h3>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>CPF: {selectedEvent.extendedProps.patient?.cpf || '000.000.000-00'}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Telefone: {selectedEvent.extendedProps.patient?.phone || '(00) 0 0000-0000'}</p>
                                        </div>
                                    </div>

                                    {/* Editable Fields */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Data:</label>
                                            <input
                                                type="date"
                                                value={modalDate}
                                                onChange={e => setModalDate(e.target.value)}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Horário:</label>
                                            <input
                                                type="time"
                                                value={modalTime}
                                                onChange={e => setModalTime(e.target.value)}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }}
                                            />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status:</label>
                                            <select
                                                value={modalStatus}
                                                onChange={e => setModalStatus(e.target.value)}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', fontWeight: '600' }}
                                            >
                                                <option value="SCHEDULED">Agendado</option>
                                                <option value="CONFIRMED">Confirmado</option>
                                                <option value="COMPLETED">Atendido</option>
                                                <option value="CANCELLED">Cancelado</option>
                                                <option value="NO_SHOW">Faltou</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Additional Info / Observation Placeholder */}
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem', marginBottom: '0.5rem' }}><User size={16} /> Profissional: <strong>{selectedEvent.extendedProps.professional?.name}</strong></p>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}><MapPin size={16} /> Área/Sala: <strong>Geral</strong></p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Create Form Fields Placeholder */}
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Paciente:</label>
                                    <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }}>
                                        <option>Selecione o paciente...</option>
                                    </select>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                        <input type="date" placeholder="Data" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} />
                                        <input type="time" placeholder="Hora" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem 2rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                {modalMode === 'edit' && (
                                    <button
                                        onClick={handleCancel}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                        <Trash2 size={18} /> Cancelar Agendamento
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowAppointmentModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>Fechar</button>
                                <button
                                    onClick={handleUpdate}
                                    style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', background: '#0ea5e9', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }}
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Styles */}
            <style>{`
        .fc { --fc-border-color: #f1f5f9; --fc-daygrid-event-dot-width: 8px; }
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #f1f5f9; }
        .fc-toolbar-title { font-size: 1.1rem !important; fontWeight: 800 !important; }
        .fc-col-header-cell { padding: 10px 0 !important; background-color: #f8fafc; border: none !important; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; }
        .fc-list-day-cushion { background-color: #f8fafc !important; }
        .fc-event { border-radius: 6px !important; padding: 2px 6px !important; font-size: 0.8rem !important; font-weight: 600 !important; }
        .fc-timegrid-slot { height: 3rem !important; }
        .fc-v-event { box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      `}</style>
        </div>
    );
};

export default Agenda;
