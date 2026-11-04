import React from 'react';

export const MyWorkPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Meta Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 7v14M21 7v14M6 21V11M10 21V11M14 21V11M18 21V11M12 3L2 7h20L12 3z" />
          </svg>
          <span>Кафедра информационных систем и технологий</span>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>2025–2026 учебный год</span>
      </div>

      {/* Header & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>
            Моя выпускная работа
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
            Тема, этапы, файлы и связь с руководителем.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              padding: '0 20px',
              height: '44px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #4D6F91',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#4D6F91',
              cursor: 'pointer',
            }}
          >
            Предложить тему
          </button>
          <button
            style={{
              padding: '0 20px',
              height: '44px',
              backgroundColor: 'var(--color-accent-yellow)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-brand-blue)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Загрузить новую версию
          </button>
        </div>
      </div>

      {/* Main Status & Details Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Stages Stepper Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Этапы работы
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
            {/* Step 1: Completed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-blue)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>В работе</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Завершён</div>
              </div>
            </div>

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>

            {/* Step 2: Active */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
                2
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>На проверке</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Текущий этап</div>
              </div>
            </div>

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                3
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Предзащита</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Предстоит</div>
              </div>
            </div>

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>

            {/* Step 4 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                4
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Защита</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Предстоит</div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Profile & Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-brand-blue)', fontSize: '18px' }}>
              АИ
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
                Иванов Алексей Дмитриевич
              </h2>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                Группа ИС-41 · Бакалавриат
              </span>
            </div>
          </div>

          <span style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', fontSize: '14px', fontWeight: 600 }}>
            • На проверке
          </span>
        </div>

        {/* Topic Title & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Тема выпускной квалификационной работы</span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-brand-blue)', lineHeight: 1.3 }}>
            Разработка системы учёта заявок технической поддержки университета
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Описание работы</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Обращения студентов и сотрудников поступают по разным каналам, что затрудняет контроль сроков и приводит к потере заявок. Единая система позволит регистрировать обращения, назначать ответственных и отслеживать ход решения. В работе планируется разработать веб-приложение и оценить сокращение времени обработки заявок.
            </p>
          </div>
        </div>

        {/* Files Section: Student */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Файлы студента</h4>
          <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-brand-blue)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>ВКР_Иванов_ИС-41.pdf</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>2,4 МБ · Загружено 18 мая 2026</div>
              </div>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#4D6F91', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Скачать
            </button>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Документ в формате PDF, до 20 МБ.</span>
        </div>

        {/* Files Section: Supervisor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Файлы руководителя</h4>
          <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#FEFCE8', border: '1px solid #FEF08A', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Файлы не загружены
          </div>
        </div>
      </div>

      {/* Bottom Row: Supervisor & Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Supervisor Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Научный руководитель
          </h3>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Соколова Елена Викторовна
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Кандидат технических наук, доцент
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            09.03.02 Информатика и вычислительная техника
          </div>
        </div>

        {/* Progress Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Прогресс
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Не задано
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Оценка появится после проверки работы
          </div>
        </div>
      </div>
    </div>
  );
};