import React, { useState } from 'react';

interface Topic {
  id: number;
  title: string;
  description: string;
  status: 'FREE' | 'BUSY';
  tag: string;
  supervisor: {
    name: string;
    degree: string;
    avatar: string;
  };
}

const mockTopics: Topic[] = [
  {
    id: 1,
    title: 'Автоматизация процесса распределения тем ВКР в высшем учебном заведении',
    description: 'Целью работы является создание информационной системы, которая позволит студентам выбирать темы в режиме реального времени, а руководителям — управлять списком доступных тем и подтверждать заявки.',
    status: 'FREE',
    tag: 'Веб-разработка',
    supervisor: {
      name: 'Петров И.С.',
      degree: 'Доцент, к.т.н.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
    },
  },
  {
    id: 2,
    title: 'Применение алгоритмов машинного обучения для прогнозирования успеваемости студентов',
    description: 'Исследование различных моделей регрессии и классификации на основе данных о посещаемости, промежуточных тестах и социальной активности студентов для выявления групп риска.',
    status: 'BUSY',
    tag: 'Data Science',
    supervisor: {
      name: 'Соколова Е.В.',
      degree: 'Профессор, д.т.н.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
    },
  },
  {
    id: 3,
    title: 'Разработка протокола защищенного обмена данными в децентрализованных сетях',
    description: 'Проектирование и реализация протокола шифрования, устойчивого к атакам типа "человек посередине", для использования в P2P системах обмена сообщениями.',
    status: 'FREE',
    tag: 'Безопасность',
    supervisor: {
      name: 'Иванов Д.А.',
      degree: 'Старший преподаватель',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    },
  },
];

interface TopicsCatalogPageProps {
  onSelectTopic?: (topicId: number) => void;
}

export const TopicsCatalogPage: React.FC<TopicsCatalogPageProps> = ({ onSelectTopic }) => {
  const [search, setSearch] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Meta Line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 7v14M21 7v14M6 21V11M10 21V11M14 21V11M18 21V11M12 3L2 7h20L12 3z" />
          </svg>
          <span>Кафедра информационных систем и технологий</span>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Доступно тем: 124</span>
      </div>

      {/* Page Title Header */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>
          Каталог тем ВКР
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
          Выберите подходящую тему для вашей выпускной квалификационной работы.
        </p>
      </div>

      {/* Filter Card Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Search Bar Row */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Поиск по названию или ключевым словам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                paddingLeft: '44px',
                paddingRight: '16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#F8FAFC',
                fontSize: '15px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="2"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            style={{
              padding: '0 32px',
              height: '48px',
              backgroundColor: 'var(--color-accent-yellow)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-brand-blue)',
              cursor: 'pointer',
            }}
          >
            Найти
          </button>
        </div>

        {/* Dropdowns Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              style={{
                padding: '0 16px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '14px',
                color: 'var(--color-brand-blue)',
                cursor: 'pointer',
              }}
            >
              <option>Все кафедры</option>
            </select>
            <select
              style={{
                padding: '0 16px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '14px',
                color: 'var(--color-brand-blue)',
                cursor: 'pointer',
              }}
            >
              <option>Научный руководитель</option>
            </select>
            <select
              style={{
                padding: '0 16px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '14px',
                color: 'var(--color-brand-blue)',
                cursor: 'pointer',
              }}
            >
              <option>Статус темы</option>
            </select>
          </div>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-brand-blue)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Сбросить все фильтры
          </button>
        </div>
      </div>

      {/* List of Topic Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {mockTopics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => onSelectTopic?.(topic.id)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '24px',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
          >
            {/* Left Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    backgroundColor: topic.status === 'FREE' ? '#FEF3C7' : '#F1F5F9',
                    color: topic.status === 'FREE' ? '#92400E' : '#475569',
                  }}
                >
                  • {topic.status === 'FREE' ? 'СВОБОДНО' : 'ЗАНЯТО'}
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
                  {topic.tag}
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-brand-blue)', lineHeight: 1.3 }}>
                {topic.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {topic.description}
              </p>
            </div>

            {/* Right Supervisor Info & Action */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
                    {topic.supervisor.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {topic.supervisor.degree}
                  </div>
                </div>
                <img
                  src={topic.supervisor.avatar}
                  alt={topic.supervisor.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>

              {topic.status === 'FREE' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Apply topic:', topic.id);
                  }}
                  style={{
                    width: '100%',
                    height: '44px',
                    backgroundColor: 'var(--color-accent-yellow)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--color-brand-blue)',
                    cursor: 'pointer',
                  }}
                >
                  Подать заявку
                </button>
              ) : (
                <button
                  disabled
                  style={{
                    width: '100%',
                    height: '44px',
                    backgroundColor: '#F1F5F9',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#94A3B8',
                    cursor: 'not-allowed',
                  }}
                >
                  Недоступно
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
        <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>
          Назад
        </button>
        <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-accent-yellow)', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
          1
        </button>
        <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>
          2
        </button>
        <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>
          3
        </button>
        <span style={{ color: 'var(--color-text-muted)' }}>...</span>
        <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>
          12
        </button>
        <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>
          Вперед
        </button>
      </div>
    </div>
  );
};