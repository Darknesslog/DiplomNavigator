import { ArrowLeft, Check, ChevronRight, Clock, FileText, Circle } from 'lucide-react';
import { useState } from 'react';
import type { Stage, StudentData } from '../../entities/student/student';
import { Heading, StatusBadge, shortName } from './StudentComponents';
import './StudentStagesPage.css';
function isOverdue(stage: Stage) {
    const [day, month, year] = stage.date.split('.').map(Number);
    const deadline = new Date(year, month - 1, day + 1);
    return stage.status === 'current' && deadline.getTime() <= Date.now();
}

function StageDetails({ stage: s }: {
    stage: Stage;
}) {
    return <article className="st-card st-stage-detail">
        <h2>Детали этапа
        </h2>
        <small>НАЗВАНИЕ ЭТАПА
        </small>
        <h3>
            {s.title}
        </h3>
        <div className="st-meta">
            <span className="st-meta-item">СТАТУС
                <StatusBadge status={s.status}/>
            </span>
            <span className="st-meta-item">ДАТА НАЧАЛА
                <strong>
                    {s.start ?? '—'}
                </strong>
            </span>
        </div>
        <small>СРОК ЗАВЕРШЕНИЯ
        </small>
        <p className={isOverdue(s) ? "st-overdue" : undefined}>
            {s.date}
        </p>
        <small>ОПИСАНИЕ ЭТАПА
        </small>
        <p>
            {s.description}
        </p>
        <small>КОММЕНТАРИЙ РУКОВОДИТЕЛЯ
        </small>
        <p>
            {s.comment ?? 'Комментариев пока нет'}
        </p>
        <small>ФАЙЛЫ
        </small>
        {s.files.length ? s.files.map(f => <p key={f}>
            {f}
        </p>) : <div className="st-empty">
            <FileText />Документы отсутствуют
        </div>}
    </article>;
}
export function StudentStagesPage({ data, navigate }: {
    data: StudentData;
    navigate: (p: string) => void;
}) {
    const [id, setId] = useState(data.stages.find(s => s.status === 'current')?.id);
    const stage = data.stages.find(s => s.id === id);
    const topic = data.topics.find(t => t.id === data.workTopicId);
    return <>
        <button className="st-link" onClick={() => navigate('my-work')}>
            <ArrowLeft size={16}/>Вернуться к разделу «Моя работа»
        </button>
        <Heading title="Этапы ВКР"/>
        {topic && <div className="st-card st-meta st-stage-summary">
            <span className="st-meta-item">Тема
                <strong>«
                    {topic.title}»
                </strong>
            </span>
            <span className="st-meta-item">Научный руководитель
                <strong>
                    {shortName(topic.supervisor)}
                </strong>
            </span>
            <span className="st-meta-item">Направление
                <strong>
                    {topic.direction}
                </strong>
            </span>
            <span className="st-meta-item">Выполнено
                <strong>
                    {data.stages.filter(s => s.status === 'done').length} из {data.stages.length}
                </strong>
            </span>
        </div>}
        <div className="st-stage-grid">
            <div className="st-stage-list">
                {data.stages.map(stageItem => {
                    const Marker = stageItem.status === 'done' ? Check
                        : stageItem.status === 'waiting' ? Clock : Circle;

                    return (
                        <button
                            key={stageItem.id}
                            className={`st-card st-stage-row ${id === stageItem.id ? 'selected' : ''}`}
                            disabled={stageItem.status === 'locked'}
                            onClick={() => setId(stageItem.id)}
                        >
                            <span className={`st-stage-marker st-${stageItem.status}`}>
                                <Marker size={16} />
                            </span>
                            <div className="st-stage-copy">
                                <strong>{stageItem.title}</strong>
                                <p>{stageItem.status === 'done' ? '' : 'Срок: '}{stageItem.date}</p>
                                {stageItem.status === 'current' && <small>{stageItem.description}</small>}
                            </div>
                            <StatusBadge status={stageItem.status} />
                            <ChevronRight size={18} />
                        </button>
                    );
                })}
            </div>
            {stage && <StageDetails stage={stage}/>}
        </div>
    </>;
}
