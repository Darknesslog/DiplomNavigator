import React from 'react';

export const SupervisorDashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Meta Line & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>
            Личный кабинет руководителя
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M3 7v14M21 7v14M6 21V11M10 21V11M14 21V11M18 21V11M12 3L2 7h20L12 3z" />
            </svg>
            <span>Семестр 2, 2023/24 учебный год</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              padding: '0 20px',
              height: '44px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-brand-blue)',
              cursor: 'pointer',
            }}
          >
            Все заявки
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
              <path d="M12 5v14M5 12h14" />
            </svg>
            Создать тему
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {/* Card 1: Мои студенты */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '120px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>Мои студенты</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>10</span>
            <span style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>/ 12 макс.</span>
          </div>
        </div>

        {/* Card 2: Свободных тем */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '120px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>Свободных тем</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>2</span>
        </div>

        {/* Card 3: Новых заявок (#4D6F91) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '120px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>Новых заявок</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700, color: '#4D6F91' }}>4</span>
        </div>

        {/* Card 4: Требуют внимания (фон #FBEFEC, текст #9B3F39) */}
        <div
          style={{
            backgroundColor: '#FBEFEC',
            borderRadius: '16px',
            border: '1px solid #F5C6C1',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '120px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#9B3F39' }}>Требуют внимания</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B3F39" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700, color: '#9B3F39' }}>3</span>
        </div>
      </div>

      {/* Main Grid: Left List (Students Progress), Right Sidebar Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Table / Card Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Прогресс студентов</h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontWeight: 600, color: '#4D6F91' }}>
              <span style={{ cursor: 'pointer' }}>Фильтры</span>
              <span style={{ cursor: 'pointer' }}>Экспорт</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            {[
              {
                name: 'Анна Волкова',
                topic: 'Разработка ИИ-модели для анализа текстов',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
                status: 'Написание текста',
                statusBg: '#EAF0F6',
                statusColor: '#4D6F91',
                barColor: '#4D6F91',
                percent: '45%',
                progress: 45,
                hasWarning: false,
              },
              {
                name: 'Игорь Соловьев',
                topic: 'Оптимизация баз данных в ERP-системах',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
                status: 'Черновик',
                statusBg: '#F7F2E8',
                statusColor: '#82652E',
                barColor: '#82652E',
                percent: '75%',
                progress: 75,
                hasWarning: false,
              },
              {
                name: 'Алексей Петров',
                topic: 'Просрочен этап: План работы',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
                status: 'Задержка',
                statusBg: '#F1D5CF',
                statusColor: '#9B3F39',
                barColor: '#9B3F39',
                percent: '15%',
                progress: 15,
                hasWarning: true, // Выделенная строка #FBEFEC
              },
              {
                name: 'Марина Козлова',
                topic: 'Веб-сервис для автоматизации учета',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
                status: 'Предзащита',
                statusBg: '#EDF5EF',
                statusColor: '#35654B',
                barColor: '#35654B',
                percent: '95%',
                progress: 95,
                hasWarning: false,
              },
            ].map((student, idx, array) => (
              <div
                key={idx}
                style={{
                  padding: '20px 24px',
                  backgroundColor: student.hasWarning ? '#FBEFEC' : '#FFFFFF',
                  borderBottom: idx < array.length - 1 ? '1px solid var(--color-border)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                {/* Student Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <img
                    src={student.avatar}
                    alt={student.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
                      {student.name}
                    </div>
                    <div style={{ fontSize: '13px', color: student.hasWarning ? '#9B3F39' : 'var(--color-text-muted)' }}>
                      {student.topic}
                    </div>
                  </div>
                </div>

                {/* Status Pill & Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '240px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', width: '140px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: student.statusBg,
                        color: student.statusColor,
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: student.statusColor }} />
                      {student.status}
                    </span>
                    {/* Bar */}
                    <div style={{ width: '100%', height: '5px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: student.percent, height: '100%', backgroundColor: student.barColor, borderRadius: '3px' }} />
                    </div>
                  </div>

                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)', width: '40px', textAlign: 'right' }}>
                    {student.percent}
                  </span>

                  <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget 1: Ближайшие сроки */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Ближайшие сроки</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>24</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>мая</span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>Сдача черновиков</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Осталось 3 дня</div>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>30</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>мая</span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>Загрузка антиплагиата</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Осталось 9 дней</div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Новые заявки */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Новые заявки</h3>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#4D6F91' }}>4 заявки</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80" alt="Дарья" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>Дарья Орлова</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Тема №12</div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=80" alt="Константин" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>Константин К.</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Своя тема</div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </div>

            <button
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: '#F1F5F9',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-brand-blue)',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Рассмотреть все
            </button>
          </div>

          {/* Widget 3: Справочник (#4D6F91) */}
          <div
            style={{
              backgroundColor: '#4D6F91',
              borderRadius: '16px',
              padding: '24px',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Справочник
            </div>
            <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.5 }}>
              Инструкция по заполнению отзывов и справок для ГЭК в новой системе.
            </p>
            <button
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Читать инструкцию
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};