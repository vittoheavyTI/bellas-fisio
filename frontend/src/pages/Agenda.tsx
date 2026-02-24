import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus, Search, ChevronLeft, ChevronRight,
    MapPin, User, X, Clock, Trash2, Phone,
    Mail, CalendarDays, Stethoscope, FileText,
    MessageCircle, Save, RefreshCw
} from 'lucide-react';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    // Patients list for create modal
    const [patientsList, setPatientsList] = useState<any[]>([]);
    const [patientSearchModal, setPatientSearchModal] = useState('');

    // Search hours modal
    const [searchProfessional, setSearchProfessional] = useState('');
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [searchingSlots, setSearchingSlots] = useState(false);

    const statusOptions = [
        'Todos', 'Todos exceto os atendidos', 'Agendado', 'Atendido',
        'Cancelado', 'Faltou', 'Faltou com aviso prévio',
        'Presença confirmada', 'Remarcar'
    ];

    // Create form states
    const [createForm, setCreateForm] = useState({
        patientId: '',
        patientName: '',
        professionalId: '',
        date: new Date().toISOString().split('T')[0],
        time: '08:00',
        duration: 30,
        procedureId: '',
        healthPlanId: '',
        status: 'SCHEDULED',
        observations: ''
    });

    const fetchProfessionals = async () => {
        try {
            const res = await api.get('/professionals', { params: { clinicId: user?.clinicId } });
            setProfessionals(res.data);
        } catch (err) {
            console.error('Erro ao buscar profissionais', err);
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients', { params: { clinicId: user?.clinicId } });
            setPatientsList(res.data);
        } catch (err) {
            console.error('Erro ao buscar pacientes', err);
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
            case 'SCHEDULED': return '#8b5cf6';
            default: return '#cbd5e1';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Atendido';
            case 'CANCELLED': return 'Cancelado';
            case 'NO_SHOW': return 'Faltou';
            case 'CONFIRMED': return 'Confirmado';
            case 'SCHEDULED': return 'Agendado';
            default: return status;
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        const color = getStatusColor(status);
        return {
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.3rem 0.75rem', borderRadius: '2rem',
            fontSize: '0.75rem', fontWeight: '700' as const,
            backgroundColor: color + '18', color: color,
            border: `1px solid ${color}30`
        };
    };

    useEffect(() => {
        if (user?.clinicId) {
            fetchProfessionals();
            fetchPatients();
        }
    }, [user?.clinicId]);

    useEffect(() => {
        fetchAppointments();
    }, [user?.clinicId, selectedStatus, patientSearch, selectedProfessionals]);

    const changeView = (view: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) calendarApi.changeView(view);
    };

    const handleDateSelect = (dateStr: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.gotoDate(dateStr);
        }
        setShowDatePicker(false);
    };

    // Modal Form States for edit
    const [modalDate, setModalDate] = useState('');
    const [modalTime, setModalTime] = useState('');
    const [modalStatus, setModalStatus] = useState('');

    const handleUpdate = async () => {
        if (!selectedEvent) return;
        try {
            const startTime = new Date(`${modalDate}T${modalTime}`);
            const endTime = new Date(startTime.getTime() + 30 * 60000);
            await api.patch(`/appointments/${selectedEvent.id}`, {
                startTime, endTime, status: modalStatus
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

    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (window.confirm('Deseja realmente EXCLUIR este agendamento? Esta ação não pode ser desfeita.')) {
            try {
                await api.delete(`/appointments/${selectedEvent.id}`);
                setShowAppointmentModal(false);
                fetchAppointments();
            } catch (err) {
                console.error('Erro ao excluir agendamento', err);
            }
        }
    };

    const handleCreate = async () => {
        try {
            if (!createForm.patientId || !createForm.professionalId) {
                alert('Selecione o paciente e o profissional.');
                return;
            }
            const startTime = new Date(`${createForm.date}T${createForm.time}`);
            const endTime = new Date(startTime.getTime() + createForm.duration * 60000);
            await api.post('/appointments', {
                patientId: createForm.patientId,
                professionalId: createForm.professionalId,
                clinicId: user?.clinicId,
                startTime,
                endTime,
                status: createForm.status,
                procedureId: createForm.procedureId || undefined
            });
            setShowAppointmentModal(false);
            setCreateForm({
                patientId: '', patientName: '', professionalId: '',
                date: new Date().toISOString().split('T')[0], time: '08:00',
                duration: 30, procedureId: '', healthPlanId: '',
                status: 'SCHEDULED', observations: ''
            });
            fetchAppointments();
        } catch (err) {
            console.error('Erro ao criar agendamento', err);
            alert('Erro ao criar agendamento. Verifique os dados.');
        }
    };

    const openWhatsApp = (phone: string) => {
        const cleaned = phone?.replace(/\D/g, '') || '';
        if (cleaned) {
            window.open(`https://wa.me/55${cleaned}`, '_blank');
        }
    };

    const searchAvailableSlots = () => {
        setSearchingSlots(true);
        // Generate available time slots (mock logic - in production would check against existing appointments)
        const slots: string[] = [];
        for (let h = 7; h <= 20; h++) {
            slots.push(`${String(h).padStart(2, '0')}:00`);
            slots.push(`${String(h).padStart(2, '0')}:30`);
        }
        setTimeout(() => {
            setAvailableSlots(slots);
            setSearchingSlots(false);
        }, 500);
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

    const filteredPatientsForModal = patientsList.filter(p =>
        p.name.toLowerCase().includes(patientSearchModal.toLowerCase()) ||
        p.cpf?.includes(patientSearchModal)
    );

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.7rem 0.85rem', borderRadius: '0.6rem',
        border: '1.5px solid #e2e8f0', fontSize: '0.85rem', fontWeight: '500',
        outline: 'none', transition: 'border-color 0.2s',
        backgroundColor: '#fdfdfd'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.7rem', fontWeight: '800',
        color: '#64748b', textTransform: 'uppercase',
        letterSpacing: '0.05em', marginBottom: '0.4rem'
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Agenda</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => { setModalMode('create'); setShowAppointmentModal(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0ea5e9', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(14,165,233,0.3)', transition: 'all 0.2s' }}
                    >
                        <Plus size={18} /> Novo agendamento
                    </button>
                    <button
                        onClick={() => setShowSearchModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: '#475569', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                    >
                        <Search size={18} /> Buscar horários
                    </button>
                </div>
            </div>

            {/* Advanced Filter Bar */}
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #f1f5f9', marginBottom: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Status:</label>
                        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div style={{ gridColumn: 'span 4' }}>
                        <label style={labelStyle}>Paciente:</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Filtrar por paciente"
                                value={patientSearch}
                                onChange={e => setPatientSearch(e.target.value)}
                                style={{ ...inputStyle, paddingRight: '2.5rem' }}
                            />
                            {patientSearch && <X size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }} onClick={() => setPatientSearch('')} />}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Sala/Convênio/Área:</label>
                            <button onClick={() => setSelectedArea('')} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>Limpar</button>
                        </div>
                        <input type="text" placeholder="Geral" value={selectedArea} onChange={e => setSelectedArea(e.target.value)} style={inputStyle} />
                        {!selectedArea && <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>Nenhum filtro selecionado</span>}
                    </div>

                    <div style={{ gridColumn: 'span 3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Profissionais:</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setSelectedProfessionals(professionals.map(p => p.name))} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>Todos</button>
                                <button onClick={() => setSelectedProfessionals([])} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>Limpar</button>
                            </div>
                        </div>
                        <select
                            onChange={e => {
                                if (e.target.value && !selectedProfessionals.includes(e.target.value)) {
                                    setSelectedProfessionals(prev => [...prev, e.target.value]);
                                }
                            }}
                            style={{ ...inputStyle, cursor: 'pointer' }}
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
                    {[
                        { label: 'Mês', view: 'dayGridMonth' },
                        { label: 'Dia', view: 'timeGridDay' },
                        { label: 'Semana', view: 'timeGridWeek' },
                        { label: 'Lista do dia', view: 'listDay' },
                        { label: 'Lista da semana', view: 'listWeek' },
                    ].map((item, i) => (
                        <button
                            key={item.view}
                            onClick={() => changeView(item.view)}
                            style={{ padding: '0.5rem 1rem', border: 'none', background: item.view === 'timeGridWeek' ? '#f0f9ff' : 'white', color: item.view === 'timeGridWeek' ? '#0ea5e9' : '#475569', fontSize: '0.85rem', fontWeight: item.view === 'timeGridWeek' ? '700' : '600', cursor: 'pointer', borderRight: i < 4 ? '1px solid #e2e8f0' : 'none', transition: 'all 0.2s' }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        onClick={() => calendarRef.current?.getApi().prev()}
                        style={{ width: '36px', height: '36px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Selecionar data - FUNCTIONAL */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: showDatePicker ? '#f0f9ff' : 'white', fontSize: '0.85rem', fontWeight: '600', color: showDatePicker ? '#0ea5e9' : '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                        >
                            <CalendarDays size={16} /> Selecionar data
                        </button>
                        {showDatePicker && (
                            <div style={{ position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', padding: '1rem', zIndex: 100, minWidth: '200px' }}>
                                <input
                                    type="date"
                                    onChange={e => handleDateSelect(e.target.value)}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => calendarRef.current?.getApi().today()}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.85rem', fontWeight: '600', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => calendarRef.current?.getApi().next()}
                        style={{ width: '36px', height: '36px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
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
                    headerToolbar={false}
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
                    slotLabelFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false }}
                />
            </div>

            {/* ===================== MODAL: BUSCAR HORÁRIOS ===================== */}
            {showSearchModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '520px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Search size={20} /> Buscar Horários Disponíveis
                            </h2>
                            <button onClick={() => setShowSearchModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: '0.5rem', padding: '0.35rem' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Profissional:</label>
                                <select value={searchProfessional} onChange={e => setSearchProfessional(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="">Todos os profissionais</option>
                                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Data:</label>
                                <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} style={inputStyle} />
                            </div>
                            <button
                                onClick={searchAvailableSlots}
                                disabled={searchingSlots}
                                style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#0ea5e9', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: searchingSlots ? 0.7 : 1 }}
                            >
                                {searchingSlots ? <><RefreshCw size={16} className="spin" /> Buscando...</> : <><Search size={16} /> Buscar horários</>}
                            </button>
                            {availableSlots.length > 0 && (
                                <div>
                                    <label style={labelStyle}>Horários disponíveis:</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem 0' }}>
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => {
                                                    setCreateForm(prev => ({ ...prev, date: searchDate, time: slot }));
                                                    setShowSearchModal(false);
                                                    setModalMode('create');
                                                    setShowAppointmentModal(true);
                                                }}
                                                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                                                onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = '#f0f9ff'; (e.target as HTMLElement).style.borderColor = '#0ea5e9'; (e.target as HTMLElement).style.color = '#0ea5e9'; }}
                                                onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'white'; (e.target as HTMLElement).style.borderColor = '#e2e8f0'; (e.target as HTMLElement).style.color = '#334155'; }}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== MODAL: AGENDAMENTO (Create/Edit) ===================== */}
            {showAppointmentModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '680px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: modalMode === 'create' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : '#f8fafc', flexShrink: 0 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: modalMode === 'create' ? 'white' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {modalMode === 'edit' ? <><Stethoscope size={20} /> Detalhes do Agendamento</> : <><Plus size={20} /> Novo Agendamento</>}
                            </h2>
                            <button onClick={() => setShowAppointmentModal(false)} style={{ background: modalMode === 'create' ? 'rgba(255,255,255,0.2)' : '#f1f5f9', border: 'none', cursor: 'pointer', color: modalMode === 'create' ? 'white' : '#94a3b8', borderRadius: '0.5rem', padding: '0.35rem' }}><X size={22} /></button>
                        </div>

                        {/* Body - scrollable */}
                        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
                            {modalMode === 'edit' && selectedEvent ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Patient Info Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '1rem' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900', flexShrink: 0 }}>
                                            {selectedEvent.title?.[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827', marginBottom: '0.35rem' }}>{selectedEvent.title}</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.8rem' }}>
                                                    <FileText size={14} /> CPF: {selectedEvent.extendedProps.patient?.cpf || 'Não informado'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.8rem' }}>
                                                    <Mail size={14} /> {selectedEvent.extendedProps.patient?.email || 'Sem e-mail'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={getStatusBadgeStyle(selectedEvent.extendedProps.status)}>
                                            {getStatusLabel(selectedEvent.extendedProps.status)}
                                        </div>
                                    </div>

                                    {/* Phone + WhatsApp */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #dcfce7' }}>
                                        <Phone size={18} color="#16a34a" />
                                        <span style={{ fontWeight: '600', color: '#166534', fontSize: '0.9rem', flex: 1 }}>
                                            {selectedEvent.extendedProps.patient?.phone || '(00) 0 0000-0000'}
                                        </span>
                                        <button
                                            onClick={() => openWhatsApp(selectedEvent.extendedProps.patient?.phone)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#25D366', color: 'white', padding: '0.45rem 0.85rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(37,211,102,0.3)' }}
                                            title="Abrir WhatsApp"
                                        >
                                            <WhatsAppIcon size={18} />
                                            <span style={{ color: 'white' }}>WhatsApp</span>
                                        </button>
                                    </div>

                                    {/* Editable Fields */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Data:</label>
                                            <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Horário:</label>
                                            <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} style={inputStyle} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={labelStyle}>Status:</label>
                                            <select value={modalStatus} onChange={e => setModalStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                                <option value="SCHEDULED">Agendado</option>
                                                <option value="CONFIRMED">Confirmado</option>
                                                <option value="COMPLETED">Atendido</option>
                                                <option value="CANCELLED">Cancelado</option>
                                                <option value="NO_SHOW">Faltou</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem' }}>
                                            <User size={16} color="#0ea5e9" /> Profissional: <strong>{selectedEvent.extendedProps.professional?.name || 'Não definido'}</strong>
                                        </p>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem' }}>
                                            <Stethoscope size={16} color="#0ea5e9" /> Procedimento: <strong>{selectedEvent.extendedProps.procedure?.name || 'Geral'}</strong>
                                        </p>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem' }}>
                                            <MapPin size={16} color="#0ea5e9" /> Área/Sala: <strong>Geral</strong>
                                        </p>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem' }}>
                                            <Clock size={16} color="#0ea5e9" /> Duração: <strong>{selectedEvent.end && selectedEvent.start ? Math.round((new Date(selectedEvent.end).getTime() - new Date(selectedEvent.start).getTime()) / 60000) + ' min' : '30 min'}</strong>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* ===== CREATE FORM ===== */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Patient Selection with Search */}
                                    <div>
                                        <label style={labelStyle}>Paciente:</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                placeholder="Buscar paciente por nome ou CPF..."
                                                value={createForm.patientName || patientSearchModal}
                                                onChange={e => {
                                                    setPatientSearchModal(e.target.value);
                                                    setCreateForm(prev => ({ ...prev, patientName: '', patientId: '' }));
                                                }}
                                                style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                            />
                                            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        </div>
                                        {patientSearchModal && !createForm.patientId && (
                                            <div style={{ marginTop: '0.25rem', backgroundColor: 'white', borderRadius: '0.6rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', maxHeight: '160px', overflowY: 'auto' }}>
                                                {filteredPatientsForModal.map(p => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => {
                                                            setCreateForm(prev => ({ ...prev, patientId: p.id, patientName: p.name }));
                                                            setPatientSearchModal('');
                                                        }}
                                                        style={{ padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background-color 0.15s' }}
                                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                                                    >
                                                        <span style={{ fontWeight: '600' }}>{p.name}</span>
                                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{p.cpf || 'Sem CPF'}</span>
                                                    </div>
                                                ))}
                                                {filteredPatientsForModal.length === 0 && (
                                                    <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Nenhum paciente encontrado</div>
                                                )}
                                            </div>
                                        )}
                                        {createForm.patientId && (
                                            <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9', padding: '0.25rem 0.65rem', borderRadius: '0.35rem', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <User size={14} /> {createForm.patientName}
                                                    <X size={14} style={{ cursor: 'pointer', marginLeft: '0.25rem' }} onClick={() => setCreateForm(prev => ({ ...prev, patientId: '', patientName: '' }))} />
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Professional */}
                                    <div>
                                        <label style={labelStyle}>Profissional:</label>
                                        <select value={createForm.professionalId} onChange={e => setCreateForm(prev => ({ ...prev, professionalId: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="">Selecione o profissional...</option>
                                            {professionals.map(p => <option key={p.id} value={p.id}>{p.name} — {p.specialty || 'Geral'}</option>)}
                                        </select>
                                    </div>

                                    {/* Date, Time, Duration */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Data:</label>
                                            <input type="date" value={createForm.date} onChange={e => setCreateForm(prev => ({ ...prev, date: e.target.value }))} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Horário:</label>
                                            <input type="time" value={createForm.time} onChange={e => setCreateForm(prev => ({ ...prev, time: e.target.value }))} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Duração:</label>
                                            <select value={createForm.duration} onChange={e => setCreateForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                                <option value={15}>15 minutos</option>
                                                <option value={30}>30 minutos</option>
                                                <option value={45}>45 minutos</option>
                                                <option value={60}>1 hora</option>
                                                <option value={90}>1h 30min</option>
                                                <option value={120}>2 horas</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label style={labelStyle}>Status:</label>
                                        <select value={createForm.status} onChange={e => setCreateForm(prev => ({ ...prev, status: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="SCHEDULED">Agendado</option>
                                            <option value="CONFIRMED">Confirmado</option>
                                        </select>
                                    </div>

                                    {/* Observations */}
                                    <div>
                                        <label style={labelStyle}>Observações:</label>
                                        <textarea
                                            value={createForm.observations}
                                            onChange={e => setCreateForm(prev => ({ ...prev, observations: e.target.value }))}
                                            placeholder="Anotações sobre o agendamento..."
                                            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1.25rem 1.75rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {modalMode === 'edit' && (
                                    <>
                                        <button
                                            onClick={handleCancel}
                                            style={{ color: '#f59e0b', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', padding: '0.6rem 0.85rem', borderRadius: '0.6rem', transition: 'all 0.2s' }}
                                        >
                                            <X size={16} /> Cancelar
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', padding: '0.6rem 0.85rem', borderRadius: '0.6rem', transition: 'all 0.2s' }}
                                        >
                                            <Trash2 size={16} /> Excluir
                                        </button>
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => setShowAppointmentModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '0.6rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b', transition: 'all 0.2s' }}>Fechar</button>
                                <button
                                    onClick={modalMode === 'edit' ? handleUpdate : handleCreate}
                                    style={{ padding: '0.65rem 1.5rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                                >
                                    <Save size={16} /> {modalMode === 'edit' ? 'Salvar' : 'Agendar'}
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
                .fc-toolbar-title { font-size: 1.1rem !important; font-weight: 800 !important; }
                .fc-col-header-cell { padding: 10px 0 !important; background-color: #f8fafc; border: none !important; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; }
                .fc-list-day-cushion { background-color: #f8fafc !important; }
                .fc-event { border-radius: 6px !important; padding: 2px 6px !important; font-size: 0.8rem !important; font-weight: 600 !important; cursor: pointer !important; }
                .fc-timegrid-slot { height: 3rem !important; }
                .fc-v-event { box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default Agenda;
