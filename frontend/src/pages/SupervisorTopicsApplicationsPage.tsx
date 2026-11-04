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

export const SupervisorTopicsApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(initialApplications);

  const handleApprove = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'approved' } : app))
    );
  };

  const handleReject = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'rejected' } : app))
    );
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Subheader / Info Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
          </svg>
          <span>Кафедра информационных систем и технологий</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <span>2025–2026 учебный год</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
            Темы и заявки
          </h1>
          <span
            style={{
              backgroundColor: '#F1F5F9',
              color: '#475569',
              fontSize: '18px',
              fontWeight: 700,
              padding: '2px 12px',
              borderRadius: '8px',
            }}
          >
            {pendingCount}
          </span>
        </div>
        <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
          Проверьте заявки и примите решение по каждой теме.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
        <span
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--color-brand-blue)',
            borderBottom: '2px solid var(--color-brand-blue)',
            paddingBottom: '12px',
          }}
        >
          Заявки · {pendingCount}
        </span>
      </div>

      {/* List of Applications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        {applications.map((app) => (
          <div
            key={app.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Top row: Avatar + Name + Date + Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-brand-blue)',
                  }}
                >
                  {app.initials}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
                    {app.studentName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    {app.group}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>{app.date}</span>
                {app.status === 'pending' && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: '#F1F5F9',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#475569' }} />
                    Ожидает решения
                  </span>
                )}
                {app.status === 'approved' && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: '#ECFDF5',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#047857',
                    }}
                  >
                    Одобрено
                  </span>
                )}
                {app.status === 'rejected' && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: '#FBEFEC',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#9B3F39',
                    }}
                  >
                    Отклонено
                  </span>
                )}
              </div>
            </div>

            {/* Topic Title */}
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', lineHeight: 1.4 }}>
              {app.topic}
            </div>

            {/* Action Buttons */}
            {app.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button
                  onClick={() => handleApprove(app.id)}
                  style={{
                    height: '40px',
                    padding: '0 24px',
                    backgroundColor: '#EDAC33',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-brand-blue)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ✓ Одобрить
                </button>
                <button
                  onClick={() => handleReject(app.id)}
                  style={{
                    height: '40px',
                    padding: '0 24px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-brand-blue)',
                    cursor: 'pointer',
                  }}
                >
                  Отклонить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Summary Bar */}
      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '14px', color: '#64748B' }}>
        Ожидают решения: {pendingCount} · Одобрено: {applications.filter((a) => a.status === 'approved').length + 8} · Отклонено: {applications.filter((a) => a.status === 'rejected').length + 1}
      </div>
    </div>
  );
};