import React from 'react';
import type { Topic } from '../pages/TopicsCatalogPage';

interface TopicDetailPanelProps {
  topic: Topic;
  onClose: () => void;
  onApply: (topicId: number) => void;
  isApplied: boolean;
  hasAppliedAnywhere: boolean; // Добавили пропс
}

export const TopicDetailPanel: React.FC<TopicDetailPanelProps> = ({
  topic,
  onClose,
  onApply,
  isApplied,
  hasAppliedAnywhere,
}) => {
  const isButtonDisabled = topic.status === 'BUSY' || hasAppliedAnywhere;
  
  let buttonText = 'Выбрать тему';
  if (topic.status === 'BUSY') buttonText = 'Недоступно';
  else if (isApplied) buttonText = '✓ Заявка отправлена';
  else if (hasAppliedAnywhere) buttonText = 'Недоступно (у вас есть заявка)';

  return (
    <div
      style={{
        position: 'fixed', top: '72px', right: 0, width: '480px', height: 'calc(100vh - 72px)',
        backgroundColor: '#FFFFFF', borderLeft: '1px solid #E2E8F0', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', zIndex: 200, overflowY: 'auto',
      }}
    >
      <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
            Детали темы
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-brand-blue)', margin: '8px 0 4px 0', lineHeight: 1.3 }}>
            {topic.title}
          </h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', backgroundColor: topic.status === 'FREE' ? '#FEF3C7' : '#F1F5F9', color: topic.status === 'FREE' ? '#92400E' : '#475569' }}>
            • {topic.status === 'FREE' ? 'СВОБОДНО' : 'ЗАНЯТО'}
          </span>
          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', backgroundColor: '#F1F5F9', color: '#475569' }}>
            {topic.tag}
          </span>
        </div>

        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>Описание темы</h4>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{topic.description}</p>
        </div>

        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>Научный руководитель</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={topic.supervisor.avatar} alt={topic.supervisor.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>{topic.supervisor.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{topic.supervisor.degree}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <button
          onClick={() => onApply(topic.id)}
          disabled={isButtonDisabled}
          style={{
            width: '100%', height: '44px', backgroundColor: isButtonDisabled ? '#F1F5F9' : 'var(--color-accent-yellow)',
            border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, color: isButtonDisabled ? '#94A3B8' : 'var(--color-brand-blue)',
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};