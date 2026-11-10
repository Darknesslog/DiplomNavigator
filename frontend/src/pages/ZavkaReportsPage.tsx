import React, { useState } from 'react';

const demoStudents = [
  { id: 1, name: 'Александров Игорь Сергеевич', group: 'БИ-20-01', topic: 'Автоматизация складского учета', supervisor: 'Соколова Е.В.', stage: 'Предзащита' },
  { id: 2, name: 'Белова Марина Дмитриевна', group: 'БИ-20-01', topic: 'Анализ информационной системы', supervisor: 'Соколова Е.В.', stage: 'Предзащита' },
  { id: 3, name: 'Васильев Алексей Павлович', group: 'БИ-20-02', topic: 'Разработка микросервисной системы', supervisor: 'Морозов А.С.', stage: 'Предзащита' },
  { id: 4, name: 'Григорьев Петр Ильич', group: 'БИ-20-02', topic: 'Внедрение BI-системы', supervisor: 'Морозов А.С.', stage: 'В работе' },
  { id: 5, name: 'Дмитриева Ольга Сергеевна', group: 'БИ-20-03', topic: 'Разработка чат-бота', supervisor: 'Кузнецова И.П.', stage: 'Завершена' },
];

const demoReports = [
  { id: 1, name: 'Сводный отчет по успеваемости ВКР', date: '25.05.2024', status: 'Готов' },
  { id: 2, name: 'Отчет о нагрузке научных руководителей', date: '22.05.2024', status: 'Готов' },
  { id: 3, name: 'Список работ, прошедших предзащиту', date: '20.05.2024', status: 'Готов' },
  { id: 4, name: 'Отчет по распределению тем', date: '18.05.2024', status: 'Готов' },
];

