import React, { useState } from 'react';

interface StudentItem {
  id: number;
  name: string;
  group: string;
  topic: string;
  stage: string;
  stageType: 'success' | 'warning' | 'info' | 'default';
  progress: number;
  description: string;
  files: string[];
}

interface SupervisorItem {
  id: number;
  name: string;
  degree: string;
  loadCurrent: number;
  loadMax: number;
  statusText: string;
  statusType: 'green' | 'yellow';
  students: StudentItem[];
}

// Моковые данные для руководителей и их студентов
const initialSupervisors: SupervisorItem[] = [
  {
    id: 1,
    name: 'Соколова Елена Викторовна',
    degree: 'Кандидат технических наук, доцент',
    loadCurrent: 12,
    loadMax: 12,
    statusText: 'Заполнен',
    statusType: 'green',
    students: [
      {
        id: 101,
        name: 'Александров Игорь Сергеевич',
        group: 'БИ-20-01',
        topic: 'Автоматизация складского учета',
        stage: 'Предзащита',
        stageType: 'success',
        progress: 90,
        description: 'Разработка модуля управления остатками, интеграция с терминалами сбора данных и создание системы аналитической отчетности для менеджеров склада.',
        files: ['Пояснительная_записка.docx', 'Презентация.pptx', 'Чертеж_архитектуры.pdf', 'Исходный_код.zip'],
      },
      {
        id: 102,
        name: 'Белова Марина Дмитриевна',
        group: 'БИ-20-01',
        topic: 'Анализ информационной',
        stage: 'В работе',
        stageType: 'success',
        progress: 45,
        description: 'Исследование методов обработки больших объемов данных с использованием современных алгоритмов машинного обучения.',
        files: ['Текстовый_документ.docx', 'Схема_данных.pdf'],
      },
    ],
  },
  {
    id: 2,
    name: 'Морозов Андрей Сергеевич',
    degree: 'Доктор технических наук, профессор',
    loadCurrent: 6,
    loadMax: 10,
    statusText: 'Доступен',
    statusType: 'yellow',
    students: [
      {
        id: 201,
        name: 'Васильев Алексей Павлович',
        group: 'БИ-20-02',
        topic: 'Разработка распределенной микросервисной системы',
        stage: 'В работе',
        stageType: 'success',
        progress: 60,
        description: 'Проектирование и реализация отказоустойчивой архитектуры на базе Docker и Kubernetes.',
        files: ['Диплом_глава1.docx', 'Архитектурная_схема.png'],
      },
    ],
  },
  {
    id: 3,
    name: 'Кузнецова Ирина Павловна',
    degree: 'Кандидат технических наук, доцент',
    loadCurrent: 8,
    loadMax: 10,
    statusText: 'Доступен',
    statusType: 'yellow',
    students: [
      {
        id: 301,
        name: 'Смирнов Павел Олегович',
        group: 'БИ-20-03',
        topic: 'Разработка рекомендательной системы для интернет-магазина',
        stage: 'В работе',
        stageType: 'success',
        progress: 55,
        description: 'Анализ алгоритмов коллаборативной фильтрации и разработка прототипа системы рекомендаций на основе истории покупок пользователей.',
        files: ['Глава_1_Введение.docx', 'Схема_архитектуры.png', 'Прототип_интерфейса.fig'],
      },
    ],
  },
];

