import { ArrowRight, Bell, Check } from 'lucide-react';
import type { StudentData } from '../../entities/student/student';
import { Heading, StatusBadge, shortName } from './StudentComponents';
import './StudentWorkPage.css';
export function StudentWorkPage({ data, navigate }: {
    data: StudentData;
    navigate: (p: string) => void;
}) {
    const topic = data.topics.find(t => t.id === data.workTopicId);
    const done = data.stages.filter(s => s.status === 'done').length;
    const current = data.stages.find(s => s.status === 'current');
    return <>
        <Heading title="Моя работа"/>
        {!topic ? <div className="st-card st-empty">Тема ещё не закреплена
            <button className="st-outline" onClick={() => navigate('catalog')}>Каталог тем
            </button>
        </div> : <>
            <article className="st-card st-work-topic">
                <small>ТЕМА ВКР
                </small>
                <h2>«
                    {topic.title}»
                </h2>
                <div className="st-meta">
                    <span className="st-meta-item">Направление
                        <strong>
                            {topic.direction}
                        </strong>
                    </span>
                    <span className="st-meta-item">Научный руководитель
                        <strong className="st-blue">
                            {shortName(topic.supervisor)}
                        </strong>
                    </span>
                    <span className="st-meta-item">Статус
                        <StatusBadge status="approved"/>
                    </span>
                </div>
            </article>
            <div className="st-two">
                <article className="st-card st-progress">
                    <h3>Прогресс ВКР
                    </h3>
                    <p>Выполнено этапов:
                        {done} из
                        {data.stages.length}
                    </p>
                    <div className="st-progress-track" role="progressbar" aria-valuenow={done} aria-valuemax={data.stages.length}>
                        <div style={{ width: `${data.stages.length ? done / data.stages.length * 100 : 0}%` }}/>
                    </div>
                    <span className="st-green">
                        <Check size={16}/> {done === data.stages.length ? "Все этапы выполнены" : "Работа в процессе"}
                    </span>
                </article>
                {current && <article className="st-card">
                    <div className="st-between">
                        <h3>Текущий этап
                        </h3>
                        <small>Срок:
                            {current.date}
                        </small>
                    </div>
                    <h3>
                        {current.title}
                    </h3>
                    <p>
                        {current.description}
                    </p>
                    <button className="st-primary" onClick={() => navigate('stages')}>Перейти к этапам ВКР
                        <ArrowRight size={18}/>
                    </button>
                </article>}
            </div>
            <h3>Важная информация
            </h3>
            <div className="st-card st-empty">
                <Bell />{data.notifications.length ? data.notifications.map(notification => <p key={notification.id}>{notification.title}</p>) : "Пока нет важных уведомлений"}
            </div>
        </>}
    </>;
}
