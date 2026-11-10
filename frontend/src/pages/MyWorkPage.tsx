import React from 'react';

const supervisorData = {
  name: 'Соколова Елена Викторовна',
  degree: 'Профессор, д.т.н.',
  department: '09.03.02 Информатика и вычислительная техника',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
};

export const MyWorkPage: React.FC = () => {
  const demoProgress = 65;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Шапка страницы */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 7v14M21 7v14M6 21V11M10 21V11M14 21V11M18 21V11M12 3L2 7h20L12 3z" />
          </svg>
          <span>Кафедра информационных систем и технологий</span>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>2025–2026 учебный год</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>
            Моя выпускная работа
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
            Тема, этапы, файлы и связь с руководителем.
          </p>
        </div>

      </div>

      {/* Основная карточка */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Этапы работы */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Этапы работы</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-blue)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>В работе</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Завершён</div>
              </div>
            </div>

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-brand-blue)' }}>2</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>На проверке</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Текущий этап</div>
              </div>
            </div>

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>3</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Предзащита</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Предстоит</div>
              </div>
            </div>

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>4</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Защита</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Предстоит</div>
              </div>
            </div>
          </div>
        </div>

        {/* Профиль и статус */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-brand-blue)', fontSize: '18px' }}>АИ</div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Иванов Алексей Дмитриевич</h2>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Группа ИС-41 · Бакалавриат</span>
            </div>
          </div>
          <span style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', fontSize: '14px', fontWeight: 600 }}>• На проверке</span>
        </div>

        {/* Тема и описание */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Тема выпускной квалификационной работы</span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-brand-blue)', lineHeight: 1.3 }}>Применение алгоритмов машинного обучения для прогнозирования успеваемости студентов</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Описание работы</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Исследование различных моделей регрессии и классификации на основе данных о посещаемости, промежуточных тестах и социальной активности студентов для выявления групп риска.</p>
          </div>
        </div>
      </div>

      {/* Нижние карточки */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Научный руководитель</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={supervisorData.avatar} alt={supervisorData.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{supervisorData.name}</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{supervisorData.degree}</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{supervisorData.department}</div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Прогресс</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{demoProgress}%</div>
            <div style={{ flex: 1, height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${demoProgress}%`, height: '100%', backgroundColor: '#EDAC33', borderRadius: '4px' }} />
            </div>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Демонстрационное значение. Оценка появится после проверки работы.</div>
        </div>
      </div>
    </div>
  );
};