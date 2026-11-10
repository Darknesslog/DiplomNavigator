import React, { useState } from 'react';

interface Application {
  id: number;
  studentName: string;
  initials: string;
  group: string;
  topic: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface MyTopic {
  id: number;
  title: string;
  description: string;
  student: string | null;
  status: string;
}

const initialApplications: Application[] = [
  {
    id: 1,
    studentName: 'Иванов Алексей Дмитриевич',
    initials: 'АИ',
    group: 'Группа ИС-41 · Бакалавриат',
    topic: 'Разработка системы учёта заявок технической поддержки университета',
    date: 'Подана 17 сентября 2025',
    status: 'pending',
  },
  {
    id: 2,
    studentName: 'Козлова Анна Сергеевна',
    initials: 'АК',
    group: 'Группа ПИ-41 · Бакалавриат',
    topic: 'Проектирование мобильного приложения для записи в университетскую библиотеку',
    date: 'Подана 16 сентября 2025',
    status: 'pending',
  },
  {
    id: 3,
    studentName: 'Семёнов Артём Михайлович',
    initials: 'АС',
    group: 'Группа ИС-42 · Бакалавриат',
    topic: 'Разработка сервиса планирования индивидуальной образовательной траектории',
    date: 'Подана 15 сентября 2025',
    status: 'pending',
  },
];

const myTopics: MyTopic[] = [
  {
    id: 1,
    title: 'Разработка системы учёта заявок технической поддержки университета',
    description: 'Целью работы является создание информационной системы для автоматизации обработки обращений студентов и сотрудников.',
    student: 'Иванов Алексей Дмитриевич',
    status: 'На рассмотрении',
  },
  {
    id: 2,
    title: 'Проектирование мобильного приложения для записи в университетскую библиотеку',
    description: 'Разработка кроссплатформенного мобильного приложения с функцией бронирования книг и уведомлений о сроках возврата.',
    student: 'Козлова Анна Сергеевна',
    status: 'На рассмотрении',
  },
  {
    id: 3,
    title: 'Разработка сервиса планирования индивидуальной образовательной траектории',
    description: 'Создание веб-сервиса для формирования персональных учебных планов студентов на основе их интересов и успеваемости.',
    student: 'Семёнов Артём Михайлович',
    status: 'На рассмотрении',
  },
  {
    id: 4,
    title: 'Исследование методов обработки естественного языка в чат-ботах',
    description: 'Анализ современных NLP-моделей и разработка прототипа чат-бота для консультирования студентов по вопросам учебного процесса.',
    student: null,
    status: 'Свободна',
  },
];

export const SupervisorTopicsApplicationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'topics'>('applications');
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [selectedTopic, setSelectedTopic] = useState<MyTopic | null>(null); // Стейт для панели

  const handleApprove = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'approved' } : app))
    );
    alert('Демо: Заявка одобрена. Тема закреплена за студентом.');
  };

  const handleReject = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'rejected' } : app))
    );
    alert('Демо: Заявка отклонена. Тема снова свободна.');
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
          </svg>
          <span>Кафедра информационных систем и технологий</span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
            Темы и заявки
          </h1>
          <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '18px', fontWeight: 700, padding: '2px 12px', borderRadius: '8px' }}>
            {activeTab === 'applications' ? pendingCount : myTopics.length}
          </span>
        </div>
        <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
          Проверьте заявки и примите решение по каждой теме.
        </p>
      </div>

      <div style={{ borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '24px' }}>
        <span onClick={() => setActiveTab('applications')} style={{ fontSize: '15px', fontWeight: activeTab === 'applications' ? 700 : 500, color: activeTab === 'applications' ? 'var(--color-brand-blue)' : '#64748B', borderBottom: activeTab === 'applications' ? '2px solid var(--color-brand-blue)' : '2px solid transparent', paddingBottom: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
          Заявки · {pendingCount}
        </span>
        <span onClick={() => setActiveTab('topics')} style={{ fontSize: '15px', fontWeight: activeTab === 'topics' ? 700 : 500, color: activeTab === 'topics' ? 'var(--color-brand-blue)' : '#64748B', borderBottom: activeTab === 'topics' ? '2px solid var(--color-brand-blue)' : '2px solid transparent', paddingBottom: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
          Мои темы · {myTopics.length}
        </span>
      </div>

      {activeTab === 'applications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {applications.map((app) => (
            <div key={app.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
                    {app.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{app.studentName}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{app.group}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>{app.date}</span>
                  {app.status === 'pending' && <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#F1F5F9', fontSize: '13px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#475569' }} /> Ожидает решения</span>}
                  {app.status === 'approved' && <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#ECFDF5', fontSize: '13px', fontWeight: 600, color: '#047857' }}>Одобрено</span>}
                  {app.status === 'rejected' && <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#FBEFEC', fontSize: '13px', fontWeight: 600, color: '#9B3F39' }}>Отклонено</span>}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', lineHeight: 1.4 }}>{app.topic}</div>
              {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <button onClick={() => handleApprove(app.id)} style={{ height: '40px', padding: '0 24px', backgroundColor: '#EDAC33', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Одобрить</button>
                  <button onClick={() => handleReject(app.id)} style={{ height: '40px', padding: '0 24px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)', cursor: 'pointer' }}>Отклонить</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {myTopics.map((topic) => (
            // ДОБАВИЛИ ONCLICK ДЛЯ ОТКРЫТИЯ ПАНЕЛИ
            <div 
              key={topic.id} 
              onClick={() => setSelectedTopic(topic)}
              style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{topic.title}</div>
                <div style={{ fontSize: '14px', color: '#64748B' }}>Студент: {topic.student || '—'}</div>
              </div>
              <div>
                <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, backgroundColor: topic.status === 'Свободна' ? '#EDF5EF' : '#F7F2E8', color: topic.status === 'Свободна' ? '#35654B' : '#82652E' }}>
                  {topic.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '14px', color: '#64748B' }}>
        Ожидают решения: {pendingCount} · Одобрено: {applications.filter((a) => a.status === 'approved').length} · Отклонено: {applications.filter((a) => a.status === 'rejected').length}
      </div>

      {/* ВЫДВИЖНАЯ ПАНЕЛЬ ДЛЯ ПРОСМОТРА ТЕМЫ */}
      {selectedTopic && (
        <div style={{
          position: 'fixed', top: '72px', right: 0, width: '480px', height: 'calc(100vh - 72px)',
          backgroundColor: '#FFFFFF', borderLeft: '1px solid #E2E8F0', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', zIndex: 200, overflowY: 'auto',
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Детали темы
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: '8px 0 4px 0', lineHeight: 1.3 }}>
                {selectedTopic.title}
              </h2>
            </div>
            <button onClick={() => setSelectedTopic(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', backgroundColor: selectedTopic.status === 'Свободна' ? '#EDF5EF' : '#F7F2E8', color: selectedTopic.status === 'Свободна' ? '#35654B' : '#82652E' }}>
                • {selectedTopic.status.toUpperCase()}
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>Описание темы</h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{selectedTopic.description}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>Студент</h4>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                {selectedTopic.student || 'Тема пока не закреплена ни за одним студентом.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};