export const ZavkaSupervisorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSupervisorId, setExpandedSupervisorId] = useState<number | null>(1); // Первый по умолчанию открыт
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(initialSupervisors[0].students[0]);

  const toggleSupervisor = (id: number) => {
    setExpandedSupervisorId(expandedSupervisorId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', position: 'relative' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: 0 }}>
          Руководители и студенты
        </h1>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по студенту, руководителю или теме..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '48px',
              paddingRight: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--color-brand-blue)',
              outline: 'none',
            }}
          />
        </div>

        <button
          style={{
            height: '44px',
            padding: '0 16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-brand-blue)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Все этапы
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        <button
          style={{
            height: '44px',
            padding: '0 16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-brand-blue)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Группа
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        <button
          style={{
            width: '44px',
            height: '44px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-brand-blue)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </button>
      </div>

      {/* Supervisors List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {initialSupervisors.map((sup) => {
          const isExpanded = expandedSupervisorId === sup.id;
          return (
            <div
              key={sup.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
              }}
            >
              {/* Supervisor Header Accordion */}
              <div
                onClick={() => toggleSupervisor(sup.id)}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{sup.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{sup.degree}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', color: '#64748B', marginRight: '12px' }}>
                      Нагрузка: {sup.loadCurrent} / {sup.loadMax} студентов
                    </span>
                    <div style={{ display: 'inline-block', width: '80px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', verticalAlign: 'middle', overflow: 'hidden' }}>
                      <div style={{ width: `${(sup.loadCurrent / sup.loadMax) * 100}%`, height: '100%', backgroundColor: '#4D6F91', borderRadius: '3px' }} />
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: sup.statusType === 'green' ? '#EDF5EF' : '#F7F2E8',
                      color: sup.statusType === 'green' ? '#35654B' : '#82652E',
                    }}
                  >
                    {sup.statusText}
                  </span>
                </div>
              </div>

              {/* Students Table inside Accordion */}
              {isExpanded && sup.students.length > 0 && (
                <div style={{ borderTop: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr 1.2fr 1fr', padding: '12px 24px', backgroundColor: '#F8FAFC', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <div>Студент</div>
                    <div>Группа</div>
                    <div>Тема диплома</div>
                    <div>Этап</div>
                    <div style={{ textAlign: 'right' }}>Прогресс</div>
                  </div>

                  {sup.students.map((st) => {
                    const isSelected = selectedStudent?.id === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudent(st)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.5fr 1fr 2fr 1.2fr 1fr',
                          padding: '16px 24px',
                          alignItems: 'center',
                          borderTop: '1px solid #F1F5F9',
                          backgroundColor: isSelected ? '#F1F5F9' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>{st.name}</div>
                        <div style={{ fontSize: '14px', color: '#64748B' }}>{st.group}</div>
                        <div style={{ fontSize: '14px', color: 'var(--color-brand-blue)' }}>{st.topic}</div>
                        <div>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#EDF5EF', color: '#35654B', fontSize: '13px', fontWeight: 600 }}>
                            • {st.stage}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{st.progress}%</span>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ padding: '16px 24px', textAlign: 'center', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#4D6F91', cursor: 'pointer' }}>
                      Показать всех студентов ({sup.students.length})
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Student Drawer / Sidebar */}
      {selectedStudent && (
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
          {/* Drawer Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Карточка студента
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: '8px 0 4px 0' }}>
                {selectedStudent.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Группа {selectedStudent.group}</p>
            </div>
            <button
              onClick={() => setSelectedStudent(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                Научный руководитель
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>
                Соколова Елена Викторовна
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                Тема выпускной работы
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>
                {selectedStudent.topic}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                Описание работы
              </div>
              <div style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.5 }}>
                {selectedStudent.description}
              </div>
            </div>

            {/* Status box */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>Текущий этап:</span>
                <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#EDF5EF', color: '#35654B', fontSize: '13px', fontWeight: 600 }}>
                  • {selectedStudent.stage}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>Общий прогресс</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{selectedStudent.progress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${selectedStudent.progress}%`, height: '100%', backgroundColor: '#35654B', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Files list */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
                Прикрепленные файлы ({selectedStudent.files.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedStudent.files.map((file, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4D6F91" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>{file}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <button
              onClick={() => alert('Скачивание архива материалов студента...')}
              style={{
                width: '100%',
                height: '44px',
                backgroundColor: '#EDAC33',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-brand-blue)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Скачать весь архив
            </button>
          </div>
        </div>
      )}
    </div>
  );
};