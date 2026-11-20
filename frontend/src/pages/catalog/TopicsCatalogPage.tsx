import React, { useEffect, useState } from 'react';
import { fetchTopics } from '../../shared/api/topics';
import type { Topic } from '../../entities/topic/types';
import './TopicsCatalogPage.css';

interface TopicsCatalogPageProps {
  appliedTopicId: number | null;
  onApply: (topicId: number) => void;
}

export const TopicsCatalogPage: React.FC<TopicsCatalogPageProps> = ({ appliedTopicId, onApply }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Загрузка тем...</div>;
  }

  return (
    <div>
      <div className="catalog-header">
        <h1 className="catalog-title">Каталог тем ВКР</h1>
        <p className="catalog-subtitle">Выберите подходящую тему для вашей работы.</p>
      </div>

      <div className="catalog-list">
        {topics.map((topic) => {
          const isApplied = appliedTopicId === topic.id;
          const isDisabled = appliedTopicId !== null || !topic.is_free;

          return (
            <div key={topic.id} className="topic-card">
              <div className="topic-info">
                <span className="topic-tag">{topic.is_free ? 'СВОБОДНО' : 'ЗАНЯТО'}</span>
                <h3 className="topic-name">{topic.title}</h3>
                <p className="topic-desc">{topic.description}</p>
              </div>

              <div className="topic-actions">
                <div>
                  <div className="topic-supervisor">{topic.supervisor_name}</div>
                  <div className="topic-supervisor-deg">{topic.supervisor_degree}</div>
                </div>
                <button
                  className="btn-apply"
                  disabled={isDisabled}
                  onClick={() => onApply(topic.id)}
                >
                  {isApplied ? '✓ Заявка отправлена' : !topic.is_free ? 'Недоступно' : isDisabled ? 'Недоступно' : 'Подать заявку'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};