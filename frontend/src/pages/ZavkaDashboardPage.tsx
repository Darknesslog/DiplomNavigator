import React from 'react';

// Интерфейсы для будущей типизации при запросах с бэкенда
interface SupervisorLoad {
  id: number;
  name: string;
  degree: string;
  loadText: string;
  percent: number;
}

interface StageStat {
  label: string;
  countText: string;
  percent: number;
  badgeBg: string;
  badgeColor: string;
  barColor: string;
}

// Моковые данные (в будущем заменяются на данные из API кафедры)
const supervisorsLoadList: SupervisorLoad[] = [
  { id: 1, name: 'Соколова Елена Викторовна', degree: 'Кандидат технических наук, доцент', loadText: 'Занято 12 / 12', percent: 100 },
  { id: 2, name: 'Морозов Андрей Сергеевич', degree: 'Доктор технических наук, профессор', loadText: 'Занято 10 / 12', percent: 83 },
  { id: 3, name: 'Кузнецова Ирина Павловна', degree: 'Кандидат технических наук, доцент', loadText: 'Занято 8 / 10', percent: 80 },
  { id: 4, name: 'Волков Дмитрий Алексеевич', degree: 'Старший преподаватель', loadText: 'Занято 6 / 10', percent: 60 },
];

const workStagesList: StageStat[] = [
  { label: 'В работе', countText: '84 студента', percent: 65, badgeBg: '#EDF5EF', badgeColor: '#35654B', barColor: '#35654B' },
  { label: 'На проверке', countText: '12 студентов', percent: 9, badgeBg: '#F7F2E8', badgeColor: '#82652E', barColor: '#82652E' },
  { label: 'Предзащита', countText: '32 студента', percent: 25, badgeBg: '#EDF5EF', badgeColor: '#35654B', barColor: '#35654B' },
];

interface ZavkaDashboardPageProps {
  onViewAttention?: () => void;
  onViewAllSupervisors?: () => void;
  onDownloadReport?: () => void;
  onUploadOrder?: () => void;
}

export const ZavkaDashboardPage: React.FC<ZavkaDashboardPageProps> = ({
  onViewAttention,
  onViewAllSupervisors,
  onDownloadReport,
  onUploadOrder,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      {/* Subheader / Info Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
          </svg>
          <span>Кафедра информационных систем и технологий</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => alert('Переход в справочный центр')}
            style={{
              height: '38px',
              padding: '0 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-brand-blue)',
              cursor: 'pointer',
            }}
          >
            Справочный центр
          </button>
          <button
            onClick={onDownloadReport}
            style={{
              height: '38px',
              padding: '0 16px',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Скачать отчёт
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0, marginBottom: '8px' }}>
          Панель управления
        </h1>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <span>Всего студентов</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>128</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <span>Руководителей</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>14</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <span>В работе</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>84</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <span>Предзащита</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>32</div>
        </div>
      </div>

      {/* Main Content Layout (Left: Supervisors Load, Right: Widgets) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Supervisors Load */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
              Нагрузка руководителей
            </h2>
            <span
              onClick={onViewAllSupervisors}
              style={{ fontSize: '14px', fontWeight: 600, color: '#4D6F91', cursor: 'pointer' }}
            >
              Все руководители
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {supervisorsLoadList.map((sup, idx) => (
              <div
                key={sup.id}
                style={{
                  paddingBottom: '16px',
                  borderBottom: idx < supervisorsLoadList.length - 1 ? '1px solid #F1F5F9' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{sup.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{sup.degree}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', color: '#64748B', marginRight: '12px' }}>{sup.loadText}</span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{sup.percent}%</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ width: `${sup.percent}%`, height: '100%', backgroundColor: '#4D6F91', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Widget 1: Requires Attention */}
          <div style={{ backgroundColor: '#FBEFEC', borderRadius: '16px', border: '1px solid #F5C6CB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9B3F39', fontSize: '16px', fontWeight: 700 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              Требуют внимания
            </div>
            <p style={{ fontSize: '14px', color: '#4A5568', margin: 0, lineHeight: 1.5 }}>
              3 работы задерживаются на этапе утверждения темы более 7 дней.
            </p>
            <button
              onClick={onViewAttention}
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #9B3F39',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#9B3F39',
                cursor: 'pointer',
              }}
            >
              Просмотреть
            </button>
          </div>

          {/* Widget 2: Work Stages */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
              Этапы работ
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {workStagesList.map((stage, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', padding: '2px 8px', borderRadius: '6px', backgroundColor: stage.badgeBg, color: stage.badgeColor, fontWeight: 600 }}>
                      • {stage.label}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{stage.percent}%</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>{stage.countText}</div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${stage.percent}%`, height: '100%', backgroundColor: stage.barColor, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: New Order */}
          <div style={{ backgroundColor: '#3B597C', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', color: '#FFFFFF' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              Новое распоряжение?
            </h3>
            <p style={{ fontSize: '13px', color: '#E2E8F0', margin: 0, lineHeight: 1.5 }}>
              Загрузите приказ о назначении руководителей для обновления данных системы.
            </p>
            <button
              onClick={onUploadOrder}
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-brand-blue)',
                cursor: 'pointer',
              }}
            >
              Загрузить файл
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};