export const ZavkaReportsPage: React.FC = () => {
  const [academicYear, setAcademicYear] = useState('2023 / 2024');
  const [direction, setDirection] = useState('Информационные системы и технологии');
  const [course, setCourse] = useState('Все курсы');
  const [searchQuery, setSearchQuery] = useState(''); // Добавлен поиск
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelContent, setPanelContent] = useState<{
    title: string;
    students: typeof demoStudents;
  } | null>(null);

  const showDetailsPanel = (title: string, stageFilter: string) => {
    const filtered = demoStudents.filter((s) => s.stage === stageFilter);
    setPanelContent({ title: `${title} (${filtered.length})`, students: filtered });
    setIsPanelOpen(true);
  };

  const handleApplyFilters = () => {
    alert(`Применены фильтры: ${academicYear}, ${direction}, ${course}. Поиск: "${searchQuery}"`);
  };

  // Фильтрация списка отчетов по поиску
  const filteredReports = demoReports.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            onClick={() => alert('Скачивание сводного отчета...')}
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
            Скачать сводный отчёт
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
          Отчёты
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px' }}>
          Поиск и фильтры применяются к текущей выборке отчётов и показателей.
        </p>
      </div>

      {/* Filters Panel (Добавлено поле поиска) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
            Поиск по названию отчёта
          </label>
          <input
            type="text"
            placeholder="Введите название..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', height: '40px', padding: '0 12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: 'var(--color-brand-blue)', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
            Учебный год
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            style={{ width: '100%', height: '40px', padding: '0 12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: 'var(--color-brand-blue)', outline: 'none', cursor: 'pointer' }}
          >
            <option>2023 / 2024</option>
            <option>2024 / 2025</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
            Направление
          </label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            style={{ width: '100%', height: '40px', padding: '0 12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: 'var(--color-brand-blue)', outline: 'none', cursor: 'pointer' }}
          >
            <option>Информационные системы и технологии</option>
            <option>Программная инженерия</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
            Курс
          </label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            style={{ width: '100%', height: '40px', padding: '0 12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: 'var(--color-brand-blue)', outline: 'none', cursor: 'pointer' }}
          >
            <option>Все курсы</option>
            <option>4 курс (бакалавриат)</option>
          </select>
        </div>

        <button
          onClick={handleApplyFilters}
          style={{ height: '40px', padding: '0 24px', backgroundColor: '#4D6F91', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', cursor: 'pointer' }}
        >
          Применить
        </button>
      </div>

      {/* KPI Cards Grid (ДОБАВЛЕНЫ ALERT'Ы) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div onClick={() => alert('Демо: Переход к списку всех студентов')} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <span>Всего студентов</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>128</div>
        </div>

        <div onClick={() => alert('Демо: Переход к списку утвержденных тем')} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <span>Темы утверждены</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /></svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '4px' }}>112</div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '87%', height: '100%', backgroundColor: '#4D6F91', borderRadius: '3px' }} />
          </div>
        </div>

        <div
          onClick={() => showDetailsPanel('Прошли предзащиту', 'Предзащита')}
          style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <span>Прошли предзащиту</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '4px' }}>{demoStudents.filter(s => s.stage === 'Предзащита').length}</div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '25%', height: '100%', backgroundColor: '#35654B', borderRadius: '3px' }} />
          </div>
        </div>

        <div onClick={() => alert('Демо: Просмотр рейтинга успеваемости')} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
            <span>Средний балл</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDAC33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#EDAC33' }}>4.82</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
              Распределение по руководителям
            </h3>
            <span style={{ fontSize: '11px', backgroundColor: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Демо-данные
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0', position: 'relative' }}>
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'conic-gradient(#E2E8F0 0deg 137deg, #4D6F91 137deg 188deg, #EDAC33 188deg 239deg, #35654B 239deg 282deg, #9B3F39 282deg 325deg, #64748B 325deg 360deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Всего</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>128 студ.</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#E2E8F0' }} />
              <span style={{ color: '#64748B' }}>Прочие (38.1%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#4D6F91' }} />
              <span style={{ color: 'var(--color-brand-blue)', fontWeight: 600 }}>Соколова Е.В. (14.3%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#EDAC33' }} />
              <span style={{ color: 'var(--color-brand-blue)', fontWeight: 600 }}>Морозов А.С. (14.3%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#35654B' }} />
              <span style={{ color: 'var(--color-brand-blue)', fontWeight: 600 }}>Кузнецова И.П. (11.9%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#9B3F39' }} />
              <span style={{ color: 'var(--color-brand-blue)', fontWeight: 600 }}>Волков Д.А. (11.9%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#64748B' }} />
              <span style={{ color: 'var(--color-brand-blue)', fontWeight: 600 }}>Смирнов И.К. (9.52%)</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
              Динамика сдачи этапов ВКР
            </h3>
            <span style={{ fontSize: '11px', backgroundColor: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Демо-данные
            </span>
          </div>

          <div style={{ height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', paddingBottom: '20px' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', height: '100%', display: 'flex', alignItems: 'flex-start' }}><span style={{ fontSize: '11px', color: '#94A3B8' }}>120</span></div>
              <div style={{ borderBottom: '1px solid #F1F5F9', height: '100%', display: 'flex', alignItems: 'flex-start' }}><span style={{ fontSize: '11px', color: '#94A3B8' }}>100</span></div>
              <div style={{ borderBottom: '1px solid #F1F5F9', height: '100%', display: 'flex', alignItems: 'flex-start' }}><span style={{ fontSize: '11px', color: '#94A3B8' }}>80</span></div>
              <div style={{ borderBottom: '1px solid #F1F5F9', height: '100%', display: 'flex', alignItems: 'flex-start' }}><span style={{ fontSize: '11px', color: '#94A3B8' }}>60</span></div>
              <div style={{ borderBottom: '1px solid #F1F5F9', height: '100%', display: 'flex', alignItems: 'flex-start' }}><span style={{ fontSize: '11px', color: '#94A3B8' }}>40</span></div>
              <div style={{ borderBottom: '1px solid #F1F5F9', height: '100%', display: 'flex', alignItems: 'flex-start' }}><span style={{ fontSize: '11px', color: '#94A3B8' }}>20</span></div>
              <div style={{ borderBottom: '1px solid #E2E8F0', height: '100%', display: 'flex', alignItems: 'flex-start' }}><span style={{ fontSize: '11px', color: '#94A3B8' }}>0</span></div>
            </div>

            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '180px', overflow: 'visible' }} viewBox="0 0 500 180" preserveAspectRatio="none">
              <polyline fill="none" stroke="#4D6F91" strokeWidth="3" points="20,165 100,140 180,110 260,75 340,55 420,20" />
              <polyline fill="none" stroke="#35654B" strokeWidth="3" points="20,175 100,160 180,145 260,130 340,115 420,105" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '15px', paddingRight: '15px', marginTop: 'auto', zIndex: 1, fontSize: '12px', color: '#64748B' }}>
              <span>Сен</span>
              <span>Окт</span>
              <span>Ноя</span>
              <span>Дек</span>
              <span>Янв</span>
              <span>Фев</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '3px', backgroundColor: '#4D6F91', borderRadius: '2px' }} />
              <span style={{ color: 'var(--color-brand-blue)', fontWeight: 600 }}>Темы утверждены</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '3px', backgroundColor: '#35654B', borderRadius: '2px' }} />
              <span style={{ color: 'var(--color-brand-blue)', fontWeight: 600 }}>Предзащита</span>
            </div>
          </div>
        </div>
      </div>

      {/* Список отчетов (Добавлен alert на "Готов") */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '16px' }}>
          Последние сформированные отчёты
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div
                key={report.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                {/* Фиксированная ширина для названия */}
                <span style={{ flex: 1, fontWeight: 600, color: 'var(--color-brand-blue)' }}>
                  {report.name}
                </span>
                {/* Фиксированная ширина для даты, выравнивание по центру */}
                <span style={{ width: '150px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  {report.date}
                </span>
                {/* Фиксированная ширина для статуса, выравнивание по правому краю (Добавлен onClick) */}
                <button
                  onClick={() => alert(`Демо: Скачивание файла "${report.name}"`)}
                  style={{ width: '100px', textAlign: 'right', color: '#35654B', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {report.status}
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
              По вашему запросу отчёты не найдены.
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {isPanelOpen && panelContent && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            right: 0,
            width: '440px',
            height: 'calc(100vh - 72px)',
            backgroundColor: '#FFFFFF',
            borderLeft: '1px solid #E2E8F0',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 200,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
              {panelContent.title}
            </h2>
            <button
              onClick={() => setIsPanelOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {panelContent.students.map((student) => (
              <div
                key={student.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '14px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>
                  {student.name}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {student.group} · {student.supervisor}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{student.topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};