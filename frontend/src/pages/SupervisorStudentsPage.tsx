import React, { useState } from 'react';

interface Student {
  id: number;
  name: string;
  topic: string;
  group: string;
  status: string;
  percent: string;
  avatar: string;
  isDelayed?: boolean;
}

const studentsList: Student[] = [
  {
    id: 1,
    name: 'Анна Волкова',
    topic: 'Разработка ИИ-модели для семантического анализа юридических текстов в корпоративном секторе',
    group: 'БПИ-201',
    status: 'Написание текста (Главы 1-2)',
    percent: '45%',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 2,
    name: 'Игорь Соловьев',
    topic: 'Оптимизация баз данных в ERP-системах',
    group: 'БПИ-202',
    status: 'Черновик',
    percent: '75%',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 3,
    name: 'Алексей Петров',
    topic: 'Просрочено: План-график работ',
    group: 'БПИ-201',
    status: 'Задержка',
    percent: '15%',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
    isDelayed: true,
  },
  {
    id: 4,
    name: 'Марина Козлова',
    topic: 'Веб-сервис для автоматизации учета',
    group: 'БПИ-202',
    status: 'Предзащита',
    percent: '95%',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: 5,
    name: 'Дмитрий Романов',
    topic: 'Алгоритмы сжатия без потерь для 3D моделей',
    group: 'БПИ-203',
    status: 'Сборка',
    percent: '30%',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
  },
];

export const SupervisorStudentsPage: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(studentsList[0]);
  const [search, setSearch] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>
          Список студентов
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
          У вас 10 закрепленных студентов в текущем семестре
        </p>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
        <input
          type="text"
          placeholder="Поиск по имени или теме..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: '40px',
            paddingRight: '16px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="2"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Таблица со списком студентов */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#F8FAFC', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
            <span>СТУДЕНТ И ТЕМА ВКР</span>
            <span>ГРУППА</span>
          </div>

          {studentsList.map((st) => {
            const isSelected = selectedStudent?.id === st.id;
            return (
              <div
                key={st.id}
                onClick={() => setSelectedStudent(st)}
                style={{
                  padding: '16px 24px',
                  backgroundColor: isSelected ? '#F0F4F8' : st.isDelayed ? '#FBEFEC' : '#FFFFFF',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={st.avatar} alt={st.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{st.name}</div>
                    <div style={{ fontSize: '13px', color: st.isDelayed ? '#9B3F39' : 'var(--color-text-muted)' }}>{st.topic}</div>
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: '#F1F5F9', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  {st.group}
                </span>
              </div>
            );
          })}
        </div>

        {/* Выдвижная боковая панель (карточка студента в стиле виджета чата) */}
        {selectedStudent && (
          <div
            style={{
              width: '380px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'sticky',
              top: '24px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Карточка студента</span>
              <button 
                onClick={() => setSelectedStudent(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '16px', padding: '4px' }}
                title="Закрыть панель"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src={selectedStudent.avatar} alt={selectedStudent.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{selectedStudent.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Студент 4 курса, {selectedStudent.group}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>ТЕМА ВКР</span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>{selectedStudent.topic}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', color: '#4D6F91', cursor: 'pointer', fontWeight: 600 }}>Редактировать тему</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Текущий прогресс</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{selectedStudent.percent}</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: selectedStudent.percent, height: '100%', backgroundColor: '#4D6F91', borderRadius: '3px' }} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                👤 Этап: {selectedStudent.status}<br />
                <span style={{ fontSize: '12px' }}>Срок: до 24 мая 2024</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Последняя активность</span>
                <span style={{ fontSize: '13px', color: '#4D6F91', cursor: 'pointer', fontWeight: 600 }}>Все файлы</span>
              </div>
              <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px' }}>
                Volkova_Draft_v2.docx
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <button style={{ width: '100%', height: '44px', backgroundColor: '#4D6F91', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', cursor: 'pointer' }}>
                Перейти в чат со студентом
              </button>
              <button style={{ width: '100%', height: '44px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)', cursor: 'pointer' }}>
                Все материалы
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};