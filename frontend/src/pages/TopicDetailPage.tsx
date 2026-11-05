import React from 'react';

interface TopicDetailPageProps {
  onBackToCatalog?: () => void;
  onSelectTopic?: () => void;
}

export const TopicDetailPage: React.FC<TopicDetailPageProps> = ({
  onBackToCatalog,
  onSelectTopic,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Meta & Back Line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBackToCatalog}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-brand-blue)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Вернуться в каталог
        </button>

        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
          <span>ID темы: 4412</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Опубликовано: 12.10.2023
          </span>
        </div>
      </div>

      {/* Main Grid Layout: Left Content (2 columns width), Right Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Main Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
              }}
            >
              • ДОСТУПНО
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
              }}
            >
              Веб-разработка
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', lineHeight: 1.25 }}>
            Автоматизация процесса распределения тем ВКР в высшем учебном заведении
          </h1>

          {/* Description Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
              Описание темы
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Целью данной выпускной квалификационной работы является проектирование и реализация информационной системы, предназначенной для автоматизации взаимодействия между студентами выпускных курсов, научными руководителями и администрацией кафедры в процессе выбора и утверждения тем ВКР.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Система должна поддерживать роли студентов (подача заявок, выбор тем), преподавателей (добавление тем, подтверждение студентов) и администраторов (контроль квот, отчетность). Важной составляющей является механизм приоритетного выбора тем на основе академического рейтинга.
            </p>
          </div>

          {/* Required Skills & Tech */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
              Требуемые навыки и технологии
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['React / Vue.js', 'Node.js / Python (FastAPI)', 'PostgreSQL', 'REST API Design', 'Docker'].map((tech, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    color: 'var(--color-brand-blue)',
                    fontWeight: 500,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Execution Stages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
              Этапы выполнения
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Stage 1 (Completed / Checked) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ fontSize: '15px', color: 'var(--color-brand-blue)', fontWeight: 500 }}>
                  Анализ предметной области и существующих аналогов
                </span>
              </div>

              {/* Stage 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  </svg>
                </div>
                <span style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>
                  Проектирование архитектуры БД и интерфейсов пользователя
                </span>
              </div>

              {/* Stage 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  </svg>
                </div>
                <span style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>
                  Разработка прототипа и основного функционала
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Action Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <button
              onClick={onSelectTopic}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: 'var(--color-accent-yellow)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-brand-blue)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              Выбрать тему
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </button>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, textAlign: 'center' }}>
              После выбора темы вы будете назначены кандидатом. Руководитель получит уведомление и свяжется с вами для подтверждения.
            </p>
          </div>

          {/* Supervisor Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
              НАУЧНЫЙ РУКОВОДИТЕЛЬ
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                alt="Петров И.С."
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
                  Петров И.С.
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Доцент, к.т.н.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-brand-blue)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                petrov.is@university.edu
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-brand-blue)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 21V11M10 21V11M14 21V11M18 21V11M12 3L2 7h20L12 3z" />
                </svg>
                Кафедра ИСиТ, ауд. 412
              </div>
            </div>
          </div>

          {/* Department Card (Синий блок #4D6F91) */}
          <div
            style={{
              backgroundColor: '#4D6F91',
              borderRadius: '16px',
              padding: '24px',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 7v14M21 7v14M6 21V11M10 21V11M14 21V11M18 21V11M12 3L2 7h20L12 3z" />
              </svg>
              Кафедра ИСиТ
            </div>
            <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.5 }}>
              Информационные системы и технологии. Специализация: Программная инженерия.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};